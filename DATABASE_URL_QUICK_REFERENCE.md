# DATABASE_URL Quick Reference

## How to Update DATABASE_URL in docker-compose.production.yml

### Step 1: Find Your RDS Endpoint

**AWS Console Method:**
1. Go to **AWS Console** → **RDS** → **Databases**
2. Click your database instance name
3. Find **"Endpoint"** or **"Endpoint & port"** section
4. Copy the endpoint (it looks like: `tas-db-prod.abc123xyz.us-east-1.rds.amazonaws.com`)

**OR** if you have the internal IP address (like `172.30.60.122`), you can use that.

### Step 2: Update docker-compose.production.yml

**File**: `docker-compose.production.yml`  
**Line**: ~23

**Current line:**
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

**If your RDS endpoint is different, replace `172.30.60.122` with your endpoint:**

**Example 1: Using RDS endpoint**
```yaml
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@tas-db-prod.abc123xyz.us-east-1.rds.amazonaws.com:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

**Example 2: Using IP address (if 172.30.60.122 is correct)**
```yaml
# Keep as-is - no changes needed!
DATABASE_URL: postgresql://tasadmin:tasadminkpn@2025@172.30.60.122:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
```

### Step 3: What Each Part Means

```
postgresql://tasadmin:tasadminkpn@2025@[ENDPOINT-HERE]:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20
                  │        │              │                │        │        │
                  │        │              │                │        │        └─ Connection limit
                  │        │              │                │        └─ Schema
                  │        │              │                └─ Database name
                  │        │              └─ Port (usually 5432)
                  │        └─ Password
                  └─ Username
```

**Replace only the `[ENDPOINT-HERE]` part with your RDS endpoint!**

### Step 4: Verify It Works

**Test connection:**
```bash
psql -h <YOUR-ENDPOINT> -U tasadmin -d tas_db
```

Enter password: `tasadminkpn@2025`

If successful, you'll see:
```
Password for user tasadmin: 
psql (15.x)
Type "help" for help.

tas_db=>
```

Type `\q` to exit.

---

## Common Questions

**Q: I don't see the endpoint in AWS Console?**  
A: Make sure RDS instance is created and in "Available" status. The endpoint appears after creation (takes 5-10 minutes).

**Q: Can I use the IP address instead of endpoint?**  
A: Yes, if you know the internal IP and it's static. The endpoint is recommended as it's stable.

**Q: My password has special characters, do I need to encode them?**  
A: Usually not, but if authentication fails, try URL-encoding `@` as `%40`.

**Q: The current URL has `172.30.60.122` - is that correct?**  
A: Only if that's your actual RDS endpoint/IP. Check in AWS Console to verify.

---

## Quick Checklist

- [ ] Found RDS endpoint in AWS Console
- [ ] Updated `DATABASE_URL` in `docker-compose.production.yml`
- [ ] Tested connection with `psql` command
- [ ] Security group allows port 5432 from application servers
- [ ] Ready to deploy!

---

**See `DATABASE_URL_SETUP_GUIDE.md` for detailed instructions.**

