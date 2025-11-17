#!/bin/sh

set -e

echo "🚀 Starting Hardhat blockchain node..."

# Start Hardhat node and capture the PID
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

# Wait for the node to start
echo "⏳ Waiting 10 seconds for blockchain to start..."
sleep 10

# Deploy contracts
echo "📜 Deploying contracts to localhost..."
npx hardhat run scripts/deploy.ts --network localhost

echo "✅ Blockchain and contracts are ready!"

# Keep running
wait $NODE_PID




