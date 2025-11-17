# 🏦 EquiChain - Fractional Equity Trading Platform

## 📖 Overview

**EquiChain** is a blockchain-based decentralized application (DApp) that enables fractional ownership of high-value equities. Users can invest in expensive stocks like MRF (₹1,00,000+) starting from just ₹1 using blockchain-based fractional tokens.

### 🎯 Key Features

- **Fractional Equity Ownership**: Buy fractions of expensive stocks starting from ₹1
- **Blockchain-Powered**: ERC-20 tokens represent fractional ownership on Ethereum-compatible chain
- **Three-Tier Architecture**: Clean separation of Web UI, API Layer, and Blockchain + Database
- **Fully Dockerized**: Complete containerization for easy deployment
- **Secure Authentication**: JWT-based user authentication
- **Real-time Portfolio**: Track your fractional holdings and transaction history

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
- **Local Blockchain**: Hardhat Node
- **Token Standard**: ERC-20 (OpenZeppelin)
- **Web3 Library**: ethers.js v6

### Backend Layer
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL 16
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

### Frontend Layer
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router

### DevOps
- **Containerization**: Docker & Docker Compose
- **Testing**: Hardhat (Chai), Jest
- **Static Analysis**: Slither (optional)

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

### Authentication
- `POST /auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```

- `POST /auth/login` - Login and get JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "secure_password"
  }
  ```

### Market
- `GET /market/price` - Get current MRF price in paise
- `POST /market/buy` - Buy fractional tokens
  ```json
  {
    "amountInRupees": 100
  }
  ```
- `POST /market/sell` - Sell fractional tokens
  ```json
  {
    "tokenAmount": "0.001"
  }
  ```

### Portfolio
- `GET /portfolio` - Get user's positions and transaction history

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

✅ **Blockchain Integration**: Smart contracts for fractional asset ownership
✅ **Three-Tier Architecture**: Proper separation of concerns
✅ **Full-Stack Development**: React, Node.js, PostgreSQL, Solidity
✅ **DevOps**: Complete dockerization and orchestration
✅ **Security**: JWT authentication, password hashing, input validation
✅ **Testing**: Comprehensive smart contract tests
✅ **Real-World Use Case**: Democratizing access to high-value assets

## 🔮 Future Enhancements

- [ ] Multi-stock support (TCS, INFY, etc.)
- [ ] MetaMask wallet integration
- [ ] Real-time price updates
- [ ] Portfolio diversification analytics
- [ ] Testnet deployment (Polygon Mumbai)
- [ ] Two-factor authentication
- [ ] Dividend distribution simulation
- [ ] Fuzz testing with Foundry

## 📄 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Built as a comprehensive blockchain DApp demonstration project.

---

**Note**: This is a simulation for educational purposes. Not for production use with real money.
