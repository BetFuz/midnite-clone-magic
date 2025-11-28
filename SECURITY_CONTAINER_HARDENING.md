# Container Security Hardening

## Overview
Betfuz backend services run in hardened Docker containers following security best practices: non-root users, distroless base images, and automated vulnerability scanning in CI/CD pipelines.

---

## Container Hardening Principles

1. **Non-Root User**: All containers run as non-privileged users (UID 1000)
2. **Distroless Images**: Minimal attack surface using Google Distroless Node images
3. **Vulnerability Scanning**: Trivy scans in CI/CD gate deployments
4. **Dependency Auditing**: Snyk monitors Node dependencies for CVEs
5. **Image Signing**: Cosign signatures verify image provenance

---

## Distroless Base Images

### Why Distroless?
- No shell (`/bin/sh`, `/bin/bash`) → prevents reverse shell attacks
- No package managers (`apt`, `yum`) → no runtime package installation
- Minimal dependencies → smaller attack surface
- Security-focused: Only runtime dependencies included

### Supported Node.js Versions
```dockerfile
# Distroless Node.js images from Google
gcr.io/distroless/nodejs20-debian12:latest        # Node 20 LTS
gcr.io/distroless/nodejs20-debian12:nonroot       # Node 20 with UID 65532
gcr.io/distroless/nodejs20-debian12:debug         # Includes busybox for debugging
```

---

## Hardened Dockerfiles

### API Gateway (NestJS)

```dockerfile
# backend/apps/api-gateway/Dockerfile
# ==========================================
# Stage 1: Build Stage (with build tools)
# ==========================================
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs

# Build the application
RUN npx nx build api-gateway --prod

# Remove dev dependencies
RUN npm prune --production

# ==========================================
# Stage 2: Runtime Stage (Distroless)
# ==========================================
FROM gcr.io/distroless/nodejs20-debian12:nonroot

# Set working directory
WORKDIR /app

# Copy only production dependencies from builder
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nonroot:nonroot /app/dist/apps/api-gateway ./

# Set non-root user (distroless nonroot = UID 65532)
USER nonroot

# Expose port
EXPOSE 3000

# Health check (Node.js built-in, no shell needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]

# Start application
CMD ["main.js"]
```

### USSD Microservice

```dockerfile
# backend/apps/ussd-microservice/Dockerfile
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

RUN npm ci --ignore-scripts

COPY apps/ussd-microservice ./apps/ussd-microservice
COPY libs ./libs

RUN npx nx build ussd-microservice --prod
RUN npm prune --production

FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist/apps/ussd-microservice ./

USER nonroot

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]

CMD ["main.js"]
```

### Treasury Service (with Tron/Crypto)

```dockerfile
# backend/apps/treasury-service/Dockerfile
FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY nx.json tsconfig.base.json ./

RUN npm ci --ignore-scripts

COPY apps/treasury-service ./apps/treasury-service
COPY libs ./libs

RUN npx nx build treasury-service --prod
RUN npm prune --production

FROM gcr.io/distroless/nodejs20-debian12:nonroot

WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/dist/apps/treasury-service ./

USER nonroot

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s \
  CMD ["/nodejs/bin/node", "-e", "require('http').get('http://localhost:3002/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]

CMD ["main.js"]
```

---

## Docker Compose (Production)

```yaml
# backend/docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: betfuz-postgres-prod
    restart: unless-stopped
    user: postgres
    environment:
      POSTGRES_USER: betfuz
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
      POSTGRES_DB: betfuz
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    secrets:
      - db_password
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U betfuz']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - betfuz-backend

  redis:
    image: redis:7-alpine
    container_name: betfuz-redis-prod
    restart: unless-stopped
    user: redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - betfuz-backend

  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    container_name: betfuz-rabbitmq-prod
    restart: unless-stopped
    user: rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: betfuz
      RABBITMQ_DEFAULT_PASS_FILE: /run/secrets/rabbitmq_password
    ports:
      - '5672:5672'
      - '15672:15672'
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    secrets:
      - rabbitmq_password
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 10s
      retries: 5
    networks:
      - betfuz-backend

  api-gateway:
    build:
      context: .
      dockerfile: apps/api-gateway/Dockerfile
    container_name: betfuz-api-gateway
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://betfuz:${DB_PASSWORD}@postgres:5432/betfuz
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    secrets:
      - db_password
    depends_on:
      - postgres
      - redis
      - rabbitmq
    networks:
      - betfuz-backend
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

  ussd-microservice:
    build:
      context: .
      dockerfile: apps/ussd-microservice/Dockerfile
    container_name: betfuz-ussd
    restart: unless-stopped
    ports:
      - '3001:3001'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://betfuz:${DB_PASSWORD}@postgres:5432/betfuz
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    secrets:
      - db_password
    depends_on:
      - postgres
      - redis
    networks:
      - betfuz-backend
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL

  treasury-service:
    build:
      context: .
      dockerfile: apps/treasury-service/Dockerfile
    container_name: betfuz-treasury
    restart: unless-stopped
    ports:
      - '3002:3002'
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://betfuz:${DB_PASSWORD}@postgres:5432/betfuz
      AWS_REGION: us-east-1
      AWS_KMS_HOT_WALLET_KEY_ID: ${KMS_KEY_ID}
    secrets:
      - db_password
      - aws_credentials
    depends_on:
      - postgres
    networks:
      - betfuz-backend
    read_only: true
    tmpfs:
      - /tmp
    security_opt:
      - no-new-privileges:true
    cap_drop:
      - ALL

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  rabbitmq_data:
    driver: local

secrets:
  db_password:
    file: ./secrets/db_password.txt
  rabbitmq_password:
    file: ./secrets/rabbitmq_password.txt
  aws_credentials:
    file: ./secrets/aws_credentials.json

networks:
  betfuz-backend:
    driver: bridge
```

---

## CI/CD Security Scanning

### GitHub Actions Workflow

```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  trivy-scan:
    name: Trivy Container Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build -t betfuz/api-gateway:${{ github.sha }} \
            -f backend/apps/api-gateway/Dockerfile backend/

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: betfuz/api-gateway:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'  # Fail build on critical/high vulnerabilities

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  snyk-scan:
    name: Snyk Dependency Scan
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high --fail-on=all

      - name: Upload Snyk results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif

  image-signing:
    name: Sign Container Image
    runs-on: ubuntu-latest
    needs: [trivy-scan, snyk-scan]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Cosign
        uses: sigstore/cosign-installer@v3

      - name: Build and push Docker image
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker build -t betfuz/api-gateway:${{ github.sha }} \
            -f backend/apps/api-gateway/Dockerfile backend/
          docker push betfuz/api-gateway:${{ github.sha }}

      - name: Sign container image
        run: |
          cosign sign --key env://COSIGN_KEY betfuz/api-gateway:${{ github.sha }}
        env:
          COSIGN_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
          COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
```

### Trivy Scan Configuration

```yaml
# trivy.yaml
scan:
  ignore-unfixed: false
  severity:
    - CRITICAL
    - HIGH
    - MEDIUM
  
  # Skip specific vulnerabilities (if necessary)
  skip-files:
    - "node_modules/**/test/**"
  
  # Custom policies
  policy: |
    package trivy.policies.custom
    
    deny[msg] {
      input.Vulnerabilities[_].Severity == "CRITICAL"
      msg = "CRITICAL vulnerability found - deployment blocked"
    }
```

### Snyk Configuration

```json
// .snyk
{
  "language-settings": {
    "node": {
      "packageManager": "npm"
    }
  },
  "ignore": {},
  "patch": {},
  "exclude": {
    "global": [
      "node_modules/**"
    ]
  }
}
```

---

## Runtime Security

### AppArmor Profile (Optional)

```bash
# /etc/apparmor.d/docker-betfuz-api-gateway
#include <tunables/global>

profile docker-betfuz-api-gateway flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  # Deny all file writes except /tmp
  deny /app/** w,
  /tmp/** rw,

  # Allow network
  network inet tcp,
  network inet udp,

  # Deny capability except what's needed
  deny capability sys_admin,
  deny capability sys_module,
  capability net_bind_service,
}
```

### SELinux Policy (Optional)

```bash
# Custom SELinux policy for Betfuz containers
# /etc/selinux/targeted/contexts/lxc_contexts
docker-betfuz-api-gateway = system_u:system_r:container_runtime_t:s0
```

---

## Production Deployment Checklist

- [ ] Build all microservice images with distroless base
- [ ] Run Trivy scans on all images (no CRITICAL/HIGH vulnerabilities)
- [ ] Run Snyk dependency audit (no high-severity CVEs)
- [ ] Sign all production images with Cosign
- [ ] Configure Docker daemon to verify signed images only
- [ ] Set up automated nightly Trivy scans
- [ ] Enable Snyk monitoring for runtime dependency tracking
- [ ] Document vulnerability remediation process
- [ ] Train DevOps team on container security best practices

---

## Security Contacts

- **Container Security**: devops@betfuz.com
- **Vulnerability Reports**: security@betfuz.com
- **24/7 Incident Hotline**: +234-XXX-XXX-XXXX
