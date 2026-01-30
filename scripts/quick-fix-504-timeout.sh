#!/bin/bash
# Quick fix for 504 Gateway Timeout without rebuilding
# This script restarts containers to restore network connectivity
# Run this on the frontend server (ECS-App)

set -e

echo "=========================================="
echo "Quick Fix for 504 Gateway Timeout"
echo "=========================================="
echo ""
echo "This script will restart containers to restore network connectivity"
echo "without rebuilding images (much faster than full rebuild)"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "docker-compose.frontend.yml" ]; then
    echo "⚠️  docker-compose.frontend.yml not found in current directory"
    echo "   Please run this script from /opt/tas-production"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  .env.production not found"
    echo "   Please ensure you're in the correct directory"
    exit 1
fi

echo "Step 1: Stopping containers..."
echo "-----------------------------------"
docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production stop

echo ""
echo "Step 2: Starting containers (no rebuild)..."
echo "-----------------------------------"
docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production up -d

echo ""
echo "Step 3: Waiting for containers to be ready..."
echo "-----------------------------------"
sleep 5

echo ""
echo "Step 4: Verifying connectivity..."
echo "-----------------------------------"

# Test nginx can reach frontend
if docker exec tas_nginx ping -c 1 -W 2 frontend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach 'frontend'${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx cannot reach 'frontend' yet, waiting a bit more...${NC}"
    sleep 5
    if docker exec tas_nginx ping -c 1 -W 2 frontend >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Nginx can reach 'frontend'${NC}"
    else
        echo -e "${YELLOW}⚠️  Still having issues, but containers are restarted${NC}"
    fi
fi

# Test nginx can reach candidate-portal
if docker exec tas_nginx ping -c 1 -W 2 candidate-portal >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach 'candidate-portal'${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx cannot reach 'candidate-portal' yet${NC}"
fi

echo ""
echo "Step 5: Testing HTTP endpoint..."
echo "-----------------------------------"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -qE "200|301|302"; then
    echo -e "${GREEN}✅ Site is responding (HTTP 200/301/302)${NC}"
else
    echo -e "${YELLOW}⚠️  Site may still be starting up, check again in a moment${NC}"
    echo "   Run: curl -I http://localhost:8080"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Quick fix completed!${NC}"
echo "=========================================="
echo ""
echo "Container status:"
docker ps --filter "name=tas_" --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "If issues persist, check logs:"
echo "   docker logs tas_nginx --tail 20"
echo "   docker logs tas_frontend --tail 20"
echo ""

