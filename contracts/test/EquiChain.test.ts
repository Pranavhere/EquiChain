import { expect } from "chai";
import { ethers } from "hardhat";
import { FractionalEquityToken, EquiChainMarket } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EquiChain - Fractional Equity Platform", function () {
  let fractionToken: FractionalEquityToken;
  let market: EquiChainMarket;
  let owner: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;
  
  // Constants
  const MRF_PRICE_IN_PAISE = 10_000_000; // ₹1,00,000 = 10,000,000 paise
  const ONE_RUPEE_IN_PAISE = 100;
  const TEN_RUPEES_IN_PAISE = 1000;
  const HUNDRED_RUPEES_IN_PAISE = 10_000;
  
  beforeEach(async function () {
    // Get signers
    [owner, buyer1, buyer2] = await ethers.getSigners();
    
    // Deploy FractionalEquityToken
    const FractionalEquityTokenFactory = await ethers.getContractFactory("FractionalEquityToken");
    fractionToken = await FractionalEquityTokenFactory.deploy();
    await fractionToken.waitForDeployment();
    
    // Deploy EquiChainMarket
    const EquiChainMarketFactory = await ethers.getContractFactory("EquiChainMarket");
    market = await EquiChainMarketFactory.deploy(
      await fractionToken.getAddress(),
      MRF_PRICE_IN_PAISE
    );
    await market.waitForDeployment();
    
    // Set market contract in token
    await fractionToken.setMarketContract(await market.getAddress());
  });
  
  describe("Deployment", function () {
    it("Should deploy FractionalEquityToken with correct name and symbol", async function () {
      expect(await fractionToken.name()).to.equal("MRF Fractional Token");
      expect(await fractionToken.symbol()).to.equal("MRFf");
      expect(await fractionToken.decimals()).to.equal(18);
    });
    
    it("Should deploy EquiChainMarket with correct price", async function () {
      expect(await market.pricePerWholeShareInPaise()).to.equal(MRF_PRICE_IN_PAISE);
    });
    
    it("Should set market contract correctly in token", async function () {
      expect(await fractionToken.marketContract()).to.equal(await market.getAddress());
    });
    
    it("Should start with zero total supply", async function () {
      expect(await fractionToken.totalSupply()).to.equal(0);
    });
  });
  
  describe("Buying Fractions", function () {
    it("Should allow buying fractions with ₹1", async function () {
      const amountInPaise = ONE_RUPEE_IN_PAISE;
      
      const tx = await market.buyFractions(buyer1.address, amountInPaise);
      await tx.wait();
      
      const balance = await fractionToken.balanceOf(buyer1.address);
      expect(balance).to.be.gt(0);
      
      // Verify calculation: (100 paise * 1e18) / 10,000,000 paise = 1e13 tokens
      const expectedTokens = (BigInt(amountInPaise) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE);
      expect(balance).to.equal(expectedTokens);
    });
    
    it("Should allow buying fractions with ₹100", async function () {
      const amountInPaise = HUNDRED_RUPEES_IN_PAISE;
      
      await market.buyFractions(buyer1.address, amountInPaise);
      
      const balance = await fractionToken.balanceOf(buyer1.address);
      const expectedTokens = (BigInt(amountInPaise) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE);
      expect(balance).to.equal(expectedTokens);
    });
    
    it("Should emit FractionsPurchased event", async function () {
      const amountInPaise = HUNDRED_RUPEES_IN_PAISE;
      const expectedTokens = (BigInt(amountInPaise) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE);
      
      // Emit the transaction and check the event
      const tx = await market.buyFractions(buyer1.address, amountInPaise);
      const receipt = await tx.wait();
      
      // Find the FractionsPurchased event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = market.interface.parseLog(log);
          return parsed?.name === 'FractionsPurchased';
        } catch (e) {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
      const parsedEvent = market.interface.parseLog(event as any);
      expect(parsedEvent?.args[0]).to.equal(buyer1.address); // buyer
      expect(parsedEvent?.args[1]).to.equal(amountInPaise); // amountInPaise
      expect(parsedEvent?.args[2]).to.equal(expectedTokens); // tokensReceived
      // Skip timestamp check as it can vary
    });
    
    it("Should correctly calculate tokens for different amounts", async function () {
      // ₹1
      const tokens1 = await market.calculateTokensForAmount(ONE_RUPEE_IN_PAISE);
      expect(tokens1).to.equal((BigInt(ONE_RUPEE_IN_PAISE) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE));
      
      // ₹10
      const tokens10 = await market.calculateTokensForAmount(TEN_RUPEES_IN_PAISE);
      expect(tokens10).to.equal((BigInt(TEN_RUPEES_IN_PAISE) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE));
      
      // ₹100
      const tokens100 = await market.calculateTokensForAmount(HUNDRED_RUPEES_IN_PAISE);
      expect(tokens100).to.equal((BigInt(HUNDRED_RUPEES_IN_PAISE) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE));
    });
    
    it("Should revert when buying with 0 amount", async function () {
      await expect(market.buyFractions(buyer1.address, 0))
        .to.be.revertedWith("Amount must be greater than 0");
    });
    
    it("Should revert when buying to zero address", async function () {
      await expect(market.buyFractions(ethers.ZeroAddress, HUNDRED_RUPEES_IN_PAISE))
        .to.be.revertedWith("Invalid buyer address");
    });
    
    it("Should allow multiple buyers", async function () {
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      await market.buyFractions(buyer2.address, HUNDRED_RUPEES_IN_PAISE);
      
      const balance1 = await fractionToken.balanceOf(buyer1.address);
      const balance2 = await fractionToken.balanceOf(buyer2.address);
      
      expect(balance1).to.be.gt(0);
      expect(balance2).to.be.gt(0);
      expect(balance1).to.equal(balance2);
    });
    
    it("Should increase total supply when buying", async function () {
      const initialSupply = await fractionToken.totalSupply();
      
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      
      const newSupply = await fractionToken.totalSupply();
      expect(newSupply).to.be.gt(initialSupply);
    });
  });
  
  describe("Selling Fractions", function () {
    beforeEach(async function () {
      // Buyer1 purchases ₹100 worth of fractions first
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
    });
    
    it("Should allow selling fractions", async function () {
      const initialBalance = await fractionToken.balanceOf(buyer1.address);
      const tokensToSell = initialBalance / BigInt(2); // Sell half
      
      const tx = await market.sellFractions(buyer1.address, tokensToSell);
      await tx.wait();
      
      const newBalance = await fractionToken.balanceOf(buyer1.address);
      expect(newBalance).to.equal(initialBalance - tokensToSell);
    });
    
    it("Should emit FractionsSold event", async function () {
      const balance = await fractionToken.balanceOf(buyer1.address);
      const tokensToSell = balance / BigInt(2);
      
      const expectedAmount = (tokensToSell * BigInt(MRF_PRICE_IN_PAISE)) / BigInt(1e18);
      
      // Emit the transaction and check the event
      const tx = await market.sellFractions(buyer1.address, tokensToSell);
      const receipt = await tx.wait();
      
      // Find the FractionsSold event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = market.interface.parseLog(log);
          return parsed?.name === 'FractionsSold';
        } catch (e) {
          return false;
        }
      });
      
      expect(event).to.not.be.undefined;
      const parsedEvent = market.interface.parseLog(event as any);
      expect(parsedEvent?.args[0]).to.equal(buyer1.address); // seller
      expect(parsedEvent?.args[1]).to.equal(tokensToSell); // tokensSold
      expect(parsedEvent?.args[2]).to.equal(expectedAmount); // amountInPaise
      // Skip timestamp check as it can vary
    });
    
    it("Should calculate correct INR amount for tokens", async function () {
      const balance = await fractionToken.balanceOf(buyer1.address);
      const amountInPaise = await market.calculateAmountForTokens(balance);
      
      // Should get approximately ₹100 back (10,000 paise)
      expect(amountInPaise).to.be.closeTo(HUNDRED_RUPEES_IN_PAISE, 1);
    });
    
    it("Should revert when selling 0 tokens", async function () {
      await expect(market.sellFractions(buyer1.address, 0))
        .to.be.revertedWith("Token amount must be greater than 0");
    });
    
    it("Should revert when selling more tokens than balance", async function () {
      const balance = await fractionToken.balanceOf(buyer1.address);
      const tooMuch = balance + BigInt(1e18);
      
      await expect(market.sellFractions(buyer1.address, tooMuch))
        .to.be.revertedWith("Insufficient token balance");
    });
    
    it("Should revert when selling from zero address", async function () {
      await expect(market.sellFractions(ethers.ZeroAddress, 1000))
        .to.be.revertedWith("Invalid seller address");
    });
    
    it("Should decrease total supply when selling", async function () {
      const initialSupply = await fractionToken.totalSupply();
      const balance = await fractionToken.balanceOf(buyer1.address);
      
      await market.sellFractions(buyer1.address, balance);
      
      const newSupply = await fractionToken.totalSupply();
      expect(newSupply).to.be.lt(initialSupply);
      expect(newSupply).to.equal(0); // All sold
    });
  });
  
  describe("Price Updates", function () {
    it("Should allow updating price", async function () {
      const newPrice = 12_000_000; // ₹1,20,000
      
      await market.updatePrice(newPrice);
      
      expect(await market.pricePerWholeShareInPaise()).to.equal(newPrice);
    });
    
    it("Should emit PriceUpdated event", async function () {
      const newPrice = 12_000_000;
      
      await expect(market.updatePrice(newPrice))
        .to.emit(market, "PriceUpdated")
        .withArgs(MRF_PRICE_IN_PAISE, newPrice);
    });
    
    it("Should affect token calculations after price update", async function () {
      const newPrice = 12_000_000; // 20% increase
      await market.updatePrice(newPrice);
      
      const tokensFor100 = await market.calculateTokensForAmount(HUNDRED_RUPEES_IN_PAISE);
      const originalTokens = (BigInt(HUNDRED_RUPEES_IN_PAISE) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE);
      const newTokens = (BigInt(HUNDRED_RUPEES_IN_PAISE) * BigInt(1e18)) / BigInt(newPrice);
      
      expect(tokensFor100).to.equal(newTokens);
      expect(tokensFor100).to.be.lt(originalTokens); // Higher price = fewer tokens
    });
    
    it("Should revert when setting price to 0", async function () {
      await expect(market.updatePrice(0))
        .to.be.revertedWith("Price must be greater than 0");
    });
  });
  
  describe("Token Access Control", function () {
    it("Should only allow market contract to mint", async function () {
      // Direct mint should fail for non-market addresses
      await expect(fractionToken.connect(buyer1).mint(buyer1.address, 1000))
        .to.be.revertedWith("Only market contract or owner can mint");
    });
    
    it("Should only allow market contract to burn", async function () {
      // First buy some tokens
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      
      // Direct burn should fail for non-market addresses
      await expect(fractionToken.connect(buyer1).burn(buyer1.address, 100))
        .to.be.revertedWith("Only market contract or owner can burn");
    });
    
    it("Should allow owner to update market contract", async function () {
      const newMarket = buyer2.address;
      
      await fractionToken.setMarketContract(newMarket);
      
      expect(await fractionToken.marketContract()).to.equal(newMarket);
    });
    
    it("Should revert when setting market to zero address", async function () {
      await expect(fractionToken.setMarketContract(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid market contract address");
    });
  });
  
  describe("Edge Cases and Complex Scenarios", function () {
    it("Should handle very small investments (₹1)", async function () {
      await market.buyFractions(buyer1.address, ONE_RUPEE_IN_PAISE);
      
      const balance = await fractionToken.balanceOf(buyer1.address);
      expect(balance).to.be.gt(0);
    });
    
    it("Should handle large investments", async function () {
      const largeAmount = 100_000_00; // ₹10,000 = 1,000,000 paise
      
      await market.buyFractions(buyer1.address, largeAmount);
      
      const balance = await fractionToken.balanceOf(buyer1.address);
      expect(balance).to.be.gt(0);
      
      // Should be able to own 10% of a share
      const expectedTokens = (BigInt(largeAmount) * BigInt(1e18)) / BigInt(MRF_PRICE_IN_PAISE);
      expect(balance).to.equal(expectedTokens);
    });
    
    it("Should handle multiple buy-sell cycles", async function () {
      // Buy
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      let balance1 = await fractionToken.balanceOf(buyer1.address);
      
      // Sell half
      await market.sellFractions(buyer1.address, balance1 / BigInt(2));
      let balance2 = await fractionToken.balanceOf(buyer1.address);
      
      // Buy again
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      let balance3 = await fractionToken.balanceOf(buyer1.address);
      
      expect(balance2).to.equal(balance1 / BigInt(2));
      expect(balance3).to.be.gt(balance2);
    });
    
    it("Should maintain correct total supply across multiple users", async function () {
      await market.buyFractions(buyer1.address, HUNDRED_RUPEES_IN_PAISE);
      await market.buyFractions(buyer2.address, HUNDRED_RUPEES_IN_PAISE);
      
      const balance1 = await fractionToken.balanceOf(buyer1.address);
      const balance2 = await fractionToken.balanceOf(buyer2.address);
      const totalSupply = await fractionToken.totalSupply();
      
      expect(totalSupply).to.equal(balance1 + balance2);
    });
  });
});
