#!/usr/bin/env bash
# Seed the local database with demo data. Thin wrapper over the @geo/db seed script.
# Usage:  ./scripts/seed.sh
set -euo pipefail

echo "→ Seeding database via @geo/db"
exec bun --filter @geo/db seed
