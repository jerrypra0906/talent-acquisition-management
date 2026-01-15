#!/bin/bash
# Script to properly set up DATABASE_URL with URL-encoded password
# This handles special characters in POSTGRES_PASSWORD automatically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Default to .env.production if no argument provided
ENV_FILE="${1:-$PROJECT_ROOT/.env.production}"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: Environment file not found: $ENV_FILE${NC}" >&2
    exit 1
fi

echo -e "${GREEN}Setting up DATABASE_URL with URL-encoded password...${NC}"

# Read POSTGRES_PASSWORD from env file
POSTGRES_PASSWORD=$(grep '^POSTGRES_PASSWORD=' "$ENV_FILE" | cut -d= -f2- | sed 's/#.*$//' | xargs)

if [ -z "$POSTGRES_PASSWORD" ]; then
    echo -e "${RED}Error: POSTGRES_PASSWORD not found in $ENV_FILE${NC}" >&2
    exit 1
fi

# URL-encode the password
# Try Python first (most reliable)
if command -v python3 >/dev/null 2>&1; then
    POSTGRES_PASSWORD_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${POSTGRES_PASSWORD}', safe=''))")
elif command -v node >/dev/null 2>&1; then
    POSTGRES_PASSWORD_ENCODED=$(node -e "console.log(encodeURIComponent('${POSTGRES_PASSWORD}'))")
elif command -v python >/dev/null 2>&1; then
    POSTGRES_PASSWORD_ENCODED=$(python -c "import urllib.parse; print(urllib.parse.quote('${POSTGRES_PASSWORD}', safe=''))")
else
    # Fallback: manual encoding for common special characters
    echo -e "${YELLOW}Warning: Python/Node.js not found. Using basic encoding (may not handle all special chars)${NC}" >&2
    POSTGRES_PASSWORD_ENCODED=$(echo "${POSTGRES_PASSWORD}" | sed 's|/|%2F|g' | sed 's|@|%40|g' | sed 's|:|%3A|g' | sed 's|#|%23|g' | sed 's|?|%3F|g' | sed 's|&|%26|g' | sed 's|=|%3D|g' | sed 's|%|%25|g' | sed 's| |%20|g')
fi

# Construct DATABASE_URL with URL-encoded password
DATABASE_URL_VALUE="postgresql://tas_user:${POSTGRES_PASSWORD_ENCODED}@postgres:5432/tas_db?schema=public&pool_timeout=0&connection_limit=20"

# Export variables to shell environment
export DATABASE_URL="$DATABASE_URL_VALUE"
export POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

# Also export other required variables from env file
set -a
source <(grep -v '^#' "$ENV_FILE" | grep -v '^$' | grep '=' | sed 's/#.*$//' | sed 's/[[:space:]]*$//')
set +a

# Create docker-compose override file with properly encoded DATABASE_URL
OVERRIDE_FILE="/tmp/docker-compose.override.yml"
printf 'services:\n  backend:\n    environment:\n      DATABASE_URL: "%s"\n' "${DATABASE_URL_VALUE}" > "$OVERRIDE_FILE"

echo -e "${GREEN}✅ DATABASE_URL configured successfully${NC}"
echo -e "   Original password: ${POSTGRES_PASSWORD:0:20}..."
echo -e "   Encoded password: ${POSTGRES_PASSWORD_ENCODED:0:20}..."
echo -e "   Override file: $OVERRIDE_FILE"
echo ""
echo "To use this with docker-compose, run:"
echo "  docker compose -f docker-compose.network.yml -f $OVERRIDE_FILE -p tas-production --env-file $ENV_FILE up -d backend"

