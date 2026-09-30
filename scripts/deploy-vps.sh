#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/justapdf}"
cd "$APP_DIR"
git fetch origin main
git checkout main
git pull --ff-only origin main
npm ci --omit=dev
npm run db:migrate
pm2 startOrReload ecosystem.config.cjs --update-env
curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null
echo "JustaPDF deployed and healthy."
