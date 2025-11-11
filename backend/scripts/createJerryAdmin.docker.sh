#!/bin/bash

# Script to create Jerry Hakim SUPER_ADMIN user in Docker environment
# Usage: docker-compose exec backend node scripts/createJerryAdmin.js

echo "Creating Jerry Hakim SUPER_ADMIN user..."
echo ""

# Check if running in Docker
if [ -f /.dockerenv ]; then
    echo "✅ Running in Docker container"
    node scripts/createJerryAdmin.js
else
    echo "⚠️  Not running in Docker container"
    echo "Please run this script inside the Docker container:"
    echo "  docker-compose exec backend node scripts/createJerryAdmin.js"
    exit 1
fi

