#!/bin/bash

# EquiChain - Complete Setup Script
# This script sets up the entire project from scratch

set -e  # Exit on error

echo "🚀 EquiChain Setup Script"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) detected${NC}"

# Check if Docker is installed (optional)
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓ Docker $(docker --version) detected${NC}"
    DOCKER_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ Docker not found. Skipping Docker setup.${NC}"
    DOCKER_AVAILABLE=false
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install contracts dependencies
echo "📜 Setting up blockchain layer..."
cd contracts
npm install
echo -e "${GREEN}✓ Contracts dependencies installed${NC}"
cd ..

# Install backend dependencies
echo "🔧 Setting up backend..."
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Setup .env for backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Backend .env created${NC}"
else
    echo -e "${YELLOW}⚠ Backend .env already exists${NC}"
fi
cd ..

# Install frontend dependencies
echo "🎨 Setting up frontend..."
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Setup .env for frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Frontend .env created${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env already exists${NC}"
fi
cd ..

echo ""
echo "🔨 Compiling smart contracts..."
cd contracts
npx hardhat compile
echo -e "${GREEN}✓ Contracts compiled successfully${NC}"
cd ..

echo ""
echo "🧪 Running contract tests..."
cd contracts
npx hardhat test
echo -e "${GREEN}✓ All tests passed${NC}"
cd ..

echo ""
echo "=========================="
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo "=========================="
echo ""

if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 Docker Deployment:"
    echo "   1. Start all services: docker-compose up -d"
    echo "   2. Deploy contracts: cd contracts && npx hardhat run scripts/deploy.ts --network localhost"
    echo "   3. Access frontend: http://localhost:3000"
    echo ""
fi

echo "💻 Local Development:"
echo "   Terminal 1 - Blockchain:"
echo "     cd contracts && npx hardhat node"
echo ""
echo "   Terminal 2 - Deploy Contracts:"
echo "     cd contracts && npx hardhat run scripts/deploy.ts --network localhost"
echo ""
echo "   Terminal 3 - Backend:"
echo "     cd backend && npm run dev"
echo ""
echo "   Terminal 4 - Frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "   Then open: http://localhost:5173"
echo ""

echo "📚 For more information, see:"
echo "   - README.md"
echo "   - DEPLOYMENT.md"
echo ""

echo "Happy coding! 🎉"
