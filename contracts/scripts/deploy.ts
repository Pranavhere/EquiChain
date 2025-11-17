import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting EquiChain deployment...\n");
  
  // MRF share price: ₹1,00,000 = 10,000,000 paise
  const MRF_PRICE_IN_PAISE = 10_000_000;
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");
  
  // Deploy FractionalEquityToken
  console.log("📜 Deploying FractionalEquityToken...");
  const FractionalEquityTokenFactory = await ethers.getContractFactory("FractionalEquityToken");
  const fractionToken = await FractionalEquityTokenFactory.deploy();
  await fractionToken.waitForDeployment();
  const tokenAddress = await fractionToken.getAddress();
  console.log("✅ FractionalEquityToken deployed to:", tokenAddress);
  
  // Deploy EquiChainMarket
  console.log("\n📜 Deploying EquiChainMarket...");
  const EquiChainMarketFactory = await ethers.getContractFactory("EquiChainMarket");
  const market = await EquiChainMarketFactory.deploy(
    tokenAddress,
    MRF_PRICE_IN_PAISE
  );
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("✅ EquiChainMarket deployed to:", marketAddress);
  
  // Set market contract in token
  console.log("\n🔗 Connecting contracts...");
  const tx = await fractionToken.setMarketContract(marketAddress);
  await tx.wait();
  console.log("✅ Market contract set in FractionalEquityToken");
  
  // Prepare deployment data
  const deploymentData = {
    network: "localhost",
    chainId: 31337,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      FractionalEquityToken: {
        address: tokenAddress,
        name: "MRF Fractional Token",
        symbol: "MRFf",
        decimals: 18
      },
      EquiChainMarket: {
        address: marketAddress,
        pricePerWholeShareInPaise: MRF_PRICE_IN_PAISE,
        pricePerWholeShareInRupees: MRF_PRICE_IN_PAISE / 100
      }
    }
  };
  
  // Save deployment addresses
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentPath = path.join(deploymentsDir, "local.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentData, null, 2));
  
  console.log("\n💾 Deployment data saved to:", deploymentPath);
  
  // Display summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:                 localhost (Hardhat)");
  console.log("Chain ID:                31337");
  console.log("Deployer:                " + deployer.address);
  console.log("");
  console.log("FractionalEquityToken:   " + tokenAddress);
  console.log("EquiChainMarket:         " + marketAddress);
  console.log("");
  console.log("MRF Share Price:         ₹" + (MRF_PRICE_IN_PAISE / 100).toLocaleString());
  console.log("Minimum Investment:      ₹1");
  console.log("=".repeat(60));
  
  console.log("\n✨ Deployment completed successfully!\n");
  
  // Quick verification
  console.log("🔍 Verifying deployment...");
  const storedMarket = await fractionToken.marketContract();
  const storedPrice = await market.pricePerWholeShareInPaise();
  
  if (storedMarket === marketAddress && storedPrice === BigInt(MRF_PRICE_IN_PAISE)) {
    console.log("✅ All contracts verified and connected correctly!\n");
  } else {
    console.log("⚠️  Warning: Contract verification failed!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
