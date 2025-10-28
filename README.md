
# 🧩 EquiChain

## Abstract

EquiChain is a blockchain-based prototype that demonstrates how fractional ownership of Indian equities can be implemented using tokenization and smart contracts. The project bridges traditional finance and blockchain by simulating a system where each demat share held by a custodian is represented as multiple fractional tokens on a blockchain network. These tokens allow users to buy, sell, and transfer fractional units while ensuring transparency, security, and proof of backing.

The platform is built with three integrated layers:

- Smart Contract Layer (Solidity on Polygon Mumbai Testnet): Implements ERC-20–based fractional tokens with mint, burn, and transfer functions, restricted to KYC-verified wallets. Tokens are fully backed 1:1 by simulated custodian holdings.
- Backend / Middleware (FastAPI or Node.js): Handles user authentication, KYC verification, custodian simulation, broker integration APIs, and oracle feeds for live market data. It also manages periodic proof-of-reserve attestations to ensure on-chain and off-chain parity.
- Frontend Dashboard (React + Tailwind): A clean interface where users can view available stocks, current market prices (via Yahoo Finance or Alpha Vantage API), fractional holdings, and simulated dividends.

The Custodian Simulation Module acts as an admin wallet holding demat shares in a mock SPV account, issuing fractional tokens upon user purchases and burning them upon sales. The system also includes mock dividend and corporate action distribution, price feed oracles, and a reconciliation dashboard to verify that total token supply equals custodian share holdings.

For simplicity, all financial transactions occur on the Polygon Mumbai Testnet using test tokens and dummy KYC data. Users connect via MetaMask, and all actions — minting, transferring, redeeming, and dividend credit — are visible on-chain.

## Tech Stack

- Blockchain: Solidity, Polygon (Mumbai Testnet), Remix IDE / Hardhat
- Backend: FastAPI (Python) or Node.js (Express), SQLite/PostgreSQL
- Frontend: React.js, Tailwind CSS, MetaMask Integration
- Data APIs: Yahoo Finance, Alpha Vantage (free tier)
- Hosting & Tools: GitHub, Vercel/Render (free tier), Draw.io for diagrams

## Key Features

- Tokenized fractional ownership of equities (1 share = 1000 fractions)
- KYC-gated permissioned transfers between verified users
- Real-time market data and mock corporate actions
- Proof-of-reserve and reconciliation validation
- Transparent, on-chain record of ownership and transactions
- Modular API layer for broker or fintech integration

## Objective

To showcase how blockchain can be used to democratize stock ownership in India by enabling fractional investing in a legally compliant, transparent, and technology-driven manner — providing a foundation for future broker integrations or regulatory sandbox pilots.

