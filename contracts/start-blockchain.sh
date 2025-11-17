#!/bin/sh

echo "🚀 Starting Hardhat blockchain node..."

# Start Hardhat node in background
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "✅ Blockchain node starting (PID: $NODE_PID)"
echo "⏳ Waiting for node to be ready..."

# Wait for node to start accepting connections
sleep 5

# Try to deploy contracts to the running node
echo "📝 Deploying contracts to running node..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if npx hardhat run scripts/deploy.ts --network localhost 2>/dev/null; then
    echo "✅ Contracts deployed successfully"
    break
  fi
  
  ATTEMPT=$((ATTEMPT + 1))
  echo "⏳ Deployment attempt $ATTEMPT/$MAX_ATTEMPTS..."
  sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "⚠️  Could not deploy contracts, but blockchain is running"
  echo "Backend will attempt to use pre-deployed addresses from environment"
fi

# Keep the node running in foreground
wait $NODE_PID




