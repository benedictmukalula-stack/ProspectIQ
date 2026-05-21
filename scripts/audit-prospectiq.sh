#!/usr/bin/env bash
set -e

echo "=== ProspectIQ Full Build Audit ==="

echo ""
echo "1) Git status"
git status --short

echo ""
echo "2) Latest commits"
git log --oneline -20

echo ""
echo "3) Check key route files"
for path in \
src/app/dashboard/revenue-command/page.tsx \
src/app/api/agents/revenue-system/route.ts \
src/app/api/memory/strategic/route.ts \
src/app/api/learning/sequence/route.ts \
src/app/api/optimization/revenue/route.ts \
src/app/api/orchestration/autopilot/route.ts \
src/app/api/policies/autonomous/route.ts \
src/app/api/runtime/enforcement/route.ts \
src/app/api/executor/autonomous-runtime/route.ts \
src/app/api/global-intelligence/mesh/route.ts \
src/app/api/self-improvement/global/route.ts \
src/app/api/strategy/autonomous/route.ts \
src/app/api/enterprise/revenue-forecast/route.ts \
src/app/api/boardroom/executive-briefing/route.ts \
src/app/api/simulation/executive/route.ts \
src/app/api/governance/executive/route.ts \
src/app/api/commercial/usage/route.ts
do
  if [ -f "$path" ]; then
    echo "OK  $path"
  else
    echo "MISS $path"
  fi
done

echo ""
echo "4) Check dashboard nav references"
grep -n "Revenue Command\|AI Council\|Governance\|Simulation\|Execution\|Billing\|Usage" src/app/dashboard/layout.tsx || true

echo ""
echo "5) Check dashboard module references"
grep -n "Revenue Command\|Executive\|AI Council\|Governance\|Simulation\|Execution" src/app/dashboard/page.tsx || true

echo ""
echo "6) Find stale hardcoded council/risk logic"
grep -R "Pipeline risk is 85\|Conversion probability is 51\|Strategic readiness is 55\|Consensus" -n src/app src/lib || true

echo ""
echo "7) Find untyped empty arrays likely to cause never[] errors"
grep -R "const .* = \[\]" -n src/app src/lib || true

echo ""
echo "8) Find missing imported exports"
grep -R "generateAutonomousOptimizations\|runAutonomousRevenueAgent\|generateExecutionPolicy" -n src/app src/lib || true

echo ""
echo "9) Full build"
bun run build

echo ""
echo "=== Audit complete ==="
