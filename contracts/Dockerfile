# Blockchain Service (Hardhat Node)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy contract files
COPY . .

# Copy and set up startup script
COPY start-blockchain.sh /start-blockchain.sh
RUN chmod +x /start-blockchain.sh

# Expose Hardhat node port
EXPOSE 8545

# Start Hardhat node with auto-deployment
CMD ["/start-blockchain.sh"]
