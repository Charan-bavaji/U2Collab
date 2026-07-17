# Phase A — Two-Instance CI/CD Split

**Status:** Complete
**Date:** July 15, 2026
**Goal:** Separate the Jenkins build server from the application runtime, so CI (build) and CD (deploy) no longer share the same EC2 instance.

## Background

The original pipeline ran entirely on a single EC2 instance (`c7i-flex.large`) — Jenkins built the Docker images, pushed them to DockerHub, and then deployed the containers locally on the same box via `docker compose up`. This worked, but conflated two responsibilities that should be independent: building software and running software. Phase A splits these into two purpose-built instances.

## Architecture

| | Jenkins (build) | Deploy (runtime) |
|---|---|---|
| Instance type | c7i-flex.large | t2.small |
| Role | Checkout, build images, push to DockerHub | Pull images, run containers |
| Docker usage | `docker build`, `docker push` | `docker compose pull/up` |
| Elastic IP | No (dynamic IP after Phase A) | Yes — `3.221.197.232` |

The Elastic IP that originally belonged to the single combined instance was **moved from Jenkins to Deploy**, not re-provisioned. This kept the existing `3.221.197.232.nip.io` OAuth redirect domain valid without any changes to the Google/GitHub OAuth app configuration — only the *machine* behind the IP changed, not the IP itself.

## Setup Steps

1. **Provisioned Deploy instance** (t2.small, Amazon Linux 2023, matching Jenkins' OS) with inbound rules for SSH (22), client (5173), server (5000).
2. **Installed Docker Engine + Compose plugin** on Deploy — no build tooling needed, since Deploy never builds anything.
3. **Generated a dedicated SSH keypair** on the Jenkins instance (`jenkins_deploy_key`), scoped only to this automation purpose — separate from personal login keys, so a compromise here can't grant broader access.
4. **Added the public key** to Deploy's `~/.ssh/authorized_keys` and verified passwordless SSH from Jenkins to Deploy.
5. **Copied `docker-compose.yml` and secrets** to Deploy, under `/opt/u2collab/` and `/opt/u2collab-secrets/` respectively — mirroring the directory convention used in the original single-instance setup.
6. **Installed the SSH Agent plugin** in Jenkins (Manage Jenkins → Plugins), restarted Jenkins to register the new `sshagent` pipeline step.
7. **Added an SSH-Username-with-private-key credential** in Jenkins (`deploy-ssh-key`) holding the private half of the keypair.
8. **Reassociated the Elastic IP** from Jenkins to Deploy.
9. **Rewrote the Jenkinsfile's Deploy stage** to SSH into Deploy and run the compose lifecycle remotely instead of locally:

```groovy
stage('Deploy') {
    steps {
        sshagent(credentials: ['deploy-ssh-key']) {
            sh """
                ssh -o StrictHostKeyChecking=no ec2-user@3.221.197.232 '
                    cd /opt/u2collab &&
                    docker compose down --remove-orphans || true &&
                    docker compose pull &&
                    docker compose up -d
                '
            """
        }
    }
}
```

10. Verified the full pipeline end-to-end: checkout → build client/server images → push to DockerHub → SSH deploy on the remote instance → site confirmed live and OAuth-functional.

## Challenges Encountered

- **Keypair generated on the wrong instance initially** — created on Deploy instead of Jenkins. Caught during connection testing, deleted, and regenerated on the correct box (Jenkins, since it's the one initiating the connection and needing the private key).
- **Terminal confusion between the two instances** — near-identical shell sessions led to running a command against the wrong host. Fixed by relabeling shell prompts (`export PS1=...`) to make the active instance unambiguous at a glance.
- **`sshagent` step not found** — the SSH Agent plugin was only in "Available," never actually installed. Installing without checking the restart option meant the new pipeline DSL step never registered until Jenkins was manually restarted.
- **Wrong Jenkins credential type** — the `deploy-ssh-key` credential was originally created as "Username with password" instead of "SSH Username with private key." Same ID, wrong type — `sshagent` couldn't locate a usable credential despite the ID matching. Required deleting and recreating with the correct credential kind.
- **Stale `known_hosts` entries after EIP reassociation** — since `3.221.197.232` previously pointed at the Jenkins box itself, moving it to Deploy meant the same IP now had a different host identity, triggering SSH host-key mismatch warnings until cleared with `ssh-keygen -R`.

## Result

Jenkins and the application runtime are now fully decoupled. The pipeline builds on one instance and deploys to another purely over SSH, with the Elastic IP and OAuth configuration preserved through the transition. This also lays the groundwork for Phase B (rollback) and Phase C (Prometheus/Grafana monitoring), both of which depend on having distinct, addressable build and deploy targets.