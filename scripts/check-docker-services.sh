#!/bin/bash

# Script to check Docker services running on AliCloud servers
# Usage: ./scripts/check-docker-services.sh [project-name]
# Example: ./scripts/check-docker-services.sh tas-production

set -e

PROJECT_NAME="${1:-tas-production}"

echo "=========================================="
echo "Docker Services Check for: $PROJECT_NAME"
echo "=========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ ERROR: Docker daemon is not running!"
    exit 1
fi

echo "📦 Running Containers:"
echo "----------------------"
docker ps --filter "name=${PROJECT_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}" || echo "No containers found for project: $PROJECT_NAME"
echo ""

echo "📋 All Containers (including stopped):"
echo "--------------------------------------"
docker ps -a --filter "name=${PROJECT_NAME}" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" || echo "No containers found for project: $PROJECT_NAME"
echo ""

echo "🔍 Container Health Status:"
echo "----------------------------"
for container in $(docker ps --filter "name=${PROJECT_NAME}" --format "{{.Names}}"); do
    health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "N/A")
    status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
    echo "  $container: Status=$status, Health=$health"
done
echo ""

echo "🌐 Port Mappings:"
echo "-----------------"
for container in $(docker ps --filter "name=${PROJECT_NAME}" --format "{{.Names}}"); do
    ports=$(docker port "$container" 2>/dev/null || echo "No ports mapped")
    if [ "$ports" != "No ports mapped" ] && [ -n "$ports" ]; then
        echo "  $container:"
        echo "$ports" | sed 's/^/    /'
    fi
done
echo ""

echo "🔌 Listening Ports on Host:"
echo "----------------------------"
if command -v ss > /dev/null 2>&1; then
    ss -lntp | grep -E ":(80|443|4000|4001|4002|5432|6379|8080)" || echo "  No relevant ports found listening"
elif command -v netstat > /dev/null 2>&1; then
    netstat -tulpn 2>/dev/null | grep -E ":(80|443|4000|4001|4002|5432|6379|8080)" || echo "  No relevant ports found listening"
else
    echo "  Cannot check listening ports (ss or netstat not available)"
fi
echo ""

echo "📊 Container Resource Usage:"
echo "------------------------------"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker ps --filter "name=${PROJECT_NAME}" --format "{{.Names}}" | tr '\n' ' ') 2>/dev/null || echo "  No containers running"
echo ""

echo "🔗 Docker Networks:"
echo "-------------------"
docker network ls --filter "name=${PROJECT_NAME}" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" || echo "  No networks found for project: $PROJECT_NAME"
echo ""

echo "💾 Docker Volumes:"
echo "------------------"
docker volume ls --filter "name=${PROJECT_NAME}" --format "table {{.Name}}\t{{.Driver}}\t{{.Mountpoint}}" || echo "  No volumes found for project: $PROJECT_NAME"
echo ""

echo "📝 Recent Container Logs (last 5 lines per container):"
echo "-------------------------------------------------------"
for container in $(docker ps --filter "name=${PROJECT_NAME}" --format "{{.Names}}"); do
    echo ""
    echo "  === $container ==="
    docker logs --tail=5 "$container" 2>&1 | sed 's/^/    /' || echo "    (no logs available)"
done
echo ""

echo "✅ Check Complete!"
echo ""
echo "💡 Quick Commands:"
echo "  - View logs: docker logs -f <container-name>"
echo "  - Restart service: docker restart <container-name>"
echo "  - Stop all: docker compose -p $PROJECT_NAME down"
echo "  - Start all: docker compose -p $PROJECT_NAME up -d"

