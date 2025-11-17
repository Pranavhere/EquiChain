#!/bin/sh

echo "🚀 Starting Hardhat blockchain node..."

# Start Hardhat node in background
npx hardhat node --hostname 0.0.0.0 &

# Wait for node to be ready
echo "⏳ Waiting for blockchain to be ready..."
sleep 5

# Deploy contracts
echo "📜 Deploying contracts..."
npx hardhat run scripts/deploy.ts --network localhost

echo "✅ Blockchain ready with contracts deployed!"

# Keep the container running
wait
