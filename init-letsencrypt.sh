#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="welo-app.kinderheim511.com"

echo -e "${YELLOW}=== Olew App — Production Deploy ===${NC}\n"

# Check proxy-network exists
if ! docker network inspect proxy-network > /dev/null 2>&1; then
    echo -e "${RED}Error: proxy-network does not exist.${NC}"
    echo -e "Create it first: ${YELLOW}docker network create proxy-network${NC}"
    exit 1
fi

echo -e "${GREEN}✓ proxy-network found${NC}\n"

echo -e "${YELLOW}Starting olew-app container...${NC}\n"
docker compose up -d --build

sleep 5

# Verify deployment
if docker compose ps | grep -q "olew-group.*running\|olew-group.*Up"; then
    echo -e "${GREEN}✓ Olew app is running${NC}"
else
    echo -e "${RED}✗ Olew app failed to start — check logs:${NC}"
    echo -e "  docker compose logs olew-app"
    exit 1
fi

echo -e "\n${GREEN}=== Deploy Complete ===${NC}\n"
echo -e "${YELLOW}SSL certificate will be issued automatically by acme-companion.${NC}"
echo -e "Check cert status: ${YELLOW}docker logs nginx-proxy-acme${NC}\n"
echo -e "Your site will be live at: ${GREEN}https://$DOMAIN${NC}\n"
