#!/bin/bash
# Monitoring script to detect and auto-fix 504 Gateway Timeout issues
# This can be run as a cron job to automatically fix network connectivity issues
# Recommended: Run every 6 hours or when 504 errors are detected

set -e

LOG_FILE="/var/log/tas-504-monitor.log"
MAX_LOG_SIZE=10485760  # 10MB

# Rotate log if too large
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt $MAX_LOG_SIZE ]; then
    mv "$LOG_FILE" "${LOG_FILE}.old"
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if nginx container is running
if ! docker ps --format '{{.Names}}' | grep -q "^tas_nginx$"; then
    log "ERROR: tas_nginx container is not running"
    exit 1
fi

# Test if nginx can reach frontend
log "Testing connectivity: nginx -> frontend"
if ! docker exec tas_nginx ping -c 1 -W 2 frontend >/dev/null 2>&1; then
    log "WARNING: nginx cannot reach 'frontend', attempting fix..."
    
    # Try to fix by restarting containers
    cd /opt/tas-production 2>/dev/null || cd /root/tas-production 2>/dev/null || {
        log "ERROR: Cannot find tas-production directory"
        exit 1
    }
    
    if [ ! -f "docker-compose.frontend.yml" ]; then
        log "ERROR: docker-compose.frontend.yml not found"
        exit 1
    fi
    
    log "Restarting containers to restore network connectivity..."
    docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production stop >/dev/null 2>&1
    sleep 2
    docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production up -d >/dev/null 2>&1
    sleep 5
    
    # Verify fix
    if docker exec tas_nginx ping -c 1 -W 2 frontend >/dev/null 2>&1; then
        log "SUCCESS: Connectivity restored after restart"
    else
        log "ERROR: Fix failed, manual intervention required"
        exit 1
    fi
else
    log "OK: Connectivity is healthy"
fi

# Test if nginx can reach candidate-portal
log "Testing connectivity: nginx -> candidate-portal"
if ! docker exec tas_nginx ping -c 1 -W 2 candidate-portal >/dev/null 2>&1; then
    log "WARNING: nginx cannot reach 'candidate-portal'"
    # Don't exit, just log the warning
fi

# Test HTTP endpoint
log "Testing HTTP endpoint: http://localhost:8080"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:8080 || echo "000")
if [ "$HTTP_CODE" = "000" ] || [ "$HTTP_CODE" = "504" ]; then
    log "WARNING: HTTP endpoint returned $HTTP_CODE, may need attention"
else
    log "OK: HTTP endpoint responding with code $HTTP_CODE"
fi

log "Monitoring check completed"
exit 0

