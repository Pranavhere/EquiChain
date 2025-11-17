#!/bin/sh

echo "🚀 Starting Hardhat blockchain node..."

# Start Hardhat node in background
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

echo "⏳ Waiting for blockchain to be ready..."
sleep 10

# Try to deploy contracts, with retries
DEPLOY_ATTEMPTS=0
MAX_DEPLOY_ATTEMPTS=5

while [ $DEPLOY_ATTEMPTS -lt $MAX_DEPLOY_ATTEMPTS ]; do
  echo "📜 Deploying contracts (attempt $((DEPLOY_ATTEMPTS + 1))/$MAX_DEPLOY_ATTEMPTS)..."
  
  if npx hardhat run scripts/deploy.ts --network localhost; then
    echo "✅ Contracts deployed successfully!"
    break
  else
    DEPLOY_ATTEMPTS=$((DEPLOY_ATTEMPTS + 1))
    if [ $DEPLOY_ATTEMPTS -lt $MAX_DEPLOY_ATTEMPTS ]; then
      echo "⚠️  Deployment failed, retrying in 5 seconds..."
      sleep 5
    fi
  fi
done

if [ $DEPLOY_ATTEMPTS -eq $MAX_DEPLOY_ATTEMPTS ]; then
  echo "❌ Failed to deploy contracts after $MAX_DEPLOY_ATTEMPTS attempts"
fi

echo "✅ Blockchain ready!"

# Keep the container running
wait $NODE_PID

