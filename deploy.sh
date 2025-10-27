#!/bin/bash
# Simple one-command deploy script (builds and runs via docker-compose)
# Usage: copy .env with credentials, then: ./deploy.sh

set -e
echo "Building and starting placement-mailer with docker-compose..."
docker-compose build --no-cache
docker-compose up -d
echo "Deployment complete. Visit http://localhost:${PORT:-3000}"
