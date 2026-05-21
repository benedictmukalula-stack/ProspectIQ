#!/usr/bin/env bash
set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
WORKSPACE_ID="${WORKSPACE_ID:-43eff06d-a85a-427e-a4ed-7423bfa7fc6e}"

echo "=== ProspectIQ Enterprise API Smoke Test ==="
echo "Base URL: $BASE_URL"
echo "Workspace: $WORKSPACE_ID"
echo ""

check_get() {
  local name="$1"
  local url="$2"

  echo "Checking $name"
  response=$(curl -s "$url")

  if echo "$response" | grep -q '"success":true'; then
    echo "OK $name"
  else
    echo "FAIL $name"
    echo "$response"
    exit 1
  fi
}

check_post() {
  local name="$1"
  local url="$2"
  local body="$3"

  echo "Checking $name"
  response=$(curl -s -X POST "$url" \
    -H "Content-Type: application/json" \
    -d "$body")

  if echo "$response" | grep -q '"success":true'; then
    echo "OK $name"
  else
    echo "FAIL $name"
    echo "$response"
    exit 1
  fi
}

check_get "Enterprise Status" "$BASE_URL/api/system/enterprise-status"
check_get "Revenue Forecast" "$BASE_URL/api/enterprise/revenue-forecast?workspaceId=$WORKSPACE_ID"
check_get "Boardroom Briefing" "$BASE_URL/api/boardroom/executive-briefing?workspaceId=$WORKSPACE_ID"
check_get "Executive Governance" "$BASE_URL/api/governance/executive?workspaceId=$WORKSPACE_ID"
check_get "Executive Simulation" "$BASE_URL/api/simulation/executive?workspaceId=$WORKSPACE_ID"
check_get "AI Council" "$BASE_URL/api/council/executive?workspaceId=$WORKSPACE_ID&plan=business"
check_get "Commercial Usage" "$BASE_URL/api/commercial/usage?workspaceId=$WORKSPACE_ID&plan=business"
check_get "Runtime Enforcement" "$BASE_URL/api/runtime/enforcement?workspaceId=$WORKSPACE_ID"
check_get "Autonomous Policy" "$BASE_URL/api/policies/autonomous?workspaceId=$WORKSPACE_ID"
check_get "Platform Mesh" "$BASE_URL/api/global-intelligence/mesh"
check_get "Self Improvement" "$BASE_URL/api/self-improvement/global"
check_get "Autonomous Strategy" "$BASE_URL/api/strategy/autonomous"

check_post "Autonomous Runtime Executor" "$BASE_URL/api/executor/autonomous-runtime" "{\"workspaceId\":\"$WORKSPACE_ID\"}"

echo ""
echo "=== All enterprise smoke tests passed ==="
