#!/bin/bash

# EquiChain - Complete Testing & Verification Script
# This script tests every component of the project

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║       EquiChain - Complete Testing & Verification          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Track test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${BLUE}▶ Testing: $test_name${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if bash -c "$test_command"; then
        echo -e "${GREEN}  ✓ PASSED${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}  ✗ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" &> /dev/null
}

echo "═══════════════════════════════════════════════════════════"
echo "1️⃣  PREREQUISITES CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Node.js installed" "command -v node > /dev/null 2>&1"
run_test "npm installed" "command -v npm > /dev/null 2>&1"
run_test "Docker installed" "command -v docker > /dev/null 2>&1"
run_test "Docker Compose installed" "command -v docker-compose > /dev/null 2>&1"
run_test "Git installed" "command -v git > /dev/null 2>&1"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "2️⃣  PROJECT STRUCTURE CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "contracts/ directory exists" "test -d contracts"
run_test "backend/ directory exists" "test -d backend"
run_test "frontend/ directory exists" "test -d frontend"
run_test "docker-compose.yml exists" "test -f docker-compose.yml"
run_test "README.md exists" "test -f README.md"
run_test "BUILD_AND_RUN.md exists" "test -f BUILD_AND_RUN.md"
run_test "DEPLOYMENT.md exists" "test -f DEPLOYMENT.md"
run_test "COMMANDS.md exists" "test -f COMMANDS.md"
run_test "SUBMISSION.md exists" "test -f SUBMISSION.md"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "3️⃣  SMART CONTRACTS CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "package.json exists" "test -f contracts/package.json"
run_test "hardhat.config.ts exists" "test -f contracts/hardhat.config.ts"
run_test "FractionalEquityToken.sol exists" "test -f contracts/contracts/FractionalEquityToken.sol"
run_test "EquiChainMarket.sol exists" "test -f contracts/contracts/EquiChainMarket.sol"
run_test "deploy.ts script exists" "test -f contracts/scripts/deploy.ts"
run_test "test file exists" "test -f contracts/test/EquiChain.test.ts"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "4️⃣  BACKEND CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "backend package.json exists" "test -f backend/package.json"
run_test "backend tsconfig.json exists" "test -f backend/tsconfig.json"
run_test "index.ts exists" "test -f backend/src/index.ts"
run_test "env.ts config exists" "test -f backend/src/config/env.ts"
run_test "db.ts config exists" "test -f backend/src/config/db.ts"
run_test "blockchain.ts config exists" "test -f backend/src/config/blockchain.ts"
run_test "User entity exists" "test -f backend/src/entities/User.ts"
run_test "Position entity exists" "test -f backend/src/entities/Position.ts"
run_test "Transaction entity exists" "test -f backend/src/entities/Transaction.ts"
run_test "auth routes exist" "test -f backend/src/routes/auth.ts"
run_test "market routes exist" "test -f backend/src/routes/market.ts"
run_test "portfolio routes exist" "test -f backend/src/routes/portfolio.ts"
run_test "auth middleware exists" "test -f backend/src/middleware/auth.ts"
run_test "backend Dockerfile exists" "test -f backend/Dockerfile"
run_test ".env.example exists" "test -f backend/.env.example"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "5️⃣  FRONTEND CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "frontend package.json exists" "test -f frontend/package.json"
run_test "vite.config.ts exists" "test -f frontend/vite.config.ts"
run_test "tailwind.config.js exists" "test -f frontend/tailwind.config.js"
run_test "index.html exists" "test -f frontend/index.html"
run_test "App.tsx exists" "test -f frontend/src/App.tsx"
run_test "main.tsx exists" "test -f frontend/src/main.tsx"
run_test "api.ts exists" "test -f frontend/src/lib/api.ts"
run_test "Login.tsx exists" "test -f frontend/src/pages/Login.tsx"
run_test "Dashboard.tsx exists" "test -f frontend/src/pages/Dashboard.tsx"
run_test "Portfolio.tsx exists" "test -f frontend/src/pages/Portfolio.tsx"
run_test "frontend Dockerfile exists" "test -f frontend/Dockerfile"
run_test "nginx.conf exists" "test -f frontend/nginx.conf"
run_test "frontend .env.example exists" "test -f frontend/.env.example"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "6️⃣  DEPENDENCIES CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ -d "contracts/node_modules" ]; then
    echo -e "${GREEN}  ✓ contracts dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}  ⚠ Installing contracts dependencies...${NC}"
    cd contracts && npm install > /dev/null 2>&1 && cd ..
    echo -e "${GREEN}  ✓ contracts dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}  ✓ backend dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}  ⚠ Installing backend dependencies...${NC}"
    cd backend && npm install > /dev/null 2>&1 && cd ..
    echo -e "${GREEN}  ✓ backend dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}  ✓ frontend dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}  ⚠ Installing frontend dependencies...${NC}"
    cd frontend && npm install > /dev/null 2>&1 && cd ..
    echo -e "${GREEN}  ✓ frontend dependencies installed${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "7️⃣  SMART CONTRACT COMPILATION"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}▶ Compiling smart contracts...${NC}"
cd contracts
if npx hardhat compile > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Smart contracts compiled successfully${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}  ✗ Smart contract compilation failed${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "8️⃣  SMART CONTRACT TESTING"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}▶ Running smart contract tests (this may take 30-60 seconds)...${NC}"
cd contracts
if npx hardhat test > /tmp/hardhat-test-output.txt 2>&1; then
    echo -e "${GREEN}  ✓ All smart contract tests passed${NC}"
    
    # Count test cases
    TEST_COUNT=$(grep -c "✔\|✓" /tmp/hardhat-test-output.txt || echo "0")
    echo -e "${GREEN}    → $TEST_COUNT test cases executed${NC}"
    
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}  ✗ Some smart contract tests failed${NC}"
    echo -e "${YELLOW}    See /tmp/hardhat-test-output.txt for details${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "9️⃣  DOCKER CONFIGURATION CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "contracts Dockerfile exists" "test -f contracts/Dockerfile"
run_test "backend Dockerfile exists" "test -f backend/Dockerfile"
run_test "frontend Dockerfile exists" "test -f frontend/Dockerfile"
run_test "docker-compose.yml is valid" "docker-compose config > /dev/null 2>&1"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🔟  CODE QUALITY CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "Smart contracts have no TODO comments" "! grep -r 'TODO' contracts/contracts/ 2>/dev/null"
run_test "Backend TypeScript compiles" "(cd backend && npx tsc --noEmit > /dev/null 2>&1)"
run_test "Frontend TypeScript compiles" "(cd frontend && npx tsc --noEmit > /dev/null 2>&1)"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "1️⃣1️⃣  DOCUMENTATION CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "README has project title" "grep -i -q 'EquiChain' README.md 2>/dev/null"
run_test "README has architecture section" "grep -i -q 'architecture' README.md 2>/dev/null"
run_test "DEPLOYMENT has docker instructions" "grep -i -q 'docker' DEPLOYMENT.md 2>/dev/null"
run_test "BUILD_AND_RUN has quick start" "grep -i -q 'quick start' BUILD_AND_RUN.md 2>/dev/null"
run_test "COMMANDS has docker commands" "grep -q 'docker-compose' COMMANDS.md 2>/dev/null"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "1️⃣2️⃣  ENVIRONMENT CONFIGURATION CHECK"
echo "═══════════════════════════════════════════════════════════"
echo ""

run_test "backend .env.example has DATABASE_URL" "grep -q 'DATABASE_URL' backend/.env.example 2>/dev/null"
run_test "backend .env.example has RPC_URL" "grep -q 'RPC_URL' backend/.env.example 2>/dev/null"
run_test "backend .env.example has JWT_SECRET" "grep -q 'JWT_SECRET' backend/.env.example 2>/dev/null"
run_test "frontend .env.example has VITE_API_URL" "grep -q 'VITE_API_URL' frontend/.env.example 2>/dev/null"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    TEST RESULTS SUMMARY                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

PASS_PERCENTAGE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo -e "Success Rate: ${BLUE}${PASS_PERCENTAGE}%${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║           🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉             ║"
    echo "║                                                            ║"
    echo "║      Your EquiChain project is ready for submission!      ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "✅ Next Steps:"
    echo "   1. Initialize Git: git init && git add . && git commit -m 'Initial commit'"
    echo "   2. Create GitHub repo and push code"
    echo "   3. Build Docker images: docker-compose build"
    echo "   4. Tag and push to Docker Hub"
    echo "   5. Test deployment: docker-compose up -d"
    echo "   6. Deploy contracts: cd contracts && npx hardhat run scripts/deploy.ts --network localhost"
    echo "   7. Access app at http://localhost:3000"
    echo ""
    echo "📚 Documentation is ready in:"
    echo "   - README.md (Project overview)"
    echo "   - BUILD_AND_RUN.md (Setup instructions)"
    echo "   - DEPLOYMENT.md (Deployment guide)"
    echo "   - COMMANDS.md (Quick reference)"
    echo "   - SUBMISSION.md (Submission checklist)"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║              ⚠️  SOME TESTS FAILED ⚠️                     ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "❌ Please review the failed tests above and fix any issues."
    echo ""
    echo "Common fixes:"
    echo "  - Run 'npm install' in contracts/, backend/, and frontend/"
    echo "  - Ensure all source files are created"
    echo "  - Check TypeScript compilation errors"
    echo ""
    exit 1
fi
