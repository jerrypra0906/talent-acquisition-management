# Environment Variables Setup Instructions

## Problem: ".env file not found" Error

Docker images don't include `.env` files for security reasons. You must pass environment variables directly to containers.

## Solution: Pass Environment Variables to Docker

### Option 1: Docker Compose (Recommended for EC2)

1. **Use `docker-compose.production.yml`** (already created for you)
2. **Create `.env` file** in the same directory (only for docker-compose variables):
   ```
   REDIS_PASSWORD=your-strong-redis-password-here
   ```
3. **Update DATABASE_URL** in `docker-compose.production.yml` with your RDS endpoint
4. **Run**:
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

### Option 2: Docker Run (Manual)

```bash
docker run -d \
  --name tas_backend \
  -p 4000:4000 \
  -e NODE_ENV=production \
  -e PORT=4000 \
  -e DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db \
  -e JWT_SECRET=29385124500de9cdb28814fe98432399bc9aead16ab4301d1f52c372974705fe \
  -e JWT_REFRESH_SECRET=9b038281cc9a904f8340f249d1155a7aedb22fea074308c988c5fad7110c1c17 \
  -e ENCRYPTION_KEY=537b7ba9c2f2442cffa6e86356433b52 \
  -e REDIS_URL=redis://:password@redis:6379 \
  -e REDIS_PASSWORD=your-redis-password \
  -e CORS_ORIGIN=https://admin.kpn-tas.gamasap.com,https://careers.kpn-tas.gamasap.com \
  -e CORS_CREDENTIALS=true \
  -e FRONTEND_URL=https://admin.kpn-tas.gamasap.com \
  -e CANDIDATE_PORTAL_URL=https://careers.kpn-tas.gamasap.com \
  -e API_BASE_URL=https://api.kpn-tas.gamasap.com \
  jerrypratama/tas-backend:latest
```

### Option 3: ECS Task Definition

Add all environment variables in the ECS Task Definition JSON (see AWS_DEPLOYMENT_GUIDE.md).

---

## Critical: ENCRYPTION_KEY Must Be Exactly 32 Characters

The error you saw was because `ENCRYPTION_KEY` was missing or not exactly 32 characters.

**Use this value** (already generated for you):
```
ENCRYPTION_KEY=537b7ba9c2f2442cffa6e86356433b52
```

**Verify**: This is exactly 32 characters (hex string).

---

## Files Created for You

1. **`backend/.env.production`** - Template with all variables (for reference)
2. **`docker-compose.production.yml`** - Ready-to-use Docker Compose file with all environment variables
3. **`AWS_DEPLOYMENT_GUIDE.md`** - Complete deployment guide

---

## Quick Start

1. **Copy `docker-compose.production.yml`** to your AWS server
2. **Update DATABASE_URL** with your RDS endpoint
3. **Update REDIS_URL** if using ElastiCache (or leave for Docker Redis)
4. **Create `.env` file** with `REDIS_PASSWORD=...` (only if using Docker Redis)
5. **Run**: `docker-compose -f docker-compose.production.yml up -d`

That's it! All environment variables are now passed to containers.

---

**Note**: The `.env.production` file is for reference only. The actual environment variables are in `docker-compose.production.yml` (or ECS task definition).

