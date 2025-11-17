# 🏦 EquiChain - Fractional Equity Trading Platform

## 🌐 Live Deployment

**🚀 [Visit EquiChain Live](https://equichain-frontend-production.up.railway.app/)**

The application is fully deployed and operational on Railway.app with:
- ✅ Full blockchain integration (Hardhat node)
- ✅ PostgreSQL database
- ✅ Smart contracts deployed
- ✅ Real-time trading with blockchain transactions

## 📖 Overview

**EquiChain** is a blockchain-based decentralized application (DApp) that enables fractional ownership of high-value equities. Users can invest in expensive stocks like MRF (₹1,00,000+) starting from just ₹1 using blockchain-based fractional tokens.

### 🎯 Key Features

- **✅ Fractional Equity Ownership**: Buy fractions of expensive stocks starting from ₹1
- **✅ Blockchain-Powered**: ERC-20 tokens represent fractional ownership on Ethereum-compatible chain
- **✅ Real-time Stock Data**: Live prices from Yahoo Finance (NIFTTY 50 stocks)
- **✅ Three-Tier Architecture**: Clean separation of Web UI, API Layer, and Blockchain + Database
- **✅ Fully Dockerized**: Complete containerization for easy deployment on Railway
- **✅ Secure Authentication**: JWT-based user authentication
- **✅ Real-time Portfolio**: Track your fractional holdings and transaction history
- **✅ Live Blockchain Explorer**: View all transactions and blocks in real-time
- **✅ Order Book**: Live bid/ask spreads for market data
- **✅ Multi-Stock Support**: Trade various stocks with blockchain transactions

## 📸 Screenshots

### Dashboard - Live Trading Interface
View real-time stock prices and market data:

![Dashboard Screenshot](./Dashboard.png)

Features shown:
- Real-time prices for NIFTY 50 stocks
- Live market data with price changes and spreads

### Buy/Sell Trading Interface
Execute trades directly from the platform:

![Buy/Sell Screenshot](./Buy:Sell.png)

Features shown:
- Order book with bid/ask levels
- Instant buy/sell execution
- Order confirmation and details

### Recent Transactions
Track all your trading activity:

![Recent Transactions Screenshot](./RecentTxns.png)

Features shown:
- Complete transaction history
- Blockchain transaction hashes
- Buy/Sell status indicators
- Timestamp and amount details

### Smart Contract Details
Monitor blockchain interactions:

![Smart Contract Details Screenshot](./Smartcontractdetails.png)

Features shown:
- Contract deployment information
- Transaction gas usage
- Block information
- Contract state details

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     TIER 1: WEB INTERFACE                    │
│                    React + Vite + Tailwind                   │
│          (Login, Dashboard, Portfolio Management)            │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│                   TIER 2: APPLICATION LAYER                  │
│                   Node.js + Express + TypeORM                │
│        (Authentication, Market Logic, Portfolio API)         │
└──────────────┬───────────────────────────┬───────────────────┘
               │                           │
               │ Web3 Calls                │ SQL Queries
               │                           │
┌──────────────▼────────────┐   ┌──────────▼──────────────────┐
│  TIER 3: BLOCKCHAIN LAYER │   │   TIER 3: DATABASE LAYER    │
│    Hardhat + Solidity     │   │      PostgreSQL + TypeORM   │
│  (Smart Contracts: Token  │   │  (Users, Positions, Txns)   │
│   & Market Management)    │   │                             │
└───────────────────────────┘   └─────────────────────────────┘
```

## 🧱 Tech Stack

### Blockchain Layer
- **Smart Contracts**: Solidity 0.8.x
- **Development Framework**: Hardhat
- **Local Blockchain**: Hardhat Node (EVM-compatible)
- **Token Standard**: ERC-20 (OpenZeppelin)
- **Web3 Library**: ethers.js v6
- **Auto-Deployment**: Contracts deploy automatically on blockchain startup

### Backend Layer
- **Runtime**: Node.js 20+ (optimized for native modules)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Blockchain Integration**: ethers.js for contract interaction
- **Price Fetching**: Yahoo Finance API integration

### Frontend Layer
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (ultra-fast development)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **HTTP Client**: Axios with auto-detection for backend URL
- **Routing**: React Router v6
- **State Management**: React Hooks

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Container Registry**: Docker Hub
- **Platform**: Railway.app (microservices architecture)
- **CI/CD**: GitHub Actions (automatic on push)
- **Database**: PostgreSQL (Railway managed)
- **Monitoring**: Railway built-in health checks
- **SSL/TLS**: Automatic HTTPS for all endpoints

## 📂 Project Structure

```
Equichain/
├── contracts/                    # Blockchain layer
│   ├── contracts/
│   │   ├── FractionalEquityToken.sol
│   │   └── EquiChainMarket.sol
│   ├── test/
│   │   └── EquiChain.test.ts
│   ├── scripts/
│   │   └── deploy.ts
│   ├── deployments/
│   │   └── local.json
│   ├── hardhat.config.ts
│   ├── package.json
│   └── Dockerfile
│
├── backend/                      # Application layer
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── db.ts
│   │   │   └── blockchain.ts
│   │   ├── entities/
│   │   │   ├── User.ts
│   │   │   ├── Position.ts
│   │   │   └── Transaction.ts
│   │   └── routes/
│   │       ├── auth.ts
│   │       ├── market.ts
│   │       └── portfolio.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── frontend/                     # Presentation layer
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Portfolio.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Deployment on Railway

The application is deployed on **Railway.app** with a complete microservices architecture:

### Production Services

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | https://equichain-frontend-production.up.railway.app | ✅ Running |
| **Backend API** | https://equichain-backend-production.up.railway.app | ✅ Running |
| **Blockchain RPC** | Internal: `equichain-blockchain.railway.internal:8545` | ✅ Running |
| **Database** | PostgreSQL (Managed) | ✅ Running |

### Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                 Railway.app Platform                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Frontend Service (Nginx + React)               │   │
│  │  Port: 80 → Public HTTPS Domain                 │   │
│  │  Auto-detects backend URL                       │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │ HTTPS                               │
│  ┌────────────────▼────────────────────────────────┐   │
│  │  Backend Service (Node.js + Express)            │   │
│  │  Port: 8000 → Public HTTPS Domain               │   │
│  │  Connects to DB + Blockchain                    │   │
│  └────────┬──────────────────────┬─────────────────┘   │
│           │ Railway Internal     │                     │
│  ┌────────▼──────────────────┐   │                     │
│  │ Blockchain Service        │   │                     │
│  │ (Hardhat Node)            │   │                     │
│  │ Port: 8545                │   │                     │
│  │ Auto-deploys contracts    │   │                     │
│  └───────────────────────────┘   │                     │
│                                   │                     │
│        ┌──────────────────────────▼──────────────────┐  │
│        │  PostgreSQL (Managed Database)             │  │
│        │  Automatic backups & scaling               │  │
│        └──────────────────────────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Key Features of Railway Deployment

✅ **Auto-Deployment**: GitHub integration - push to main branch to deploy  
✅ **Contract Deployment**: Blockchain service auto-deploys contracts at startup  
✅ **Zero Configuration**: Backend automatically detects blockchain RPC URL  
✅ **URL Auto-Detection**: Frontend auto-detects backend URL based on hostname  
✅ **Health Checks**: All services have health endpoints for Railway monitoring  
✅ **Environment Variables**: Automatic references to services (e.g., `${{Postgres.DATABASE_URL}}`)  
✅ **SSL/TLS**: All public endpoints have automatic HTTPS  
✅ **Resource Management**: Optimized for Railway free tier ($5/month credit)

### For Local Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Blockchain: http://localhost:8545
# PostgreSQL: localhost:5432
```

### Quick Deployment Steps

1. **Fork this repository to your GitHub account**
2. **Create a Railway project**: https://railway.app
3. **Connect your GitHub repository**
4. **Add PostgreSQL database** from Railway templates
5. **Set environment variables** (see RAILWAY_SETUP.md for details)
6. **Deploy!** - Railway will automatically build and deploy all services

See `RAILWAY_SETUP.md` for detailed step-by-step deployment guide.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Equichain.git
   cd Equichain
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Blockchain RPC: http://localhost:8545
   - PostgreSQL: localhost:5432

### Option 2: Local Development

#### Step 1: Smart Contracts

```bash
cd contracts
npm install
npx hardhat test              # Run tests
npx hardhat node              # Start local blockchain (keep running)
```

In a new terminal:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network localhost
```

#### Step 2: Backend

```bash
cd backend
npm install
npm run dev                   # Starts on port 8000
```

#### Step 3: Frontend

```bash
cd frontend
npm install
npm run dev                   # Starts on port 5173
```

## 🔑 Smart Contracts

### FractionalEquityToken.sol
ERC-20 token representing fractional ownership:
- **Name**: MRF Fractional Token
- **Symbol**: MRFf
- **Decimals**: 18
- **Mint/Burn**: Controlled by EquiChainMarket contract

### EquiChainMarket.sol
Market logic for buying/selling fractions:
- **Price**: Simulated MRF price (₹1,00,000 = 10,000,000 paise)
- **buyFractions(amountInPaise)**: Mint tokens based on INR invested
- **sellFractions(tokenAmount)**: Burn tokens and return INR equivalent

## 🔌 API Endpoints

### Base URLs
- **Production**: `https://equichain-backend-production.up.railway.app`
- **Local Development**: `http://localhost:8000`

### Authentication Endpoints
- `POST /auth/register` - Register new user (starts with ₹1,000 balance)
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```
  Response:
  ```json
  {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "balanceInRupees": 1000
    }
  }
  ```

- `POST /auth/login` - Login and get JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```

### Market Endpoints
- `GET /market/price` - Get current MRF price in paise
  ```json
  {
    "priceInPaise": 10000000,
    "priceInRupees": 100000
  }
  ```

- `GET /market/stocks` - Get live stock data from Yahoo Finance
  ```json
  [
    {
      "symbol": "MRF.NS",
      "name": "MRF Limited",
      "price": 1570242.7,
      "change": -375.73,
      "changePercent": -0.24
    }
  ]
  ```

- `POST /market/buy` - Buy fractional tokens (requires JWT)
  ```json
  {
    "amountInRupees": 100
  }
  ```

- `POST /market/sell` - Sell fractional tokens (requires JWT)
  ```json
  {
    "tokenAmount": "0.001"
  }
  ```

### Portfolio Endpoints (Requires JWT)
- `GET /portfolio` - Get user's positions and complete transaction history
- `GET /portfolio/balance` - Get current balance in rupees

### Health Endpoints
- `GET /` - API health check and endpoint list
- `GET /health` - Simple health status check

## 📊 Database Schema

### Users Table
```sql
id          SERIAL PRIMARY KEY
email       VARCHAR UNIQUE
passwordHash VARCHAR
balanceInPaise BIGINT DEFAULT 100000  -- ₹1000 starting balance
createdAt   TIMESTAMP
```

### Positions Table
```sql
id          SERIAL PRIMARY KEY
userId      INTEGER (FK)
tokenSymbol VARCHAR (MRFf)
quantity    VARCHAR (BigInt as string)
avgPricePaise BIGINT
```

### Transactions Table
```sql
id          SERIAL PRIMARY KEY
userId      INTEGER (FK)
type        ENUM (BUY, SELL)
tokenSymbol VARCHAR
quantity    VARCHAR
pricePaise  BIGINT
createdAt   TIMESTAMP
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npx hardhat test
npx hardhat coverage  # Coverage report
```

### Backend Tests (Optional)
```bash
cd backend
npm test
```

## 🐳 Docker Images

All images are published on Docker Hub:

- `YOUR_DOCKERHUB/equichain-blockchain:latest`
- `YOUR_DOCKERHUB/equichain-backend:latest`
- `YOUR_DOCKERHUB/equichain-frontend:latest`

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgres://equi:equi@localhost:5432/equichain
RPC_URL=http://localhost:8545
JWT_SECRET=your_jwt_secret_here
PORT=8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🎓 What This Project Demonstrates

✅ **Full-Stack Blockchain DApp**: Complete end-to-end blockchain application  
✅ **Smart Contract Development**: ERC-20 tokens and market logic in Solidity  
✅ **Blockchain Integration**: Web3 interaction with ethers.js  
✅ **Three-Tier Architecture**: Proper separation of concerns (UI, API, Blockchain)  
✅ **Microservices Deployment**: Docker + Railway orchestration  
✅ **TypeScript Full-Stack**: From contracts to backend to frontend  
✅ **Security**: JWT authentication, password hashing, input validation  
✅ **Real-World Data**: Yahoo Finance API integration for live stock prices  
✅ **DevOps**: Automated deployment, health checks, environment management  
✅ **Scalability**: Dockerized services that scale independently

## 🐛 Troubleshooting

### Frontend Issues

**Problem**: "An error occurred" when trying to login
- **Solution**: Check browser console (F12) for detailed error messages
- **Check**: API URL should be auto-detected correctly
- **Verify**: Backend health at `/health` endpoint returns 200

**Problem**: Dashboard is empty (no stocks showing)
- **Solution**: Check network tab for failed requests
- **Verify**: Backend is connected to blockchain
- **Check**: Yahoo Finance API is accessible (it might be rate-limited)

**Problem**: Cannot perform buy/sell operations
- **Check**: Blockchain service is running
- **Verify**: Smart contracts are deployed
- **Ensure**: Backend logs show "✅ Blockchain initialized successfully"

### Backend Issues

**Problem**: "Blockchain initialization failed"
- **Check**: Blockchain service is running at the configured RPC URL
- **Verify**: Contracts are deployed (check blockchain logs)
- **Solution**: Backend will retry for up to 3 minutes

**Problem**: Database connection error
- **Check**: PostgreSQL service is running
- **Verify**: DATABASE_URL environment variable is set correctly
- **Ensure**: Database credentials are correct

### Blockchain Issues

**Problem**: Smart contracts not deploying
- **Check**: Blockchain node has started successfully
- **Verify**: Logs show "Started HTTP and WebSocket JSON-RPC server"
- **Solution**: Deployment retries automatically

**Problem**: Gas estimation fails
- **Check**: Balance of custodian wallet is sufficient (should be 10000 ETH)
- **Verify**: Contract addresses are correct in environment variables

## 📖 How to Use

### 1. Register/Login
- Visit: https://equichain-frontend-production.up.railway.app/
- Register with email and password
- New users start with ₹1,000 balance

### 2. View Stocks
- Dashboard shows real-time NIFTY 50 stock prices
- MRF price is fetched from blockchain

### 3. Trade
- **Buy**: Select amount (₹1 minimum) and click "BUY MRF"
- **Sell**: Click "SELL" to convert fractional tokens back to rupees
- **View**: Each trade creates a blockchain transaction

### 4. Monitor
- **Portfolio**: See all holdings and P&L
- **Transactions**: View complete trade history with blockchain hashes
- **Blockchain**: Check live activity in "Tech Stack" → "Live Activity"

## 🔐 Security Considerations

⚠️ **For Educational Use Only**: This is not production-grade security

**Security Features Implemented:**
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ CORS enabled for cross-origin requests
- ✅ Input validation on all endpoints
- ✅ Automatic HTTPS on Railway

**For Production, Add:**
- [ ] Rate limiting on API endpoints
- [ ] Two-factor authentication (2FA)
- [ ] API key management
- [ ] Audit logging
- [ ] Smart contract audits
- [ ] MetaMask/Wallet Connect integration
- [ ] Testnet before mainnet deployment

## 🔮 Future Enhancements

- [ ] Multi-stock support with any ticker symbol
- [ ] MetaMask wallet integration
- [ ] Real-time WebSocket price updates
- [ ] Portfolio analytics and diversification recommendations
- [ ] Testnet deployment (Polygon Mumbai)
- [ ] Advanced order types (limit, stop-loss)
- [ ] Dividend distribution simulation
- [ ] Fuzz testing with Foundry
- [ ] Mobile app (React Native)
- [ ] NFT certificates for positions

## 📚 Resources & Documentation

### Project Documentation
- **[RAILWAY_SETUP.md](./RAILWAY_SETUP.md)** - Complete Railway deployment guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Local deployment instructions

### External Resources
- **[Hardhat Documentation](https://hardhat.org/docs)**
- **[OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)**
- **[ethers.js Documentation](https://docs.ethers.org/v6/)**
- **[Railway Documentation](https://docs.railway.app/)**
- **[Solidity Documentation](https://docs.soliditylang.org/)**

### Useful Tools
- **[Remix IDE](https://remix.ethereum.org/)** - Online Solidity editor
- **[Etherscan](https://etherscan.io/)** - Ethereum blockchain explorer (for reference)
- **[MetaMask](https://metamask.io/)** - Crypto wallet (for future MetaMask integration)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Built as a comprehensive blockchain DApp demonstration project for academic and learning purposes.

---

## 📞 Support

For issues, questions, or improvements:
1. **GitHub Issues**: Create an issue on the repository
2. **Documentation**: Check `RAILWAY_SETUP.md` and `DEPLOYMENT.md`
3. **Logs**: Check service logs in Railway dashboard for debugging

---

**⚠️ Important Note**: This is a simulation for educational purposes. Not for production use with real money.

**🚀 Ready to deploy?** Check out [RAILWAY_SETUP.md](./RAILWAY_SETUP.md) for step-by-step instructions!

````
