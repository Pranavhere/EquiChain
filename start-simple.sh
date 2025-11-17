#!/bin/bash

# Simple startup without Docker - uses SQLite instead
set -e

echo "🚀 Starting EquiChain (No Docker Mode)..."
echo ""

# Kill processes on ports
echo "📦 Cleaning up ports..."
lsof -ti:8545 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Update backend to use SQLite
echo "🔧 Configuring backend for SQLite..."
cd backend
cat > .env << 'EOF'
DATABASE_URL=sqlite://./equichain.db
RPC_URL=http://localhost:8545
CUSTODIAN_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
JWT_SECRET=your_super_secret_jwt_key_change_in_production
PORT=8000
NODE_ENV=development
EOF
cd ..

# Start Hardhat
echo "⛓️  Starting Hardhat blockchain..."
cd contracts
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
echo "   PID: $HARDHAT_PID"
cd ..

sleep 5

# Deploy contracts
echo "📜 Deploying contracts..."
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
cd ..

sleep 2

# Start backend
echo "🔧 Starting backend..."
cd backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   PID: $BACKEND_PID"
cd ..

sleep 8

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
cp .env.example .env 2>/dev/null || true
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   PID: $FRONTEND_PID"
cd ..

sleep 5

echo ""
echo "============================================"
echo "✅ EquiChain is RUNNING!"
echo "============================================"
echo ""
echo "📍 Open your browser:"
echo "   👉 http://localhost:5173"
echo ""
echo "📊 Check status:"
echo "   Blockchain: curl http://localhost:8545"
echo "   Backend:    curl http://localhost:8000/market/price"
echo ""
echo "📝 View logs:"
echo "   tail -f /tmp/hardhat.log"
echo "   tail -f /tmp/backend.log"
echo "   tail -f /tmp/frontend.log"
echo ""
echo "🛑 Stop all:"
echo "   kill $HARDHAT_PID $BACKEND_PID $FRONTEND_PID"
echo ""

# Keep script running and tail logs
tail -f /tmp/backend.log
