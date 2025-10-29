# EquiChain Developer Guide

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.8+
- MetaMask wallet
- Mumbai Testnet configuration

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Pranavhere/EquiChain.git
cd EquiChain
```

2. **Smart Contract Development**
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

3. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

4. **Frontend Development**
```bash
cd frontend
npm install
npm run dev
```

## 🏗️ Project Structure

```
EquiChain/
├── contracts/           # Solidity smart contracts
│   ├── FractionalToken.sol
│   ├── Custodian.sol
│   └── KYCVerifier.sol
├── backend/            # FastAPI/Node.js server
│   ├── api/
│   ├── services/
│   └── models/
└── frontend/           # React application
    ├── src/
    ├── public/
    └── components/
```

## 🔧 Configuration

1. **Smart Contract Configuration**
   - Update `hardhat.config.js` with your network settings
   - Set environment variables in `.env`

2. **Backend Configuration**
   - Configure database in `config.py`
   - Set API keys for Yahoo Finance/Alpha Vantage

3. **Frontend Configuration**
   - Update Web3 provider settings
   - Configure API endpoints

## 📚 API Documentation

### Smart Contract APIs

- `mintFractionalTokens(address, amount)`
- `transferTokens(address, amount)`
- `burnTokens(amount)`
- `getHoldings(address)`

### Backend APIs

- `/api/v1/kyc/verify`
- `/api/v1/market/price`
- `/api/v1/holdings/balance`
- `/api/v1/transactions/history`

## 🧪 Testing

### Smart Contract Tests
```bash
npx hardhat test test/FractionalToken.test.js
```

### Backend Tests
```bash
pytest tests/
```

### Frontend Tests
```bash
npm test
```

## 📦 Deployment

1. **Smart Contracts**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

2. **Backend**
```bash
# Follow deployment guide for your chosen platform (Vercel/Render)
```

3. **Frontend**
```bash
npm run build
# Deploy build folder to hosting service
```

## 🔐 Security Considerations

1. **Smart Contract Security**
   - Regular audits
   - Access control implementation
   - Emergency pause functionality

2. **Backend Security**
   - API rate limiting
   - Input validation
   - Secure key management

3. **Frontend Security**
   - Web3 best practices
   - Secure connection handling
   - User data protection

## 🤝 Contributing

See our [Contributing Guide](.github/CONTRIBUTING.md) for details on:
- Code style
- Commit message format
- Pull request process
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.