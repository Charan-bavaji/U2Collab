# U2Collab — Jenkins CI/CD Pipeline with Docker

End-to-end CI/CD pipeline for the U2Collab MERN application using Jenkins, Docker, and AWS EC2. Every push to the `main` branch automatically builds Docker images, pushes them to DockerHub, deploys to EC2, and sends email notifications.

---

## 🗺️ Pipeline Overview

```
Developer pushes code to GitHub (main branch)
            │
            ▼
    Jenkins detects change (GitHub webhook / polling)
            │
            ▼
    ┌───────────────────────────────────┐
    │         Jenkins Pipeline          │
    │                                   │
    │  Stage 1: Checkout Code           │
    │  Stage 2: Build Docker Images     │
    │  Stage 3: Push to DockerHub       │
    │  Stage 4: Deploy to EC2           │
    │  Stage 5: Email Notification      │
    └───────────────────────────────────┘
            │
            ▼
    Application live on EC2 (port 5173 → client, 5000 → server)
```

---

## 🏗️ Infrastructure

| Component | Details |
|-----------|---------|
| **CI Server** | Jenkins on AWS EC2 |
| **Instance Type** | c7i-flex.large |
| **OS** | Amazon Linux 2023 |
| **Elastic IP** | 3.221.197.232 |
| **Jenkins Port** | 8080 |
| **DockerHub** | `charanbavaji/u2collab-client`, `charanbavaji/u2collab-server` |

---

## 📦 Docker Architecture

### Client Dockerfile (Multi-stage)
```dockerfile
# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# VITE vars must be passed as build args — they are baked in at build time
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

COPY . .
RUN npm run build

# Stage 2 — Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Server Dockerfile (Single-stage)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

> **Key learning:** Vite env vars (`VITE_*`) must be present at **build time** as `--build-arg`, not just at runtime. They get compiled into the static bundle during `npm run build`.

---

## 🔧 Jenkins Pipeline (Jenkinsfile)

```groovy
pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME    = 'charanbavaji'
        CLIENT_IMAGE          = "${DOCKERHUB_USERNAME}/u2collab-client"
        SERVER_IMAGE          = "${DOCKERHUB_USERNAME}/u2collab-server"
        EC2_HOST              = '3.221.197.232'
        EC2_USER              = 'ec2-user'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Charan-bavaji/U2Collab.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                withCredentials([
                    string(credentialsId: 'vite-api-url',    variable: 'VITE_API_URL'),
                    string(credentialsId: 'vite-socket-url', variable: 'VITE_SOCKET_URL')
                ]) {
                    sh """
                        docker build \
                          --build-arg VITE_API_URL=${VITE_API_URL} \
                          --build-arg VITE_SOCKET_URL=${VITE_SOCKET_URL} \
                          -t ${CLIENT_IMAGE}:v${BUILD_NUMBER} \
                          -t ${CLIENT_IMAGE}:latest \
                          ./client

                        docker build \
                          -t ${SERVER_IMAGE}:v${BUILD_NUMBER} \
                          -t ${SERVER_IMAGE}:latest \
                          ./server
                    """
                }
            }
        }

        stage('Push to DockerHub') {
            steps {
                sh """
                    echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_CREDENTIALS_USR} --password-stdin

                    docker push ${CLIENT_IMAGE}:v${BUILD_NUMBER}
                    docker push ${CLIENT_IMAGE}:latest

                    docker push ${SERVER_IMAGE}:v${BUILD_NUMBER}
                    docker push ${SERVER_IMAGE}:latest
                """
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY'),
                    file(credentialsId: 'server-env-file', variable: 'ENV_FILE')
                ]) {
                    sh """
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no \
                            ${ENV_FILE} ${EC2_USER}@${EC2_HOST}:/home/ec2-user/server.env

                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            docker pull ${CLIENT_IMAGE}:latest
                            docker pull ${SERVER_IMAGE}:latest

                            docker stop u2collab-client u2collab-server 2>/dev/null || true
                            docker rm   u2collab-client u2collab-server 2>/dev/null || true

                            docker run -d \
                              --name u2collab-server \
                              --env-file /home/ec2-user/server.env \
                              -p 5000:5000 \
                              ${SERVER_IMAGE}:latest

                            docker run -d \
                              --name u2collab-client \
                              -p 5173:80 \
                              ${CLIENT_IMAGE}:latest
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            mail to: 'charanbavaji@gmail.com',
                 subject: "✅ U2Collab Build #${BUILD_NUMBER} — SUCCESS",
                 body: """
                    Build #${BUILD_NUMBER} deployed successfully.

                    Images pushed:
                    - ${CLIENT_IMAGE}:v${BUILD_NUMBER}
                    - ${SERVER_IMAGE}:v${BUILD_NUMBER}

                    App live at: http://${EC2_HOST}:5173
                    Jenkins: ${BUILD_URL}
                 """
        }
        failure {
            mail to: 'charanbavaji@gmail.com',
                 subject: "❌ U2Collab Build #${BUILD_NUMBER} — FAILED",
                 body: """
                    Build #${BUILD_NUMBER} failed.
                    Check Jenkins: ${BUILD_URL}
                 """
        }
        always {
            sh 'docker logout'
        }
    }
}
```

---

## 🔑 Jenkins Credentials Setup

| Credential ID | Type | Used For |
|--------------|------|----------|
| `dockerhub-credentials` | Username & Password | DockerHub login |
| `ec2-ssh-key` | SSH Private Key | SSH into EC2 |
| `server-env-file` | Secret File | Server `.env` file with MONGO_URI, OAuth keys |
| `vite-api-url` | Secret Text | `VITE_API_URL` build arg |
| `vite-socket-url` | Secret Text | `VITE_SOCKET_URL` build arg |

> All secrets are stored in **Jenkins Credentials Manager** — never hardcoded in Jenkinsfile.

---

## 🚨 Key Challenges & Solutions

### 1. Vite Build-time vs Runtime Variables
**Problem:** Client container was running but API calls were failing — `VITE_API_URL` was undefined.

**Root cause:** Vite compiles env vars at build time into the static bundle. Passing them as `docker run -e` at runtime has no effect.

**Fix:** Pass them as `--build-arg` during `docker build` so they're baked into the compiled JS bundle.

---

### 2. MongoDB URI Quoting in .env
**Problem:** `docker run --env-file` was failing to parse the MONGO_URI.

**Root cause:** Special characters in the URI were breaking shell parsing.

**Fix:** Wrap the URI value in single quotes inside the `.env` file and use `--env-file` flag instead of `-e`.

---

### 3. Google & GitHub OAuth Rejecting Raw IP
**Problem:** OAuth providers rejected `http://3.221.197.232` as a callback URL.

**Fix:** Used `nip.io` — `http://3.221.197.232.nip.io` — which maps to the same IP but looks like a domain, accepted by OAuth providers.

---

### 4. SSH Key Permissions
**Problem:** SSH connection to EC2 was failing with "unprotected private key" error.

**Fix:** `chmod 400 key.pem` — SSH requires private keys to be readable only by owner.

---

## 📊 Pipeline Results

| Stage | Status |
|-------|--------|
| Checkout | ✅ |
| Build Docker Images | ✅ |
| Push to DockerHub | ✅ |
| Deploy to EC2 | ✅ |
| Email Notification | ✅ |

**DockerHub Images:**
- `charanbavaji/u2collab-client:latest`
- `charanbavaji/u2collab-server:latest`

---

## 📚 Tools & Technologies Used

| Tool | Purpose |
|------|---------|
| Jenkins | CI/CD automation |
| Docker | Containerization |
| DockerHub | Image registry |
| AWS EC2 | Deployment server |
| GitHub | Source control & webhook trigger |
| nginx | Serve React build inside container |
| Amazon Linux 2023 | Server OS |

---

## 👨‍💻 Author

**Charan Bavaji**
- GitHub: [github.com/Charan-bavaji](https://github.com/Charan-bavaji)
- LinkedIn: [linkedin.com/in/charan-bavaji](https://www.linkedin.com/in/charan-r-884217221/)
- DockerHub: [hub.docker.com/u/charanbavaji](https://hub.docker.com/u/charanbavaji)
