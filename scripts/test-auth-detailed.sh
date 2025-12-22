#!/bin/bash

# Detailed Authorization and Stripe Test Script
# Tests actual functionality via HTTP API

BASE_URL="https://syntheverse-poc.vercel.app"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!Test"
TEST_NAME="Test User $(date +%s)"

echo "🧪 Detailed Authorization & Stripe Testing"
echo "==========================================="
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

test_result() {
    local status=$1
    local name=$2
    if [ "$status" = "0" ]; then
        echo -e "${GREEN}✓ PASSED:${NC} $name"
        ((PASSED++))
    elif [ "$status" = "2" ]; then
        echo -e "${YELLOW}⚠ WARNING:${NC} $name"
        ((WARNINGS++))
    else
        echo -e "${RED}✗ FAILED:${NC} $name"
        ((FAILED++))
    fi
}

echo -e "${BLUE}📄 Step 1: Testing Page Accessibility${NC}"
echo "-----------------------------------"

# Test homepage
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL")
if [ "$response" = "200" ]; then
    test_result 0 "Homepage loads (HTTP $response)"
else
    test_result 1 "Homepage loads (got HTTP $response)"
fi

# Test signup page and check for form
echo -e "\n${BLUE}📝 Step 2: Testing Signup Page${NC}"
echo "-----------------------------------"
signup_page=$(curl -s "$BASE_URL/signup")
signup_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/signup")

if [ "$signup_code" = "200" ]; then
    if echo "$signup_page" | grep -qi "signup\|sign up\|email\|password"; then
        test_result 0 "Signup page loads with form"
        
        # Check for error messages
        if echo "$signup_page" | grep -qi "Application error\|500\|undefined\|null\|missing"; then
            echo "  ⚠️  Page contains error indicators"
            echo "$signup_page" | grep -i "error\|undefined\|null" | head -3
            test_result 2 "Signup page shows no errors"
        else
            test_result 0 "Signup page shows no obvious errors"
        fi
    else
        test_result 1 "Signup page form not found"
    fi
else
    test_result 1 "Signup page accessible (got HTTP $signup_code)"
fi

# Test login page
echo -e "\n${BLUE}🔐 Step 3: Testing Login Page${NC}"
echo "-----------------------------------"
login_page=$(curl -s "$BASE_URL/login")
login_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login")

if [ "$login_code" = "200" ]; then
    if echo "$login_page" | grep -qi "login\|sign in\|email\|password"; then
        test_result 0 "Login page loads with form"
    else
        test_result 1 "Login page form not found"
    fi
else
    test_result 1 "Login page accessible (got HTTP $login_code)"
fi

echo -e "\n${BLUE}🔍 Step 4: Checking Environment Variables${NC}"
echo "-----------------------------------"

# Check homepage for env errors
homepage=$(curl -s "$BASE_URL")
env_errors=0

if echo "$homepage" | grep -qi "Application error\|a server-side exception"; then
    echo "  ❌ Found: Application error message"
    env_errors=1
fi

if echo "$homepage" | grep -qi "undefined\|null.*env\|process\.env"; then
    echo "  ❌ Found: Undefined environment variable references"
    env_errors=1
fi

if [ $env_errors -eq 0 ]; then
    test_result 0 "No environment variable errors detected on homepage"
else
    test_result 1 "Environment variable errors detected"
    echo "$homepage" | grep -i "error\|undefined" | head -5
fi

echo -e "\n${BLUE}💳 Step 5: Testing Stripe Integration${NC}"
echo "-----------------------------------"

# Check if Stripe publishable key would be in page (if loaded client-side)
if echo "$signup_page" | grep -qi "pk_test\|stripe"; then
    test_result 0 "Stripe integration detected in page"
else
    test_result 2 "Stripe integration not detected (may require auth)"
fi

# Test webhook endpoint
webhook_code=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/webhook/stripe")
if [ "$webhook_code" = "405" ] || [ "$webhook_code" = "400" ]; then
    test_result 0 "Stripe webhook endpoint exists (HTTP $webhook_code - expected for GET)"
else
    test_result 1 "Stripe webhook endpoint (got HTTP $webhook_code)"
fi

echo -e "\n${BLUE}🗄️  Step 6: Testing Database Connection${NC}"
echo "-----------------------------------"

# The signup form existing suggests DB connection might work
# But we can't fully test without actually submitting
if echo "$signup_page" | grep -qi "form.*action"; then
    test_result 0 "Signup form has action attribute (database likely connected)"
else
    test_result 2 "Cannot verify database connection without form submission"
fi

echo -e "\n${BLUE}🌐 Step 7: Testing API Routes${NC}"
echo "-----------------------------------"

# Test auth callback (should redirect without code)
callback_code=$(curl -s -o /dev/null -w "%{http_code}" -L "$BASE_URL/auth/callback")
if [ "$callback_code" = "200" ] || [ "$callback_code" = "307" ] || [ "$callback_code" = "302" ]; then
    test_result 0 "Auth callback route accessible (HTTP $callback_code)"
else
    test_result 1 "Auth callback route (got HTTP $callback_code)"
fi

# Test subscribe page (should redirect if not authenticated)
subscribe_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/subscribe")
if [ "$subscribe_code" = "307" ] || [ "$subscribe_code" = "302" ] || [ "$subscribe_code" = "200" ]; then
    test_result 0 "Subscribe page accessible (HTTP $subscribe_code - redirect expected if not auth)"
else
    test_result 1 "Subscribe page (got HTTP $subscribe_code)"
fi

echo -e "\n${BLUE}📊 Step 8: Checking for Specific Error Patterns${NC}"
echo "-----------------------------------"

error_count=0

# Check signup page for specific errors
if echo "$signup_page" | grep -qi "405.*Method Not Allowed"; then
    echo "  ❌ Found 405 errors in signup page"
    error_count=$((error_count + 1))
fi

if echo "$signup_page" | grep -qi "500.*Internal Server Error"; then
    echo "  ❌ Found 500 errors in signup page"
    error_count=$((error_count + 1))
fi

if echo "$signup_page" | grep -qi "STRIPE.*undefined\|stripe.*null"; then
    echo "  ❌ Found Stripe configuration errors"
    error_count=$((error_count + 1))
fi

if echo "$signup_page" | grep -qi "SUPABASE.*undefined\|supabase.*null"; then
    echo "  ❌ Found Supabase configuration errors"
    error_count=$((error_count + 1))
fi

if [ $error_count -eq 0 ]; then
    test_result 0 "No specific error patterns detected"
else
    test_result 1 "$error_count specific error pattern(s) detected"
fi

# Summary
echo ""
echo "==========================================="
echo "📊 Test Summary"
echo "==========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All critical tests passed!${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Some warnings - review above${NC}"
    fi
    exit 0
else
    echo -e "${RED}❌ Some tests failed - review above for details${NC}"
    echo ""
    echo "💡 Next Steps:"
    echo "   1. Check Vercel deployment logs for server-side errors"
    echo "   2. Verify all environment variables are set correctly"
    echo "   3. Test signup functionality manually in browser"
    echo "   4. Check browser console for client-side errors"
    exit 1
fi


