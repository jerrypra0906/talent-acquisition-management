# Quick Fix for 504 Gateway Timeout

## Problem
After running for a while (often overnight), nginx starts returning `504 Gateway Time-out` errors. The containers are running, but nginx cannot reach `frontend:3000` or `candidate-portal:3000`.

## Quick Solution

Instead of rebuilding (which takes time), use the quick fix script:

```bash
cd /opt/tas-production
bash scripts/quick-fix-504-timeout.sh
```

This script:
- Stops containers
- Restarts them (no rebuild)
- Verifies network connectivity
- Tests the HTTP endpoint

**Time**: ~10-15 seconds (vs 5-10 minutes for full rebuild)

## When to Use

- ✅ Use quick fix when: Containers are running but nginx can't reach them
- ✅ Use quick fix when: Issue happens after containers have been running for a while
- ❌ Use full rebuild when: You need to update code or dependencies

## Manual Quick Fix

If you prefer to do it manually:

```bash
cd /opt/tas-production

# Stop containers
docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production stop

# Start containers (no --build flag)
docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production up -d

# Verify
curl -I http://localhost:8080
```

## Prevention

To automatically detect and fix this issue, set up monitoring:

```bash
# Add to crontab (crontab -e)
# Check every 6 hours
0 */6 * * * /opt/tas-production/scripts/monitor-and-fix-504.sh
```

See `docs/Troubleshooting 504 Gateway Timeout.md` for more details.

