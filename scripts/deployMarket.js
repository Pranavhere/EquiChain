import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // <--- your token

  const Market = await ethers.getContractFactory("EquiChainMarket");
  const market = await Market.deploy(tokenAddress, ethers.utils.parseEther("100")); // asset valued at 100 ETH

  await market.deployed();
  console.log("✅ Market deployed at:", market.address);
}

main().catch(console.error);
