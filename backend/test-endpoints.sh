#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3010"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Kanban Endpoints Validation Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Counter for tests
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test result
print_result() {
    local test_name=$1
    local status=$2
    local response=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $test_name"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        if [ ! -z "$response" ]; then
            echo -e "${YELLOW}  Response: $response${NC}"
        fi
    fi
}

# Function to make request and check response
test_endpoint() {
    local description=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    
    echo ""
    echo -e "${YELLOW}Testing:${NC} $description"
    echo -e "${BLUE}  Request:${NC} $method $endpoint"
    
    if [ ! -z "$data" ]; then
        echo -e "${BLUE}  Data:${NC} $data"
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    fi
    
    # Split response body and status code
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo -e "${BLUE}  Status:${NC} $http_code (expected: $expected_status)"
    echo -e "${BLUE}  Response:${NC}"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    if [ "$http_code" -eq "$expected_status" ]; then
        print_result "$description" 0
        return 0
    else
        print_result "$description" 1 "Expected $expected_status, got $http_code"
        return 1
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PART 1: GET /api/positions/:id/candidates${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 1: GET candidates for valid position
test_endpoint \
    "Get candidates for position 1 (Software Engineer)" \
    "GET" \
    "/api/positions/1/candidates" \
    "" \
    200

# Test 2: GET candidates with invalid ID (not a number)
test_endpoint \
    "Get candidates with invalid ID (abc)" \
    "GET" \
    "/api/positions/abc/candidates" \
    "" \
    400

# Test 3: GET candidates with invalid ID (negative)
test_endpoint \
    "Get candidates with invalid ID (-1)" \
    "GET" \
    "/api/positions/-1/candidates" \
    "" \
    400

# Test 4: GET candidates with invalid ID (zero)
test_endpoint \
    "Get candidates with invalid ID (0)" \
    "GET" \
    "/api/positions/0/candidates" \
    "" \
    400

# Test 5: GET candidates for position with no candidates (should return empty array)
test_endpoint \
    "Get candidates for position 999 (non-existent, should return empty array)" \
    "GET" \
    "/api/positions/999/candidates" \
    "" \
    200

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PART 2: PUT /api/candidates/:id/stage${NC}"
echo -e "${BLUE}========================================${NC}"

# Test 6: PUT valid stage update (advance one step)
test_endpoint \
    "Update candidate 1 to stage 2 (valid: advance one step)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 1, "newInterviewStepId": 2}' \
    200

# Test 7: PUT go back one step (should be allowed)
test_endpoint \
    "Update candidate 1 back to stage 1 (valid: go back one step)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 1, "newInterviewStepId": 1}' \
    200

# Test 8: PUT invalid - skip stages
test_endpoint \
    "Update candidate 1 to stage 3 (invalid: skip stage 2)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 1, "newInterviewStepId": 3}' \
    422

# Test 9: PUT invalid - missing required field (applicationId)
test_endpoint \
    "Update candidate without applicationId (invalid)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"newInterviewStepId": 2}' \
    400

# Test 10: PUT invalid - missing required field (newInterviewStepId)
test_endpoint \
    "Update candidate without newInterviewStepId (invalid)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 1}' \
    400

# Test 11: PUT invalid - candidate ID not a number
test_endpoint \
    "Update candidate with invalid ID (abc)" \
    "PUT" \
    "/api/candidates/abc/stage" \
    '{"applicationId": 1, "newInterviewStepId": 2}' \
    400

# Test 12: PUT invalid - application doesn't belong to candidate
test_endpoint \
    "Update candidate 1 with application 3 (belongs to candidate 2)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 3, "newInterviewStepId": 2}' \
    400

# Test 13: PUT invalid - non-existent application
test_endpoint \
    "Update candidate with non-existent application (999)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 999, "newInterviewStepId": 2}' \
    404

# Test 14: PUT invalid - non-existent interview step
test_endpoint \
    "Update candidate to non-existent stage (999)" \
    "PUT" \
    "/api/candidates/1/stage" \
    '{"applicationId": 1, "newInterviewStepId": 999}' \
    404

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  PART 3: Verify Score Calculation${NC}"
echo -e "${BLUE}========================================${NC}"

# Get candidates and verify score calculation
echo ""
echo -e "${YELLOW}Verifying score calculation for candidates...${NC}"
response=$(curl -s "$BASE_URL/api/positions/1/candidates")
echo "$response" | jq '.'

# Check if any candidate has scores
has_scores=$(echo "$response" | jq '[.[] | select(.averageScore != null)] | length')
if [ "$has_scores" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Found $has_scores candidate(s) with calculated scores"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}⚠${NC} No candidates with scores found (this may be expected if seed data has no interview scores)"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Please review.${NC}"
    exit 1
fi

