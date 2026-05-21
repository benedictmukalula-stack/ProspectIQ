#!/usr/bin/env bash
set -e

echo "=== ProspectIQ Release Readiness Check ==="

echo ""
echo "1) Git cleanliness"
if [ -n "$(git status --short)" ]; then
  echo "Working tree has uncommitted changes:"
  git status --short
else
  echo "OK working tree clean"
fi

echo ""
echo "2) Production build"
bun run build

echo ""
echo "3) Enterprise API route registration"
required_routes=(
  ".next/server/app/api/system/enterprise-status/route.js"
  ".next/server/app/api/council/executive/route.js"
  ".next/server/app/api/governance/executive/route.js"
  ".next/server/app/api/boardroom/executive-briefing/route.js"
  ".next/server/app/api/enterprise/revenue-forecast/route.js"
  ".next/server/app/api/simulation/executive/route.js"
  ".next/server/app/api/commercial/usage/route.js"
)

for route in "${required_routes[@]}"; do
  if [ -f "$route" ]; then
    echo "OK $route"
  else
    echo "MISS $route"
    exit 1
  fi
done

echo ""
echo "4) Latest commit"
git log --oneline -1

echo ""
echo "=== Release readiness check complete ==="
