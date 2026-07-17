# U2Collab CI/CD — Phase B: Health-Gated Deploys & Automated Rollback

This document covers the two-instance CI/CD architecture and the rollback mechanism built on top of it. It supersedes the single-instance setup described in the original README — see that file for the earlier build history and initial containerization work.

## Architecture

The pipeline runs across two separate EC2 instances:

| Role | Instance | Notes |
|---|---|---|
| Jenkins (build) | Dynamic IP | Runs Jenkins 2.555.3, builds and pushes images |
| Deploy (runtime) | Elastic IP `3.221.197.232` | Runs the live containers via Docker Compose |

The Elastic IP stayed attached to the Deploy box (not Jenkins) so the `nip.io` domain used for OAuth redirect URIs didn't need to change when the instances were split. Jenkins runs on a dynamic IP that changes on instance stop/start — as a result, the GitHub webhook is not reliable and builds are triggered manually rather than on push. This is a deliberate tradeoff, not an oversight: keeping a webhook in sync with a changing IP wasn't worth the added complexity for this project.

Jenkins never copies files to the Deploy box beyond what it writes at runtime (`.env`, `current-deploy.txt`). `docker-compose.yml` itself is maintained by hand directly on the Deploy box.

## Pipeline stages

1. **Checkout** — pulls the latest commit from `main`
2. **Build Client Image** / **Build Server Image** — builds Docker images, tagged both with the short Git SHA (`GIT_SHA`) and `latest`
3. **Push Images to DockerHub** — pushes both tags for each image
4. **Deploy** — SSHes into the Deploy box, writes `CLIENT_TAG`/`SERVER_TAG` into `.env` (set to the current `GIT_SHA`), then runs `docker compose down --remove-orphans / pull / up -d`
5. **Health Check & Record** — SSHes in again, waits, then curls `GET /api/health` on the running server. Only if this succeeds does it write the current `GIT_SHA` into `/opt/u2collab/current-deploy.txt`

`docker-compose.yml` on the Deploy box references `${CLIENT_TAG:-latest}` / `${SERVER_TAG:-latest}` rather than hardcoded tags, so it always deploys whatever tag Jenkins wrote to `.env` for that run.

## The health check

```javascript
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  if (dbState === 1) {
    return res.status(200).json({ status: 'ok', db: 'connected' })
  }
  return res.status(503).json({ status: 'error', db: 'not connected' })
})
```

This reads Mongoose's existing connection state rather than re-invoking the app's `connectDB()` function. That distinction mattered during development: `connectDB()` calls `process.exit(1)` on connection failure, since it's designed to be called once at startup — reusing it inside a repeatedly-polled health route would risk killing the server on every failed check instead of just reporting unhealthy.

## Rollback mechanism

`current-deploy.txt` on the Deploy box always holds the last Git SHA that passed its health check — never a tag that failed. This works because the health check and the file write are chained with `&&`: if the curl fails, the `echo` that would overwrite the file never runs. The file is therefore always safe to treat as "the last known good deploy," with no need to look further back in history.

If any pipeline stage fails, Jenkins' `post { failure { ... } }` block runs:

```groovy
ssh ec2-user@3.221.197.232 '
    cd /opt/u2collab &&
    LAST_GOOD=$(cat current-deploy.txt) &&
    echo "CLIENT_TAG=$LAST_GOOD" > .env &&
    echo "SERVER_TAG=$LAST_GOOD" >> .env &&
    docker compose down --remove-orphans &&
    docker compose pull &&
    docker compose up -d &&
    sleep 10 &&
    curl -sf http://localhost:5000/api/health
'
```

This re-deploys whatever tag `current-deploy.txt` holds and re-verifies health, then sends a distinct rollback email (separate subject line from a plain failure) so a bad deploy and an auto-recovered deploy are never confused in the inbox.

## Incident walkthrough (test case)

To validate the mechanism, the `/api/health` route was deliberately renamed to `/api/health-broken` and pushed to `main` — a change that builds and starts cleanly but fails the health contract, simulating a real bad deploy.

**Build #19:**
- Checkout → Build → Push → Deploy: all green. The broken route doesn't stop the container from starting, so nothing here catches the problem.
- Health Check & Record: **failed** — `curl -sf .../api/health` returned non-2xx. `current-deploy.txt` was not overwritten.
- `post { failure }` triggered: read `current-deploy.txt` (`089255d`, from build #18), rewrote `.env`, redeployed, re-curled — returned `{"status":"ok","db":"connected"}`.
- Rollback email sent.

**Verification on the Deploy box:**
```
$ cat /opt/u2collab/current-deploy.txt
089255d
$ docker inspect u2collab-server --format '{{.Config.Image}}'
charanbavaji/u2collab-server:089255d
```

Confirmed the live container was running the pre-incident image, not the broken one.

**Build #20** (route reverted, commit `7396c4d`): full pipeline green, `current-deploy.txt` updated to the new tag — confirming the system recovers *forward* cleanly after a rollback, not just backward.

## Known limitations

- **No guard for a missing `current-deploy.txt`.** If it doesn't exist (e.g. very first deploy ever, or the file is deleted), the rollback block's `cat` will fail, so the rollback itself fails on top of the original problem. Not hit in practice since a good deploy has always run first, but worth fixing before treating this as production-grade.
- **Rollback triggers on any pipeline failure, not specifically a health-check failure.** A build error (e.g. a syntax error caught at compile time) would also trigger the `post { failure }` rollback block, even though nothing was actually deployed incorrectly in that case. Harmless today — it just redeploys what's already running — but not a precise signal.
- **`docker-compose.yml` is hand-maintained on the Deploy box**, not version-controlled or pushed by Jenkins. Fine for a project this size; would need to change (e.g. `scp`'d from the repo on each deploy) if the compose file started changing more frequently or needed audit history.
- **GitHub webhook is disabled** in favor of manual build triggers, due to Jenkins running on a dynamic IP. A fix (Elastic IP for Jenkins, or a static endpoint in front of it) is possible but out of scope for now.