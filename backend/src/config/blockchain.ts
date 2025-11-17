import { ethers } from 'ethers';
import { config } from './env';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

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
    let tokenAddress: string | undefined;
    let marketAddress: string | undefined;
    
    // Try environment variables first (for production/Railway)
    if (process.env.TOKEN_CONTRACT_ADDRESS && process.env.MARKET_CONTRACT_ADDRESS) {
      tokenAddress = process.env.TOKEN_CONTRACT_ADDRESS;
      marketAddress = process.env.MARKET_CONTRACT_ADDRESS;
      console.log('📝 Using contract addresses from environment variables');
    } else if (process.env.NODE_ENV === 'development' || !process.env.TOKEN_CONTRACT_ADDRESS) {
      // Fall back to deployment file (for local development)
      const deploymentsPath = path.join(__dirname, '../../../contracts/deployments/local.json');
      
      if (fs.existsSync(deploymentsPath)) {
        try {
          const deploymentData = JSON.parse(fs.readFileSync(deploymentsPath, 'utf-8'));
          tokenAddress = deploymentData.contracts.FractionalEquityToken.address;
          marketAddress = deploymentData.contracts.EquiChainMarket.address;
          console.log('📝 Using contract addresses from deployment file');
        } catch (e) {
          console.log('⚠️  Could not read deployment file, will attempt deployment');
        }
      } else {
        console.log('⚠️  Deployment file not found, will attempt deployment');
      }
    }
    
    if (!tokenAddress || !marketAddress) {
      throw new Error('Contract addresses not available. Please ensure deployment completed or set TOKEN_CONTRACT_ADDRESS and MARKET_CONTRACT_ADDRESS environment variables.');
    }
    
    tokenContract = new ethers.Contract(tokenAddress, FractionalEquityTokenABI, custodianWallet);
    marketContract = new ethers.Contract(marketAddress, EquiChainMarketABI, custodianWallet);
    
    console.log(`📜 Token Contract: ${tokenAddress}`);
    console.log(`📜 Market Contract: ${marketAddress}`);
    
    // Verify contracts exist by checking code at address
    const tokenCode = await provider.getCode(tokenAddress);
    const marketCode = await provider.getCode(marketAddress);
    
    if (tokenCode === '0x' || marketCode === '0x') {
      console.log('⚠️  Contracts not found at addresses, attempting deployment...');
      await deployContracts();
      // Re-check after deployment
      const tokenCodeAfter = await provider.getCode(tokenAddress);
      const marketCodeAfter = await provider.getCode(marketAddress);
      if (tokenCodeAfter === '0x' || marketCodeAfter === '0x') {
        throw new Error('Contracts still not available after deployment attempt');
      }
    }
    
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
    throw new Error('Blockchain not initialized yet. Please wait a moment and try again.');
  }
  return { provider, custodianWallet, tokenContract, marketContract };
}

async function deployContracts() {
  try {
    console.log('📝 Blockchain service should have deployed contracts at startup');
    console.log('⏳ Backend is checking for deployed contracts...');
    // Backend doesn't deploy - blockchain service handles it
    return false;
  } catch (error) {
    console.warn('⚠️  Could not verify deployed contracts');
    return false;
  }
}

export { provider, custodianWallet, tokenContract, marketContract };
