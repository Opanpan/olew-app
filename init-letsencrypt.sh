#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="welo-app.kinderheim511.com"
EMAIL="fanalriansyah@gmail.com"

echo -e "${YELLOW}=== Let's Encrypt SSL Certificate Initialization ===${NC}\n"

# Check if .env exists and source it
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
    DOMAIN=${DOMAIN:-welo-app.kinderheim511.com}
    EMAIL=${EMAIL:-fanalriansyah@gmail.com}
fi

# Create directories for certbot with proper permissions
mkdir -p ./certbot-conf ./certbot-www
chmod 777 ./certbot-conf ./certbot-www

# Check if certificate already exists
if [ -d "./certbot-conf/live/$DOMAIN" ]; then
    echo -e "${YELLOW}Certificate for $DOMAIN already exists. Skipping initialization.${NC}"
    exit 0
fi

echo -e "${YELLOW}Step 1: Ensuring no conflicts on port 80...${NC}\n"

# Stop any existing containers
docker compose down 2>/dev/null || true

# Fix permissions if directories were previously created by root (docker)
if [ -f "./certbot-conf/.certbot.lock" ]; then
    sudo rm -f ./certbot-conf/.certbot.lock
fi

echo -e "${GREEN}✓ Ports cleared${NC}\n"

echo -e "${YELLOW}Step 2: Requesting SSL certificate from Let's Encrypt (standalone mode)...${NC}\n"

# Run certbot in standalone mode (doesn't need nginx running)
docker run --rm \
    -v "$(pwd)/certbot-conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot-www:/var/www/certbot" \
    -p 80:80 \
    -p 443:443 \
    certbot/certbot:latest certonly \
    --standalone \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ SSL certificate successfully obtained!${NC}\n"
else
    echo -e "\n${RED}Error: Failed to obtain SSL certificate${NC}"
    echo -e "${RED}Possible causes:${NC}"
    echo -e "  1. Domain is not pointing to your VPS IP"
    echo -e "  2. Port 80 is not accessible from the internet"
    echo -e "  3. DNS has not propagated yet (try waiting 5-30 minutes)"
    exit 1
fi

echo -e "${YELLOW}Step 3: Starting production stack...${NC}\n"

docker compose up -d

sleep 3

echo -e "${GREEN}✓ Production stack started${NC}\n"

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}\n"

if docker compose ps | grep -q "olew-group.*running"; then
    echo -e "${GREEN}✓ Olew app service is running${NC}"
else
    echo -e "${RED}✗ Olew app service is not running${NC}"
fi

echo -e "\n${GREEN}=== Initialization Complete ===${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Visit https://$DOMAIN to verify the certificate"
echo -e "  2. Check logs: docker compose logs -f"
echo -e "  3. Monitor certificate renewal: docker compose exec olew-app certbot certificates"
echo -e "\n${YELLOW}Your website should be live at https://$DOMAIN${NC}\n"
