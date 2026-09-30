#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://justapdf.com/api/health}"
curl --fail --silent --show-error "$URL"
printf '\n'
