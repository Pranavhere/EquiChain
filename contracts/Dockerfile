# Blockchain Service (Hardhat Node)
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy contract files
COPY . .

# Expose Hardhat node port
EXPOSE 8545

# Start Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
