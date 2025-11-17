import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  
  database: {
    url: process.env.DATABASE_URL || 'postgres://equi:equi@localhost:5432/equichain',
  },
  
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    custodianPrivateKey: process.env.CUSTODIAN_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  },
};
