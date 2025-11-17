#!/bin/sh

echo "🚀 Starting Hardhat blockchain node..."

# Start Hardhat node in background
timeout 120 npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "⏳ Waiting 15 seconds for blockchain to be ready..."
sleep 15

# Try to deploy contracts with timeout
echo "📜 Deploying contracts..."
timeout 60 npx hardhat run scripts/deploy.ts --network localhost

if [ $? -eq 0 ]; then
  echo "✅ Contracts deployed successfully!"
else
  echo "⚠️  Deployment timed out or failed, but blockchain is running"
fi

echo "✅ Blockchain ready!"

# Keep the container running
wait $NODE_PID 2>/dev/null || true

echo "🛑 Blockchain stopped"


