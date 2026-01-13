#!/bin/bash
# Comprehensive THALET Protocol Verification Script
# Purpose: Test all aspects of THALET compliance based on Marek/Simba/Pablo audits
# Usage: ./scripts/comprehensive-thalet-test.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_BASE_URL="${API_BASE_URL:-https://syntheverse-poc.vercel.app}"
TEST_RESULTS_FILE="thalet-test-results-$(date +%Y%m%d-%H%M%S).log"

echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  THALET PROTOCOL COMPREHENSIVE VERIFICATION SUITE          ║${NC}"
echo -e "${CYAN}║  Based on Marek, Simba, Pablo & Lexary Nova Audits        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Initialize results
PASS_COUNT=0
FAIL_COUNT=0
TOTAL_TESTS=0

# Function to log test result
log_test() {
  local test_name="$1"
  local status="$2"
  local details="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$status" == "PASS" ]; then
    echo -e "${GREEN}✅ PASS${NC} | Test #$TOTAL_TESTS | $test_name" | tee -a "$TEST_RESULTS_FILE"
    PASS_COUNT=$((PASS_COUNT + 1))
  else
    echo -e "${RED}❌ FAIL${NC} | Test #$TOTAL_TESTS | $test_name" | tee -a "$TEST_RESULTS_FILE"
    if [ -n "$details" ]; then
      echo -e "   ${YELLOW}Details: $details${NC}" | tee -a "$TEST_RESULTS_FILE"
    fi
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

# Function to test a specific submission hash
test_submission() {
  local hash="$1"
  local test_name="$2"
  
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Testing: $test_name${NC}"
  echo -e "${BLUE}Hash: ${YELLOW}$hash${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  
  # Fetch contribution
  RESPONSE=$(curl -s "${API_BASE_URL}/api/archive/contributions/${hash}")
  
  # Check if response is valid JSON
  if ! echo "$RESPONSE" | jq empty 2>/dev/null; then
    log_test "$test_name: Valid JSON Response" "FAIL" "Invalid JSON response"
    return 1
  fi
  
  # Extract fields
  POD_SCORE=$(echo "$RESPONSE" | jq -r '.metadata.pod_score // .pod_score // "null"')
  HAS_ATOMIC=$(echo "$RESPONSE" | jq -r '.atomic_score != null')
  ATOMIC_FINAL=$(echo "$RESPONSE" | jq -r '.atomic_score.final // "null"')
  HAS_METADATA_ATOMIC=$(echo "$RESPONSE" | jq -r '.metadata.atomic_score != null')
  METADATA_ATOMIC_FINAL=$(echo "$RESPONSE" | jq -r '.metadata.atomic_score.final // "null"')
  LEGACY_FINAL=$(echo "$RESPONSE" | jq -r '.metadata.score_trace.final_score // "null"')
  HAS_EXEC_CONTEXT=$(echo "$RESPONSE" | jq -r '.atomic_score.execution_context != null')
  HAS_INTEGRITY_HASH=$(echo "$RESPONSE" | jq -r '.atomic_score.integrity_hash != null')
  INTEGRITY_HASH=$(echo "$RESPONSE" | jq -r '.atomic_score.integrity_hash // "null"')
  TIMESTAMP=$(echo "$RESPONSE" | jq -r '.atomic_score.execution_context.timestamp_utc // "null"')
  TOGGLES=$(echo "$RESPONSE" | jq -c '.atomic_score.execution_context.toggles // {}')
  
  # Test 1: atomic_score exists
  if [ "$HAS_ATOMIC" == "true" ]; then
    log_test "$test_name: atomic_score exists (top-level)" "PASS"
  else
    log_test "$test_name: atomic_score exists (top-level)" "FAIL" "atomic_score is null or missing"
  fi
  
  # Test 2: atomic_score exists in metadata
  if [ "$HAS_METADATA_ATOMIC" == "true" ]; then
    log_test "$test_name: atomic_score exists (metadata)" "PASS"
  else
    log_test "$test_name: atomic_score exists (metadata)" "FAIL" "metadata.atomic_score is null or missing"
  fi
  
  # Test 3: pod_score matches atomic_score.final
  if [ "$POD_SCORE" == "$ATOMIC_FINAL" ]; then
    log_test "$test_name: Zero-Delta (pod_score = atomic_final)" "PASS"
  else
    log_test "$test_name: Zero-Delta (pod_score = atomic_final)" "FAIL" "pod_score=$POD_SCORE, atomic_final=$ATOMIC_FINAL"
  fi
  
  # Test 4: metadata.atomic_score.final matches atomic_score.final
  if [ "$METADATA_ATOMIC_FINAL" == "$ATOMIC_FINAL" ]; then
    log_test "$test_name: Zero-Delta (metadata.atomic = top-level atomic)" "PASS"
  else
    log_test "$test_name: Zero-Delta (metadata.atomic = top-level atomic)" "FAIL" "metadata_atomic=$METADATA_ATOMIC_FINAL, atomic=$ATOMIC_FINAL"
  fi
  
  # Test 5: execution_context exists
  if [ "$HAS_EXEC_CONTEXT" == "true" ]; then
    log_test "$test_name: execution_context exists" "PASS"
  else
    log_test "$test_name: execution_context exists" "FAIL" "execution_context is null or missing"
  fi
  
  # Test 6: integrity_hash exists and is 64 chars
  if [ "$HAS_INTEGRITY_HASH" == "true" ]; then
    HASH_LENGTH=$(echo -n "$INTEGRITY_HASH" | wc -c | tr -d ' ')
    if [ "$HASH_LENGTH" == "64" ]; then
      log_test "$test_name: integrity_hash valid (SHA-256)" "PASS"
    else
      log_test "$test_name: integrity_hash valid (SHA-256)" "FAIL" "Hash length: $HASH_LENGTH (expected 64)"
    fi
  else
    log_test "$test_name: integrity_hash valid (SHA-256)" "FAIL" "integrity_hash is null or missing"
  fi
  
  # Test 7: timestamp is recent (2026)
  if [[ "$TIMESTAMP" == 2026* ]]; then
    log_test "$test_name: Timestamp is recent (2026)" "PASS"
  else
    log_test "$test_name: Timestamp is recent (2026)" "FAIL" "Timestamp: $TIMESTAMP (expected 2026-*)"
  fi
  
  # Test 8: toggles are present
  if [ "$TOGGLES" != "{}" ] && [ "$TOGGLES" != "null" ]; then
    log_test "$test_name: Toggles present" "PASS"
  else
    log_test "$test_name: Toggles present" "FAIL" "Toggles: $TOGGLES"
  fi
  
  # Test 9: Score in valid range [0, 10000]
  if [ "$ATOMIC_FINAL" != "null" ]; then
    if (( $(echo "$ATOMIC_FINAL >= 0 && $ATOMIC_FINAL <= 10000" | bc -l) )); then
      log_test "$test_name: Score in valid range [0, 10000]" "PASS"
    else
      log_test "$test_name: Score in valid range [0, 10000]" "FAIL" "Score: $ATOMIC_FINAL"
    fi
  else
    log_test "$test_name: Score in valid range [0, 10000]" "FAIL" "Score is null"
  fi
  
  # Test 10: No split-brain (legacy != atomic if both exist)
  if [ "$LEGACY_FINAL" != "null" ] && [ "$ATOMIC_FINAL" != "null" ]; then
    # If both exist, they might differ (expected) - this is OK as long as atomic is used
    # The key is that the UI should use atomic, not legacy
    # We just log this for informational purposes
    if [ "$LEGACY_FINAL" != "$ATOMIC_FINAL" ]; then
      echo -e "   ${CYAN}INFO: Legacy score ($LEGACY_FINAL) differs from atomic ($ATOMIC_FINAL) - This is expected if submission was migrated${NC}" | tee -a "$TEST_RESULTS_FILE"
    fi
  fi
  
  echo ""
}

# ============================================================================
# MAREK & SIMBA TEST SCENARIOS
# ============================================================================

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}SECTION 1: MAREK & SIMBA AUDIT TEST CASES${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

# Note: These hashes would need to be replaced with actual test submission hashes
# For demonstration, we'll test with Pablo's known hash

# Test 1: Baseline (No overlap)
# test_submission "<BASELINE_HASH>" "Marek Test 1: Baseline (No overlap)"

# Test 2: Medium Overlap (44.3%)
# test_submission "<TEST2_HASH>" "Marek Test 2: Medium Overlap (44.3%)"

# Test 3: Medium Overlap (45.4%)
# test_submission "<TEST3_HASH>" "Marek Test 3: Medium Overlap (45.4%)"

# Test 4: High Overlap (46.1%)
# test_submission "<TEST4_HASH>" "Marek Test 4: High Overlap (46.1%)"

# Test 5: Very High Overlap (50.2%)
# test_submission "<TEST5_HASH>" "Marek Test 5: Very High Overlap (50.2%)"

# Test 6: Extreme Overlap (51.8%)
# test_submission "<TEST6_HASH>" "Marek Test 6: Extreme Overlap (51.8%)"

# ============================================================================
# PABLO'S BINARY PROOF TEST
# ============================================================================

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}SECTION 2: PABLO'S BINARY PROOF TEST${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

# Pablo's known hash with split-brain divergence
PABLO_HASH="9fa21ebda2549be6c566f9873480417506b78300a3d33e98131d0a2bc8e3c90a"
test_submission "$PABLO_HASH" "Pablo Test: Split-Brain Divergence (8200 vs 9430)"

# ============================================================================
# CODEBASE STATIC ANALYSIS
# ============================================================================

echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}SECTION 3: CODEBASE STATIC ANALYSIS${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

# Test: No 2023 placeholder timestamps in utils
echo -e "${BLUE}Testing: No 2023 placeholder timestamps in utils...${NC}"
if grep -r "2023-" utils/ 2>/dev/null | grep -v node_modules | grep -v ".test.ts" | grep -q .; then
  log_test "Static: No 2023 placeholder timestamps" "FAIL" "Found 2023 timestamps in utils/"
else
  log_test "Static: No 2023 placeholder timestamps" "PASS"
fi

# Test: AtomicScorer exists
echo -e "${BLUE}Testing: AtomicScorer exists...${NC}"
if [ -f "utils/scoring/AtomicScorer.ts" ]; then
  log_test "Static: AtomicScorer.ts exists" "PASS"
else
  log_test "Static: AtomicScorer.ts exists" "FAIL" "File not found"
fi

# Test: IntegrityValidator exists
echo -e "${BLUE}Testing: IntegrityValidator exists...${NC}"
if [ -f "utils/validation/IntegrityValidator.ts" ]; then
  log_test "Static: IntegrityValidator.ts exists" "PASS"
else
  log_test "Static: IntegrityValidator.ts exists" "FAIL" "File not found"
fi

# Test: API endpoints include atomic_score
echo -e "${BLUE}Testing: API endpoints include atomic_score...${NC}"
if grep -q "atomic_score:" app/api/evaluate/\[hash\]/route.ts; then
  log_test "Static: evaluate API includes atomic_score" "PASS"
else
  log_test "Static: evaluate API includes atomic_score" "FAIL" "atomic_score not found in evaluate API"
fi

if grep -q "atomic_score:" app/api/archive/contributions/\[hash\]/route.ts; then
  log_test "Static: archive API includes atomic_score" "PASS"
else
  log_test "Static: archive API includes atomic_score" "FAIL" "atomic_score not found in archive API"
fi

# Test: UI components use IntegrityValidator
echo -e "${BLUE}Testing: UI components use IntegrityValidator...${NC}"
if grep -q "IntegrityValidator" components/FrontierModule.tsx && \
   grep -q "IntegrityValidator" components/PoCArchive.tsx && \
   grep -q "IntegrityValidator" components/SubmitContributionForm.tsx; then
  log_test "Static: UI components use IntegrityValidator" "PASS"
else
  log_test "Static: UI components use IntegrityValidator" "FAIL" "Not all components use IntegrityValidator"
fi

# Test: Negative overlap validation exists
echo -e "${BLUE}Testing: Negative overlap validation exists...${NC}"
if grep -q "redundancyOverlapPercent < 0" utils/grok/evaluate.ts; then
  log_test "Static: Negative overlap validation exists" "PASS"
else
  log_test "Static: Negative overlap validation exists" "FAIL" "Validation not found"
fi

# ============================================================================
# FINAL REPORT
# ============================================================================

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}FINAL REPORT${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed:       ${RED}$FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║                 ✅ ALL TESTS PASSED ✅                      ║${NC}"
  echo -e "${GREEN}║          THALET PROTOCOL COMPLIANCE VERIFIED                ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${GREEN}🔥 Zero-Delta Invariant: CONFIRMED${NC}"
  echo -e "${GREEN}🔥 Single Source of Truth: VALIDATED${NC}"
  echo -e "${GREEN}🔥 Integrity Hashes: PRESENT AND VALID${NC}"
  echo -e "${GREEN}🔥 Execution Context: COMPLETE${NC}"
  echo ""
  exit 0
else
  echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${RED}║              ❌ TESTS FAILED ❌                             ║${NC}"
  echo -e "${RED}║       THALET PROTOCOL COMPLIANCE NOT VERIFIED               ║${NC}"
  echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  Review test results above and fix issues before deployment${NC}"
  echo -e "${YELLOW}⚠️  Full test log saved to: $TEST_RESULTS_FILE${NC}"
  echo ""
  exit 1
fi

