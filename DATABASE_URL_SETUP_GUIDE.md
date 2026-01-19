# DATABASE_URL Setup Guide - RDS PostgreSQL

## Overview

This guide explains how to find your RDS endpoint and update the `DATABASE_URL` in your deployment configuration.

---

## Step 1: Find Your RDS PostgreSQL Endpoint

### Option A: If RDS Already Exists

1. **Go to AWS Console** → **RDS** → **Databases**
2. **Click on your database instance** (e.g., `tas-db-production`)
3. **Find the "Endpoint" section** in the database details
4. **Copy the endpoint** - it looks like:
   ```
   tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com
   ```
   **Note**: You only need the hostname, NOT the port number shown separately.

5. **Note the Port** (usually `5432` for PostgreSQL)

### Option B: If Creating New RDS

When creating RDS:
1. **Database identifier**: `tas-db-production` (this becomes part of endpoint)
2. **Master username**: `tasadmin`
3. **Master password**: `tasadminkpn@2025`
4. **Database name**: `tas_db`
5. **Instance class**: `db.t3.medium` or larger
6. **VPC**: Same as your application servers
7. **Public access**: **NO** (private only)
8. **Security group**: Allow port 5432 from your application servers

After creation, the endpoint will be displayed (takes ~5-10 minutes).

---

## Step 2: Format DATABASE_URL

The `DATABASE_URL` format is:
```
postgresql://<username>:<password>@<endpoint>:<port>/<database>?schema=public&pool_timeout=0&connection_limit=20
```

### Example 1: RDS in AWS (Private)
```
postgresql://tasadmin:tasadminkpn@2025@tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### Example 2: RDS with Custom Port
If your RDS uses a different port (e.g., 5433):
```
postgresql://tasadmin:tasadminkpn@2025@tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com:5433/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### Example 3: Using IP Address (if you have internal IP)
If your database is on a private network with a static IP:
```
postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

**Note**: Your current `.env.production` shows `172.30.60.122` - if this is your actual RDS IP/endpoint, use it!

---

## Step 3: Update docker-compose.production.yml

### Current Line (Line 25):
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### If Your RDS Endpoint is Different:

**Replace** `172.30.60.122` with your actual RDS endpoint.

**Example**: If your RDS endpoint is `tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com`, change to:
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

---

## Step 4: Verify Connection

### Test Connection from Your Deployment Server

1. **Install PostgreSQL client** (if not installed):
   ```bash
   # Amazon Linux 2
   sudo yum install -y postgresql15
   
   # Ubuntu/Debian
   sudo apt-get install -y postgresql-client
   ```

2. **Test connection**:
   ```bash
   psql -h <YOUR-RDS-ENDPOINT> -U tasadmin -d tas_db
   ```
   
   **Example**:
   ```bash
   psql -h tas-db-production.abc123xyz.us-east-1.rds.amazonaws.com -U tasadmin -d tas_db
   ```
   
   Or with IP:
   ```bash
   psql -h 172.30.60.122 -U tasadmin -d tas_db
   ```

3. **Enter password** when prompted: `tasadminkpn@2025`

4. **If successful**, you'll see:
   ```
   Password for user tasadmin: 
   psql (15.x)
   Type "help" for help.
   
   tas_db=>
   ```

5. **Type** `\q` to exit

### Test Connection Using Docker

```bash
docker run --rm \
  postgres:15-alpine \
  psql -h <YOUR-RDS-ENDPOINT> -U tasadmin -d tas_db -c "SELECT version();"
```

Enter password when prompted.

---

## Step 5: Common Issues

### Issue 1: "Connection timeout"

**Possible causes**:
- Security group doesn't allow port 5432 from your application server
- RDS is in different VPC
- Wrong endpoint/address

**Solution**:
1. Check security group allows inbound port 5432 from your app server's IP/SG
2. Verify RDS endpoint is correct
3. Ensure RDS and app servers are in same VPC (or peered VPCs)

### Issue 2: "Authentication failed"

**Possible causes**:
- Wrong username/password
- Username doesn't exist

**Solution**:
1. Verify username: `tasadmin` (not `postgres`)
2. Verify password: `tasadminkpn@2025`
3. If using existing RDS, check if you need to create the user:
   ```sql
   CREATE USER tasadmin WITH PASSWORD 'tasadminkpn@2025';
   CREATE DATABASE tas_db OWNER tasadmin;
   GRANT ALL PRIVILEGES ON DATABASE tas_db TO tasadmin;
   ```

### Issue 3: "Database does not exist"

**Solution**:
1. Create database:
   ```sql
   CREATE DATABASE tas_db;
   ```
2. Or verify database name in RDS matches `tas_db`

### Issue 4: "No route to host"

**Solution**:
- RDS must be in same VPC as application servers
- Or use VPC peering/VPN
- Check security group rules

---

## Step 6: Update Configuration Files

### Update docker-compose.production.yml

**Find this section** (around line 25):
```yaml
environment:
  # Database - UPDATE WITH YOUR RDS ENDPOINT
  DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

**Replace `172.30.60.122`** with your actual RDS endpoint.

### If Using ECS Task Definition

Update the environment variable in your ECS Task Definition JSON:
```json
{
  "environment": [
    {
      "name": "DATABASE_URL",
      "value": "postgresql://tasadmin:tasadminkpn@2025@<YOUR-RDS-ENDPOINT>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20"
    }
  ]
}
```

### If Using Kubernetes ConfigMap/Secret

Create secret:
```bash
kubectl create secret generic tas-database \
  --from-literal=DATABASE_URL="postgresql://tasadmin:tasadminkpn@2025@<YOUR-RDS-ENDPOINT>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20"
```

---

## Step 7: DATABASE_URL Components Explained

```
postgresql://tasadmin:tasadminkpn@2025@<endpoint>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
│          │        │               │           │     │        │               │
│          │        │               │           │     │        │               └─ Connection pool limit
│          │        │               │           │     │        └─ Connection timeout
│          │        │               │           │     └─ Schema name
│          │        │               │           └─ Database name
│          │        │               └─ Port (usually 5432)
│          │        └─ RDS endpoint (hostname or IP)
│          └─ Password
└─ Username
```

### Breaking Down Your Current URL

- **Protocol**: `postgresql://`
- **Username**: `tasadmin`
- **Password**: `tasadminkpn@2025` (URL-encoded, special chars may need encoding)
- **Host**: `172.30.60.122` (replace with your RDS endpoint)
- **Port**: `5432`
- **Database**: `tas_db`
- **Parameters**:
  - `schema=public` - PostgreSQL schema
  - `pool_timeout=0` - Connection pool timeout
  - `connection_limit=20` - Max connections per pool

---

## Step 8: URL Encoding for Special Characters

If your password contains special characters, they may need URL encoding:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `/` → `%2F`
- `:` → `%3A`
- `?` → `%3F`
- `=` → `%3D`

**Example**: If password is `pass@word#123`, use:
```
postgresql://tasadmin:pass%40word%23123@<endpoint>:5432/tas_db
```

**Your current password**: `tasadminkpn@2025` (the `@` should be `%40` in URL)

**Corrected URL**:
```
postgresql://tasadmin:tasadminkpn%402025@<endpoint>:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

**However**, most PostgreSQL drivers handle `@` in passwords automatically, so your current format should work. If you get authentication errors, try URL-encoding.

---

## Step 9: Verification Checklist

Before deploying, verify:

- [ ] RDS endpoint is correct (copy from AWS Console)
- [ ] Port is correct (usually 5432)
- [ ] Username is `tasadmin`
- [ ] Password is `tasadminkpn@2025`
- [ ] Database name is `tas_db`
- [ ] Security group allows port 5432 from application servers
- [ ] Connection test succeeds (`psql` command works)
- [ ] `DATABASE_URL` updated in `docker-compose.production.yml`

---

## Quick Reference: Where to Find RDS Endpoint

### AWS Console Method
1. AWS Console → RDS → Databases
2. Click your database instance
3. Look for "Endpoint & port" section
4. Copy the endpoint (without port number)

### AWS CLI Method
```bash
aws rds describe-db-instances \
  --db-instance-identifier tas-db-production \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

---

## Example: Complete DATABASE_URL Update

### Before:
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### After (if RDS endpoint is `tas-db-prod.abc123.us-east-1.rds.amazonaws.com`):
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@tas-db-prod.abc123.us-east-1.rds.amazonaws.com:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### After (if keeping IP address `172.30.60.122` and it's correct):
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```
**Keep as-is if `172.30.60.122` is your actual RDS endpoint/IP!**

---

**Note**: If `172.30.60.122` is already your correct RDS endpoint/IP address, you don't need to change it! Just verify the connection works.

