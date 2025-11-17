import { ethers } from 'ethers';
import { config } from './env';
import * as fs from 'fs';
import * as path from 'path';

// ABI imports
const FractionalEquityTokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount)"
];

const EquiChainMarketABI = [
  "function pricePerWholeShareInPaise() view returns (uint256)",
  "function buyFractions(address buyer, uint256 amountInPaise) returns (uint256)",
  "function sellFractions(address seller, uint256 tokenAmount) returns (uint256)",
  "function calculateTokensForAmount(uint256 amountInPaise) view returns (uint256)",
  "function calculateAmountForTokens(uint256 tokenAmount) view returns (uint256)",
  "function getCurrentPrice() view returns (uint256)",
  "event FractionsPurchased(address indexed buyer, uint256 amountInPaise, uint256 tokensReceived, uint256 timestamp)",
  "event FractionsSold(address indexed seller, uint256 tokensSold, uint256 amountInPaise, uint256 timestamp)"
];

let provider: ethers.JsonRpcProvider;
let custodianWallet: ethers.Wallet;
let tokenContract: ethers.Contract;
let marketContract: ethers.Contract;

export async function initializeBlockchain() {
  try {
    console.log('🔗 Connecting to blockchain...');
    
    // Connect to Hardhat node
    provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    
    // Test connection
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (chainId: ${network.chainId})`);
    
    // Setup custodian wallet (backend controls trades)
    custodianWallet = new ethers.Wallet(config.blockchain.custodianPrivateKey, provider);
    const balance = await provider.getBalance(custodianWallet.address);
    console.log(`💰 Custodian wallet: ${custodianWallet.address}`);
    console.log(`💰 Custodian balance: ${ethers.formatEther(balance)} ETH`);
    
    // Load deployment addresses from environment or file
    let tokenAddress: string;
    let marketAddress: string;
    
    // Try environment variables first (for production/Railway)
    if (process.env.TOKEN_CONTRACT_ADDRESS && process.env.MARKET_CONTRACT_ADDRESS) {
      tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
      marketAddress = process.env.MARKET_CONTRACT_ADDRESS;
      console.log('📝 Using contract addresses from environment variables');
    } else {
      // Fall back to deployment file (for local development)
      const deploymentsPath = path.join(__dirname, '../../../contracts/deployments/local.json');
      
      if (!fs.existsSync(deploymentsPath)) {
        throw new Error('Deployment file not found and no contract addresses in environment. Please deploy contracts first.');
      }
      
      const deploymentData = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
      tokenAddress = deploymentData.contracts.FractionalEquityToken.address;
      marketAddress = deploymentData.contracts.EquiChainMarket.address;
      console.log('📝 Using contract addresses from deployment file');
    }
    
    tokenContract = new ethers.Contract(tokenAddress, FractionalEquityTokenABI, custodianWallet);
    marketContract = new ethers.Contract(marketAddress, EquiChainMarketABI, custodianWallet);
    
    console.log(`📜 Token Contract: ${tokenAddress}`);
    console.log(`📜 Market Contract: ${marketAddress}`);
    
    // Verify contracts
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();
    const currentPrice = await marketContract.getCurrentPrice();
    
    console.log(`✅ Token: ${tokenName} (${tokenSymbol})`);
    console.log(`✅ MRF Price: ₹${Number(currentPrice) / 100} (${currentPrice} paise)`);
    
    return { provider, custodianWallet, tokenContract, marketContract };
  } catch (error) {
    console.error('❌ Blockchain initialization failed:', error);
    throw error;
  }
}

export function getBlockchainInstances() {
  if (!provider || !custodianWallet || !tokenContract || !marketContract) {
    throw new Error('Blockchain not initialized. Call initializeBlockchain() first.');
  }
  return { provider, custodianWallet, tokenContract, marketContract };
}

export { provider, custodianWallet, tokenContract, marketContract };
