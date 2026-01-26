#!/bin/bash
# Diagnostic script for 504 Gateway Timeout issue
# Run this on the frontend server (ECS-App)

set -e

echo "=========================================="
echo "504 Gateway Timeout Diagnostic Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check if containers are running
echo "Step 1: Checking container status..."
echo "-----------------------------------"
docker ps --filter "name=tas_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" || true
echo ""

# Step 2: Check Docker network
echo "Step 2: Checking Docker network..."
echo "-----------------------------------"
NETWORK_NAME="tas-production_tas_network"
NETWORK_EXISTS=$(docker network ls | grep -c "$NETWORK_NAME" || echo "0")

if [ "$NETWORK_EXISTS" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  Network '$NETWORK_NAME' does not exist${NC}"
    echo "   Creating network..."
    docker network create "$NETWORK_NAME" 2>/dev/null && echo -e "${GREEN}✅ Network created${NC}" || echo -e "${RED}❌ Failed to create network${NC}"
else
    echo -e "${GREEN}✅ Network '$NETWORK_NAME' exists${NC}"
fi

# Get network details
echo ""
echo "Network details:"
docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -E "(Name|IPv4Address)" | head -20 || echo -e "${RED}❌ Cannot inspect network${NC}"
echo ""

# Step 3: Check if containers are on the network
echo "Step 3: Checking container network membership..."
echo "-----------------------------------"
NGINX_ON_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "tas_nginx" || echo "0")
FRONTEND_ON_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "tas_frontend" || echo "0")
CANDIDATE_ON_NETWORK=$(docker network inspect "$NETWORK_NAME" 2>/dev/null | grep -c "tas_candidate_portal" || echo "0")

if [ "$NGINX_ON_NETWORK" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  tas_nginx is not on network${NC}"
    echo "   Connecting tas_nginx to network..."
    docker network connect "$NETWORK_NAME" tas_nginx 2>/dev/null && echo -e "${GREEN}✅ Connected${NC}" || echo -e "${RED}❌ Failed to connect${NC}"
else
    echo -e "${GREEN}✅ tas_nginx is on network${NC}"
fi

if [ "$FRONTEND_ON_NETWORK" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  tas_frontend is not on network${NC}"
    echo "   Connecting tas_frontend to network..."
    docker network connect "$NETWORK_NAME" tas_frontend 2>/dev/null && echo -e "${GREEN}✅ Connected${NC}" || echo -e "${RED}❌ Failed to connect${NC}"
else
    echo -e "${GREEN}✅ tas_frontend is on network${NC}"
fi

if [ "$CANDIDATE_ON_NETWORK" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  tas_candidate_portal is not on network${NC}"
    echo "   Connecting tas_candidate_portal to network..."
    docker network connect "$NETWORK_NAME" tas_candidate_portal 2>/dev/null && echo -e "${GREEN}✅ Connected${NC}" || echo -e "${RED}❌ Failed to connect${NC}"
else
    echo -e "${GREEN}✅ tas_candidate_portal is on network${NC}"
fi
echo ""

# Step 4: Test connectivity from nginx
echo "Step 4: Testing connectivity from nginx container..."
echo "-----------------------------------"
echo "Testing ping to 'frontend'..."
if docker exec tas_nginx ping -c 2 -W 2 frontend >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach 'frontend' hostname${NC}"
else
    echo -e "${RED}❌ Nginx cannot reach 'frontend' hostname${NC}"
    echo "   Trying to get frontend container IP..."
    FRONTEND_IP=$(docker inspect tas_frontend 2>/dev/null | grep -oP '"IPAddress": "\K[^"]+' | head -1 || echo "")
    if [ -n "$FRONTEND_IP" ]; then
        echo "   Frontend IP: $FRONTEND_IP"
        if docker exec tas_nginx ping -c 2 -W 2 "$FRONTEND_IP" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Nginx can reach frontend by IP${NC}"
            echo -e "${YELLOW}⚠️  Service name resolution issue - containers need to be restarted with docker-compose${NC}"
        else
            echo -e "${RED}❌ Nginx cannot reach frontend by IP either${NC}"
        fi
    fi
fi

echo ""
echo "Testing ping to 'candidate-portal'..."
if docker exec tas_nginx ping -c 2 -W 2 candidate-portal >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach 'candidate-portal' hostname${NC}"
else
    echo -e "${RED}❌ Nginx cannot reach 'candidate-portal' hostname${NC}"
    echo "   Trying to get candidate-portal container IP..."
    CANDIDATE_IP=$(docker inspect tas_candidate_portal 2>/dev/null | grep -oP '"IPAddress": "\K[^"]+' | head -1 || echo "")
    if [ -n "$CANDIDATE_IP" ]; then
        echo "   Candidate Portal IP: $CANDIDATE_IP"
        if docker exec tas_nginx ping -c 2 -W 2 "$CANDIDATE_IP" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Nginx can reach candidate-portal by IP${NC}"
            echo -e "${YELLOW}⚠️  Service name resolution issue - containers need to be restarted with docker-compose${NC}"
        else
            echo -e "${RED}❌ Nginx cannot reach candidate-portal by IP either${NC}"
        fi
    fi
fi
echo ""

# Step 5: Test HTTP connectivity
echo "Step 5: Testing HTTP connectivity..."
echo "-----------------------------------"
echo "Testing http://frontend:3000 from nginx..."
if docker exec tas_nginx wget -O- --timeout=5 --tries=1 http://frontend:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach frontend:3000${NC}"
else
    echo -e "${RED}❌ Nginx cannot reach frontend:3000${NC}"
    echo "   Checking if frontend is listening on port 3000..."
    docker exec tas_frontend netstat -tlnp 2>/dev/null | grep 3000 || echo "   ⚠️  Cannot check (netstat may not be available)"
fi

echo ""
echo "Testing http://candidate-portal:3000 from nginx..."
if docker exec tas_nginx wget -O- --timeout=5 --tries=1 http://candidate-portal:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx can reach candidate-portal:3000${NC}"
else
    echo -e "${RED}❌ Nginx cannot reach candidate-portal:3000${NC}"
    echo "   Checking if candidate-portal is listening on port 3000..."
    docker exec tas_candidate_portal netstat -tlnp 2>/dev/null | grep 3000 || echo "   ⚠️  Cannot check (netstat may not be available)"
fi
echo ""

# Step 6: Check nginx logs
echo "Step 6: Checking nginx error logs..."
echo "-----------------------------------"
echo "Recent nginx errors:"
docker logs tas_nginx --tail 20 2>&1 | grep -iE "(error|timeout|upstream|failed)" | tail -10 || echo "   No recent errors found"
echo ""

# Step 7: Check nginx configuration
echo "Step 7: Checking nginx configuration..."
echo "-----------------------------------"
echo "Upstream configuration:"
docker exec tas_nginx cat /etc/nginx/nginx.conf 2>/dev/null | grep -A 3 "upstream frontend" || echo "   Cannot read nginx config"
docker exec tas_nginx cat /etc/nginx/nginx.conf 2>/dev/null | grep -A 3 "upstream candidate_portal" || echo "   Cannot read nginx config"
echo ""

# Step 8: Test nginx config
echo "Step 8: Testing nginx configuration..."
echo "-----------------------------------"
if docker exec tas_nginx nginx -t 2>&1; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
fi
echo ""

# Summary and recommendations
echo "=========================================="
echo "Summary and Recommendations"
echo "=========================================="
echo ""

# Check if we need to restart with docker-compose
if [ "$NGINX_ON_NETWORK" -eq "0" ] || [ "$FRONTEND_ON_NETWORK" -eq "0" ] || [ "$CANDIDATE_ON_NETWORK" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  RECOMMENDED FIX:${NC}"
    echo "   Containers were not properly connected to the network."
    echo "   They have been connected now, but for proper service name resolution,"
    echo "   you should restart them using docker-compose:"
    echo ""
    echo "   cd /opt/tas-production"
    echo "   docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production down"
    echo "   docker compose -f docker-compose.frontend.yml -p tas-production --env-file .env.production up -d"
    echo ""
fi

echo "After applying fixes, test the site:"
echo "   curl -I http://localhost:8080"
echo ""

