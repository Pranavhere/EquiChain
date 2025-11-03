import hre from "hardhat";

async function main() {
  const { ethers } = hre;

  console.log("🚀 Deploying EquiChainFractionToken...");

  const TokenFactory = await ethers.getContractFactory("EquiChainFractionToken");
  const token = await TokenFactory.deploy("Reliance Fractional Token", "RELI-FRAC");
  await token.deployed();
  console.log("✅ Token deployed at:", token.address);

  console.log("🏦 Deploying EquiChainMarket...");
  const MarketFactory = await ethers.getContractFactory("EquiChainMarket");
  const market = await MarketFactory.deploy(token.address);
  await market.deployed();
  console.log("✅ Market deployed at:", market.address);

  console.log("🔁 Transferring token ownership to Market...");
  const tx = await token.transferOwnership(market.address);
  await tx.wait();
  console.log("✅ Market now owns Token mint/burn rights");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
