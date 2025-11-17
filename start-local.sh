#!/bin/bash

# EquiChain - Local Development Startup Script
set -e

echo "🚀 Starting EquiChain locally..."
echo ""

# Kill any processes on required ports
echo "📦 Cleaning up ports..."
lsof -ti:5432 | xargs kill -9 2>/dev/null || true
lsof -ti:8545 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# Clean up old containers
echo "🧹 Removing old containers..."
docker rm -f equichain-postgres 2>/dev/null || true

# Start PostgreSQL
echo "🗄️  Starting PostgreSQL..."
docker run -d \
  --name equichain-postgres \
  -e POSTGRES_USER=equi \
  -e POSTGRES_PASSWORD=equi \
  -e POSTGRES_DB=equichain \
  -p 5432:5432 \
  postgres:16-alpine

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 8

# Start Hardhat node in background
echo "⛓️  Starting Hardhat blockchain node..."
cd contracts
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
cd ..

echo "⏳ Waiting for Hardhat node..."
sleep 5

# Deploy contracts
echo "📜 Deploying smart contracts..."
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
cd ..

# Start backend
echo "🔧 Starting backend server..."
cd backend
cp .env.example .env 2>/dev/null || true
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to initialize..."
sleep 8

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
cp .env.example .env 2>/dev/null || true
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "============================================"
echo "✅ EquiChain is running!"
echo "============================================"
echo ""
echo "📍 Access Points:"
echo "   Frontend:   http://localhost:5173"
echo "   Backend:    http://localhost:8000"
echo "   Blockchain: http://localhost:8545"
echo "   Database:   localhost:5432"
echo ""
echo "📝 Process IDs:"
echo "   Hardhat:    $HARDHAT_PID"
echo "   Backend:    $BACKEND_PID"
echo "   Frontend:   $FRONTEND_PID"
echo ""
echo "📊 View logs:"
echo "   Hardhat:    tail -f /tmp/hardhat.log"
echo "   Backend:    tail -f /tmp/backend.log"
echo "   Frontend:   tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "   kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID"
echo "   docker stop equichain-postgres"
echo ""
echo "Press Ctrl+C to stop monitoring..."
echo ""

# Monitor logs
tail -f /tmp/backend.log /tmp/frontend.log
