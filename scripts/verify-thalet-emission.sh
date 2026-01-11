#!/bin/bash
# THALET Emission Verification Script
# Purpose: Binary proof that THALET atomic_score is being emitted and stored
# Usage: ./scripts/verify-thalet-emission.sh <SUBMISSION_HASH>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-https://syntheverse-poc.vercel.app}"
SUBMISSION_HASH="$1"

if [ -z "$SUBMISSION_HASH" ]; then
  echo -e "${RED}❌ ERROR: Submission hash required${NC}"
  echo "Usage: $0 <SUBMISSION_HASH>"
  echo ""
  echo "Example:"
  echo "  $0 abc123def456..."
  exit 1
fi

echo -e "${BLUE}🔬 THALET EMISSION VERIFICATION${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "Submission Hash: ${YELLOW}${SUBMISSION_HASH}${NC}"
echo -e "API Base URL: ${YELLOW}${API_BASE_URL}${NC}"
echo ""

# Step 1: Fetch contribution record
echo -e "${BLUE}📡 Step 1: Fetching contribution record...${NC}"
RESPONSE=$(curl -s "${API_BASE_URL}/api/contributions/${SUBMISSION_HASH}")

# Check if response is valid JSON
if ! echo "$RESPONSE" | jq empty 2>/dev/null; then
  echo -e "${RED}❌ ERROR: Invalid JSON response${NC}"
  echo "$RESPONSE"
  exit 1
fi

# Step 2: Extract atomic_score
echo -e "${BLUE}🔍 Step 2: Extracting atomic_score from metadata...${NC}"
ATOMIC_SCORE=$(echo "$RESPONSE" | jq '.metadata.atomic_score')

if [ "$ATOMIC_SCORE" = "null" ] || [ -z "$ATOMIC_SCORE" ]; then
  echo -e "${RED}❌ THALET NOT EMITTING${NC}"
  echo ""
  echo -e "${YELLOW}Fallback check: Looking for legacy score_trace...${NC}"
  SCORE_TRACE=$(echo "$RESPONSE" | jq '.metadata.score_trace.final_score')
  POD_SCORE=$(echo "$RESPONSE" | jq '.pod_score')
  
  echo -e "  Legacy score_trace.final_score: ${YELLOW}${SCORE_TRACE}${NC}"
  echo -e "  Top-level pod_score: ${YELLOW}${POD_SCORE}${NC}"
  echo ""
  echo -e "${RED}🔥 DIAGNOSIS: THALET is NOT emitting${NC}"
  echo -e "${YELLOW}Possible causes:${NC}"
  echo "  1. This is a stale evaluation (pre-THALET)"
  echo "  2. AtomicScorer not being called in evaluate function"
  echo "  3. atomic_score not being stored in database"
  echo "  4. API response not including atomic_score field"
  echo ""
  echo -e "${BLUE}💡 SOLUTION: Submit a fresh test PoC to trigger new evaluation${NC}"
  exit 1
fi

# Step 3: Validate THALET structure
echo -e "${GREEN}✅ atomic_score found in metadata${NC}"
echo ""
echo -e "${BLUE}🔍 Step 3: Validating THALET structure...${NC}"

FINAL=$(echo "$ATOMIC_SCORE" | jq '.final')
EXECUTION_CONTEXT=$(echo "$ATOMIC_SCORE" | jq '.execution_context')
INTEGRITY_HASH=$(echo "$ATOMIC_SCORE" | jq -r '.integrity_hash')
TRACE=$(echo "$ATOMIC_SCORE" | jq '.trace')

# Validate final score
if [ "$FINAL" = "null" ] || [ -z "$FINAL" ]; then
  echo -e "${RED}❌ Missing: atomic_score.final${NC}"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} atomic_score.final: ${GREEN}${FINAL}${NC}"

# Validate execution_context
if [ "$EXECUTION_CONTEXT" = "null" ]; then
  echo -e "${RED}❌ Missing: atomic_score.execution_context${NC}"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} atomic_score.execution_context: present"

# Extract execution context details
TIMESTAMP_UTC=$(echo "$EXECUTION_CONTEXT" | jq -r '.timestamp_utc')
PIPELINE_VERSION=$(echo "$EXECUTION_CONTEXT" | jq -r '.pipeline_version')
OPERATOR_ID=$(echo "$EXECUTION_CONTEXT" | jq -r '.operator_id')
TOGGLES=$(echo "$EXECUTION_CONTEXT" | jq -c '.toggles')

echo -e "      timestamp_utc: ${YELLOW}${TIMESTAMP_UTC}${NC}"
echo -e "      pipeline_version: ${YELLOW}${PIPELINE_VERSION}${NC}"
echo -e "      operator_id: ${YELLOW}${OPERATOR_ID}${NC}"
echo -e "      toggles: ${YELLOW}${TOGGLES}${NC}"

# Validate integrity_hash
if [ "$INTEGRITY_HASH" = "null" ] || [ -z "$INTEGRITY_HASH" ]; then
  echo -e "${RED}❌ Missing: atomic_score.integrity_hash${NC}"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} atomic_score.integrity_hash: ${GREEN}${INTEGRITY_HASH:0:16}...${NC}"

# Validate trace
if [ "$TRACE" = "null" ]; then
  echo -e "${RED}❌ Missing: atomic_score.trace${NC}"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} atomic_score.trace: present"

# Extract trace details
COMPOSITE=$(echo "$TRACE" | jq '.composite')
FORMULA=$(echo "$TRACE" | jq -r '.formula')

echo -e "      composite: ${YELLOW}${COMPOSITE}${NC}"
echo -e "      formula: ${YELLOW}${FORMULA}${NC}"

# Step 4: Verify pod_score matches atomic_score.final
echo ""
echo -e "${BLUE}🔍 Step 4: Verifying pod_score consistency...${NC}"
POD_SCORE=$(echo "$RESPONSE" | jq '.pod_score')

if [ "$POD_SCORE" != "$FINAL" ]; then
  echo -e "${RED}❌ MISMATCH: pod_score ($POD_SCORE) != atomic_score.final ($FINAL)${NC}"
  echo -e "${YELLOW}⚠️  This indicates split-brain scoring (THALET violation)${NC}"
  exit 1
fi
echo -e "  ${GREEN}✅${NC} pod_score matches atomic_score.final: ${GREEN}${POD_SCORE}${NC}"

# Step 5: Check for legacy score_trace (should still exist for backward compat)
echo ""
echo -e "${BLUE}🔍 Step 5: Checking legacy score_trace (backward compatibility)...${NC}"
SCORE_TRACE_FINAL=$(echo "$RESPONSE" | jq '.metadata.score_trace.final_score')

if [ "$SCORE_TRACE_FINAL" != "null" ]; then
  echo -e "  ${GREEN}✅${NC} Legacy score_trace.final_score: ${YELLOW}${SCORE_TRACE_FINAL}${NC} (backward compat)"
else
  echo -e "  ${YELLOW}⚠️${NC}  No legacy score_trace (acceptable for new evaluations)"
fi

# Final verdict
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎯 VERDICT: THALET IS EMITTING CORRECTLY${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✅ atomic_score.final: ${FINAL}${NC}"
echo -e "${GREEN}✅ execution_context: complete${NC}"
echo -e "${GREEN}✅ integrity_hash: ${INTEGRITY_HASH:0:32}...${NC}"
echo -e "${GREEN}✅ trace: complete${NC}"
echo -e "${GREEN}✅ pod_score consistency: verified${NC}"
echo ""
echo -e "${BLUE}📊 Full atomic_score object:${NC}"
echo "$ATOMIC_SCORE" | jq '.'
echo ""
echo -e "${GREEN}🔥 THALET Protocol is operational. Single source of truth confirmed.${NC}"

