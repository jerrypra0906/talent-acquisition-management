# Production Deployment Guide - AWS Cloud

This guide provides step-by-step instructions for deploying the Talent Acquisition Management System to AWS Cloud using Docker containers.

## Prerequisites

1. AWS Account with appropriate permissions
2. Docker and Docker Compose installed on deployment server
3. GitHub repository access
4. Domain names configured (optional, for SSL)
5. SSL certificates (optional, for HTTPS)

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Step 1: Create Production Environment File

```bash
# Copy the template
cp env.prod.template .env.prod

# Edit .env.prod with your production values
nano .env.prod
```

#### Step 2: Configure Database Credentials

The following database credentials are already configured:
- **POSTGRES_USER:** `tas_user`
- **POSTGRES_PASSWORD:** `taskpn@2025`
- **POSTGRES_DB:** `tas_db`
- **POSTGRES_PORT:** `5432`

#### Step 3: Generate Secure Secrets

```bash
# Generate JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT Refresh Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Encryption Key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Generate Redis Password (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Default User Password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"

# Generate Default Candidate Password
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

#### Step 4: Update .env.prod

Update the following variables in `.env.prod`:

```env
# Database (already configured)
POSTGRES_USER=tas_user
POSTGRES_PASSWORD=taskpn@2025
POSTGRES_DB=tas_db

# Redis (generate secure password)
REDIS_PASSWORD=<generated-redis-password>

# JWT Secrets (generate secure secrets)
JWT_SECRET=<generated-jwt-secret>
JWT_REFRESH_SECRET=<generated-refresh-secret>

# Encryption Key (generate 32-character key)
ENCRYPTION_KEY=<generated-encryption-key>

# Default Passwords (generate secure passwords)
DEFAULT_USER_PASSWORD=<generated-default-user-password>
DEFAULT_CANDIDATE_PASSWORD=<generated-default-candidate-password>

# Application URLs (update with your domain)
FRONTEND_URL=https://admin.yourdomain.com
CANDIDATE_PORTAL_URL=https://careers.yourdomain.com
CORS_ORIGIN=https://admin.yourdomain.com,https://careers.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api

# Email Configuration (if using email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@yourdomain.com

# AWS S3 Configuration (if using S3 storage)
USE_S3=false
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
```

### 2. SSL Certificate Configuration

#### Option 1: Use Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificates
sudo certbot certonly --standalone -d api.yourdomain.com
sudo certbot certonly --standalone -d admin.yourdomain.com
sudo certbot certonly --standalone -d careers.yourdomain.com

# Copy certificates to nginx/ssl directory
sudo cp /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/api.yourdomain.com/privkey.pem nginx/ssl/key.pem
```

#### Option 2: Use Your Own Certificates

```bash
# Copy your certificates to nginx/ssl directory
cp your-certificate.pem nginx/ssl/cert.pem
cp your-private-key.pem nginx/ssl/key.pem
```

### 3. Update Nginx Configuration

Update `nginx/nginx.conf` with your domain names:

```nginx
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;  # Update this
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}

server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;  # Update this
    # ... rest of configuration
}

server {
    listen 443 ssl http2;
    server_name careers.yourdomain.com;  # Update this
    # ... rest of configuration
}
```

## Deployment Steps

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/talent-acquisition-system.git
cd talent-acquisition-system

# Checkout production branch (if applicable)
git checkout production
```

### Step 2: Load Environment Variables

```bash
# Load environment variables from .env.prod
export $(cat .env.prod | xargs)
```

### Step 3: Build Docker Images

```bash
# Build all Docker images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### Step 4: Run Database Migrations

```bash
# Start database service only
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d postgres

# Wait for database to be ready
sleep 10

# Run database migrations
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Apply candidate form tokens migration (if not already applied)
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend node -e "
  const { PrismaClient } = require('@prisma/client');
  const fs = require('fs');
  const prisma = new PrismaClient();
  const sql = fs.readFileSync('./prisma/migrations/add_candidate_form_tokens.sql', 'utf8');
  prisma.\$executeRawUnsafe(sql).then(() => {
    console.log('Migration applied');
    prisma.\$disconnect();
  });
"
```

### Step 5: Create Jerry Hakim SUPER_ADMIN User

```bash
# Create Jerry Hakim SUPER_ADMIN user
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node scripts/createJerryAdmin.js
```

**User Details:**
- **Email:** jerry.hakim@energi-up.com
- **Password:** Password123!
- **Role:** SUPER_ADMIN
- **First Name:** Jerry
- **Last Name:** Hakim

**See `CREATE_ADMIN_USER.md` for detailed instructions and troubleshooting.**

### Step 6: Start All Services

```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Check service status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f
```

### Step 7: Verify Deployment

```bash
# Check health endpoints
curl https://api.yourdomain.com/health

# Check frontend
curl https://admin.yourdomain.com

# Check candidate portal
curl https://careers.yourdomain.com
```

## Post-Deployment Tasks

### 1. Verify Database Connection

```bash
# Connect to database
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec postgres \
  psql -U tas_user -d tas_db

# Check tables
\dt

# Exit
\q
```

### 2. Verify Redis Connection

```bash
# Connect to Redis
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec redis \
  redis-cli -a $REDIS_PASSWORD ping
```

### 3. Test API Endpoints

```bash
# Test health endpoint
curl https://api.yourdomain.com/health

# Test login endpoint
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kpn.com","password":"your-admin-password"}'
```

### 4. Configure Backups

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup database
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U tas_user tas_db > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Keep only last 30 days of backups
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

### 5. Set Up Monitoring

- Configure CloudWatch or similar monitoring service
- Set up alerts for:
  - Service downtime
  - High error rates
  - Database connection issues
  - Disk space usage
  - Memory usage

### 6. Configure Logging

```bash
# View application logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f backend

# View nginx logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f nginx
```

## Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin production

# Rebuild images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  npx prisma migrate deploy
```

### Scaling Services

```bash
# Scale backend services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale backend=3

# Scale frontend services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --scale frontend=2
```

### Rolling Back

```bash
# Stop current services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Checkout previous version
git checkout <previous-commit-hash>

# Rebuild and restart
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Database Connection Issues

```bash
# Check database status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps postgres

# Check database logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs postgres

# Test database connection
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node -e "require('pg').Client({connectionString: process.env.DATABASE_URL}).connect().then(() => console.log('Connected')).catch(console.error)"
```

### Redis Connection Issues

```bash
# Check Redis status
docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps redis

# Check Redis logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs redis

# Test Redis connection
docker-compose -f docker-compose.yml -f docker-compose.prod.yml exec backend \
  node -e "const redis = require('redis'); const client = redis.createClient(process.env.REDIS_URL); client.ping().then(console.log).catch(console.error)"
```

### Application Errors

```bash
# Check application logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs backend

# Check nginx logs
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs nginx

# Restart services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart
```

## Security Considerations

1. **Never commit .env.prod to version control**
2. **Use strong passwords for all services**
3. **Enable HTTPS in production**
4. **Regularly update dependencies**
5. **Monitor for security vulnerabilities**
6. **Implement regular backups**
7. **Set up monitoring and alerting**
8. **Restrict access to production environment**
9. **Use least privilege principle**
10. **Regularly review access logs**

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Contact the development team
4. Refer to the API documentation

---

**Last Updated:** 2025-11-11  
**Version:** 1.0.0

