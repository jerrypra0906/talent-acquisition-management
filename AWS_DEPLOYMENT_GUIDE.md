# AWS Deployment Guide - KPN Talent Acquisition System

## Overview

This guide helps your deployment team deploy the application to AWS using Docker images from Docker Hub.

**Docker Hub Images:**
- `jerrypratama/tas-backend:latest`
- `jerrypratama/tas-frontend:latest`
- `jerrypratama/tas-candidate-portal:latest`

---

## Prerequisites

- AWS account with EC2/ECS access
- Docker installed on deployment server
- Access to RDS PostgreSQL (or create one)
- Domain names configured (optional but recommended)

---

## Step 1: Setup Database (RDS PostgreSQL)

### 1.1 Create RDS PostgreSQL Instance

1. Go to AWS Console → RDS → Create database
2. Choose **PostgreSQL 15**
3. Configure:
   - **DB instance identifier**: `tas-db-production`
   - **Master username**: `tasadmin`
   - **Master password**: `tasadminkpn@2025`
   - **Database name**: `tas_db`
   - **Instance class**: `db.t3.medium` or larger
   - **Storage**: 50GB minimum with auto-scaling
   - **VPC**: Same as your application servers
   - **Public access**: **NO** (private only)
   - **Security group**: Allow port 5432 from application servers only
   - **Backup retention**: 7 days minimum

4. **Note the endpoint** (e.g., `tas-db-production.xxxxx.us-east-1.rds.amazonaws.com`)

### 1.2 Update DATABASE_URL

In your `.env` file, update:
```
DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

Replace `<RDS-ENDPOINT>` with your actual RDS endpoint.

---

## Step 2: Run Database Migrations

### Option A: Using EC2/Bastion Host

1. **SSH to a server with access to RDS**
2. **Install Node.js** (if not installed):
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **Clone repository** (or copy migration files):
   ```bash
   git clone https://github.com/jerrypra0906/talent-acquisition-management.git
   cd talent-acquisition-management/backend
   ```

4. **Install dependencies**:
   ```bash
   npm ci --omit=dev
   ```

5. **Set DATABASE_URL**:
   ```bash
   export DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db
   ```

6. **Run migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Option B: Using Docker Container (One-time migration run)

1. **Pull backend image** (or use already pulled image):
   ```bash
   docker pull jerrypratama/tas-backend:latest
   ```

2. **Run migrations in container**:
   ```bash
   docker run --rm \
     -e DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db \
     jerrypratama/tas-backend:latest \
     sh -c "npx prisma generate && npx prisma migrate deploy"
   ```

---

## Step 3: Create Production User

### Option A: Using Script on Server

1. **On the same server from Step 2**, create the production user:
   ```bash
   cd talent-acquisition-management/backend
   export DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db
   node scripts/createProductionUser.js
   ```

### Option B: Using Docker Container

```bash
docker run --rm \
  -e DATABASE_URL=postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db \
  jerrypratama/tas-backend:latest \
  node scripts/createProductionUser.js
```

**Expected Output:**
```
✅ Production user created successfully!
📋 User Credentials:
   Name: Jerry Hakim
   Email: jerry.hakim@energi-up.com
   Password: DefaultPassword123!
   Role: SUPER_ADMIN
```

---

## Step 4: Setup Redis (Optional but Recommended)

### Option A: AWS ElastiCache

1. Create ElastiCache Redis cluster
2. Note the endpoint and password
3. Update in `.env`:
   ```
   REDIS_URL=redis://:<password>@<elasticache-endpoint>:6379
   REDIS_PASSWORD=<password>
   ```

### Option B: Docker Redis Container

If running on same server, use docker-compose (see Step 5).

---

## Step 5: Deploy Application Containers

### Option A: Using Docker Compose (EC2)

1. **Create `docker-compose.yml` on your EC2 server**:

```yaml
version: '3.8'

services:
  backend:
    image: jerrypratama/tas-backend:latest
    container_name: tas_backend
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      # Copy all variables from .env.production file here
      NODE_ENV: production
      PORT: 4000
      DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      REDIS_PASSWORD: ${REDIS_PASSWORD:-your-redis-password}
      JWT_SECRET: 29385124500de9cdb28814fe98432399bc9aead16ab4301d1f52c372974705fe
      JWT_REFRESH_SECRET: 9b038281cc9a904f8340f249d1155a7aedb22fea074308c988c5fad7110c1c17
      ENCRYPTION_KEY: 537b7ba9c2f2442cffa6e86356433b52
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      FRONTEND_URL: https://admin.kpn-tas.gamasap.com
      CANDIDATE_PORTAL_URL: https://careers.kpn-tas.gamasap.com
      API_BASE_URL: https://api.kpn-tas.gamasap.com
      CORS_ORIGIN: https://admin.kpn-tas.gamasap.com,https://careers.kpn-tas.gamasap.com
      CORS_CREDENTIALS: "true"
      RATE_LIMIT_WINDOW_MS: 900000
      RATE_LIMIT_MAX_REQUESTS: 100
      RATE_LIMIT_LOGIN_MAX: 200
      ACCOUNT_LOCKOUT_THRESHOLD: 5
      MAX_FILE_SIZE: 10485760
      ALLOWED_FILE_TYPES: pdf,doc,docx,jpg,jpeg,png,xls,xlsx
      UPLOAD_DIR: ./uploads
      LOG_LEVEL: info
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs
    depends_on:
      - redis
    networks:
      - tas_network

  frontend:
    image: jerrypratama/tas-frontend:latest
    container_name: tas_frontend
    restart: unless-stopped
    ports:
      - "4001:3000"
    networks:
      - tas_network

  candidate-portal:
    image: jerrypratama/tas-candidate-portal:latest
    container_name: tas_candidate_portal
    restart: unless-stopped
    ports:
      - "4002:3000"
    networks:
      - tas_network

  redis:
    image: redis:7-alpine
    container_name: tas_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD:-your-redis-password}
    volumes:
      - redis_data:/data
    networks:
      - tas_network

volumes:
  redis_data:

networks:
  tas_network:
    driver: bridge
```

2. **Create `.env` file** (for docker-compose variables):
   ```bash
   REDIS_PASSWORD=your-strong-redis-password-here
   ```

3. **Pull images and start containers**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

4. **Check logs**:
   ```bash
   docker-compose logs -f backend
   ```

### Option B: Using ECS (Recommended for Production)

1. **Create ECS Task Definition** with environment variables from `.env.production`
2. **Create ECS Services** for backend, frontend, candidate-portal
3. **Use AWS Secrets Manager** for sensitive variables (recommended)

**Example ECS Task Definition (Backend)**:
```json
{
  "family": "tas-backend",
  "containerDefinitions": [{
    "name": "tas-backend",
    "image": "jerrypratama/tas-backend:latest",
    "portMappings": [{
      "containerPort": 4000,
      "protocol": "tcp"
    }],
    "environment": [
      {"name": "NODE_ENV", "value": "production"},
      {"name": "PORT", "value": "4000"},
      {"name": "DATABASE_URL", "value": "postgresql://tasadmin:tasadminkpn@2025@<RDS-ENDPOINT>:5432/tas_db?schema=public"},
      {"name": "JWT_SECRET", "value": "29385124500de9cdb28814fe98432399bc9aead16ab4301d1f52c372974705fe"},
      {"name": "JWT_REFRESH_SECRET", "value": "9b038281cc9a904f8340f249d1155a7aedb22fea074308c988c5fad7110c1c17"},
      {"name": "ENCRYPTION_KEY", "value": "537b7ba9c2f2442cffa6e86356433b52"},
      // ... add all other variables
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/tas-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
```

---

## Step 6: Verify Deployment

### 6.1 Check Backend Health

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-11-20T...",
  "uptime": 123.45,
  "port": 4000
}
```

### 6.2 Check Frontend

Open in browser: `http://<your-server-ip>:4001`

### 6.3 Test Login

1. Go to login page
2. Use credentials:
   - **Email**: `jerry.hakim@energi-up.com`
   - **Password**: `DefaultPassword123!`
3. **IMPORTANT**: Change password immediately after first login!

---

## Step 7: Setup Load Balancer & SSL (Recommended)

### 7.1 Create Application Load Balancer

1. Create ALB in AWS Console
2. Configure listeners:
   - Port 80 → HTTP
   - Port 443 → HTTPS (attach SSL certificate)
3. Add target groups:
   - Backend: Port 4000
   - Frontend: Port 4001
   - Candidate Portal: Port 4002

### 7.2 Setup SSL Certificate

1. Request certificate in AWS Certificate Manager (ACM)
2. Attach to ALB listener (port 443)
3. Configure domain DNS to point to ALB

---

## Step 8: Environment Variables Quick Reference

**Required Variables** (must be set):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - 64-character hex string
- `JWT_REFRESH_SECRET` - 64-character hex string
- `ENCRYPTION_KEY` - Exactly 32-character hex string

**Important**: The `ENCRYPTION_KEY` must be **exactly 32 characters**. The value provided in `.env.production` is:
```
ENCRYPTION_KEY=537b7ba9c2f2442cffa6e86356433b52
```

---

## Step 9: Troubleshooting

### Error: "ENCRYPTION_KEY must be exactly 32 characters long"

**Solution**: Ensure `ENCRYPTION_KEY` is exactly 32 characters. Use:
```
ENCRYPTION_KEY=537b7ba9c2f2442cffa6e86356433b52
```

### Error: ".env file not found"

**Solution**: This is normal! Environment variables must be passed to containers. Use:
- Docker Compose: `environment:` section
- ECS: Task definition environment variables
- Docker run: `-e` flags or `--env-file`

### Error: "Database connection failed"

**Solution**:
1. Verify RDS endpoint is correct
2. Check security group allows port 5432 from your application servers
3. Verify credentials: `tasadmin` / `tasadminkpn@2025`
4. Test connection: `psql -h <endpoint> -U tasadmin -d tas_db`

### Error: "Cannot connect to Redis"

**Solution**:
- If using ElastiCache: Check security group and endpoint
- If using Docker Redis: Ensure container is running and password matches

---

## Step 10: Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Production user created
- [ ] All containers running
- [ ] Health checks passing (`/health` endpoint)
- [ ] Login successful
- [ ] Password changed from default
- [ ] SSL certificates configured
- [ ] Load balancer configured
- [ ] Monitoring/CloudWatch logs set up
- [ ] Backups scheduled (RDS automated backups enabled)

---

## Support Files

- **Production .env template**: `backend/.env.production`
- **Database setup script**: `backend/scripts/setupProductionDB.js`
- **User creation script**: `backend/scripts/createProductionUser.js`
- **Production setup guide**: `PRODUCTION_SETUP.md`

---

**Last Updated**: November 2025
**Version**: 2.0.0

