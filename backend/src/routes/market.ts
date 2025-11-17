import { Router, Request, Response } from 'express';
import { getBlockchainInstances } from '../config/blockchain';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { Position } from '../entities/Position';
import { Transaction, TransactionType } from '../entities/Transaction';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ethers } from 'ethers';
import { fetchLivePrice, getPriceWithFallback, getMultiplePrices } from '../services/priceService';
import { getOrderBook } from '../services/orderBookService';
import { STOCKS } from '../config/stocks';

const router = Router();

/**
 * GET /market/stocks
 * Get all available stocks with live prices
 */
router.get('/stocks', async (req: Request, res: Response) => {
  try {
    const symbols = STOCKS.map(s => s.yahooSymbol);
    const prices = await getMultiplePrices(symbols);
    
    const stocksWithPrices = STOCKS.map(stock => {
      const priceData = prices.get(stock.yahooSymbol);
      
      // Simulate live price movement using intraday data
      let currentPrice = priceData ? priceData.price : 10000000;
      if (priceData?.intradayPrices && priceData.intradayPrices.length > 0) {
        // Use second-level simulation: cycle through intraday prices
        const now = Date.now();
        const secondOfDay = Math.floor((now / 1000) % 86400); // seconds since midnight
        const priceIndex = secondOfDay % priceData.intradayPrices.length;
        currentPrice = priceData.intradayPrices[priceIndex].price;
      }
      
      return {
        ...stock,
        price: currentPrice / 100,
        priceInPaise: currentPrice,
        change: priceData ? priceData.change / 100 : 0,
        changePercent: priceData ? priceData.changePercent : 0,
        source: priceData ? 'yahoo_finance' : 'fallback',
        hasIntradayData: priceData?.intradayPrices ? priceData.intradayPrices.length > 0 : false,
      };
    });
    
    res.json(stocksWithPrices);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ error: 'Failed to fetch stocks' });
  }
});

/**
 * GET /market/orderbook/:symbol
 * Get live order book for a stock
 */
router.get('/orderbook/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const stock = STOCKS.find(s => s.symbol === symbol);
    
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    const orderBook = await getOrderBook(stock.symbol, stock.yahooSymbol);
    res.json(orderBook);
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

/**
 * GET /market/price
 * Get LIVE stock price from Yahoo Finance (with blockchain fallback)
 * Demonstrates: Off-chain data oracle integration with blockchain
 */
router.get('/price', async (req: Request, res: Response) => {
  try {
    const { marketContract } = getBlockchainInstances();
    const blockchainPrice = await marketContract.getCurrentPrice();
    
    // Fetch LIVE price from Yahoo Finance API (cached 5 mins)
    const livePriceInPaise = await getPriceWithFallback('MRF', Number(blockchainPrice));
    
    console.log(`💰 Price - Live: ₹${livePriceInPaise/100}, Blockchain: ₹${Number(blockchainPrice)/100}`);
    
    res.json({
      priceInPaise: livePriceInPaise.toString(),
      priceInRupees: livePriceInPaise / 100,
      symbol: 'MRF',
      source: livePriceInPaise !== Number(blockchainPrice) ? 'yahoo_finance' : 'blockchain',
      cached: true,
    });
  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({ error: 'Failed to fetch price' });
  }
});

/**
 * POST /market/buy
 * Buy fractional tokens using LIVE market price
 * Blockchain Concepts: Minting ERC-20 tokens, Gas fees, Transaction receipts
 */
router.post('/buy', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amountInRupees, stockSymbol } = req.body;
    const userId = req.userId!;

    // Validation
    if (!amountInRupees || amountInRupees <= 0 || amountInRupees < 0.00000001) {
      return res.status(400).json({ error: 'Minimum amount is ₹0.00000001' });
    }
    
    if (!stockSymbol) {
      return res.status(400).json({ error: 'Stock symbol required' });
    }
    
    // Find the stock configuration
    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!stock) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const amountInPaise = Math.floor(amountInRupees * 100);

    const userRepository = AppDataSource.getRepository(User);
    const positionRepository = AppDataSource.getRepository(Position);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user from off-chain database
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check balance (off-chain validation before blockchain call)
    if (user.balanceInPaise < amountInPaise) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: user.balanceInPaise / 100,
        required: amountInRupees,
      });
    }

    // Get LIVE price from Yahoo Finance for the selected stock
    const { marketContract } = getBlockchainInstances();
    const blockchainPrice = await marketContract.getCurrentPrice();
    const livePriceInPaise = await getPriceWithFallback(stock.yahooSymbol, Number(blockchainPrice));
    
    console.log(`🛒 Buy - Amount: ₹${amountInRupees}, Live Price: ₹${livePriceInPaise/100}`);

    // Call blockchain smart contract to mint tokens
    const { custodianWallet } = getBlockchainInstances();
    const custodianAddress = custodianWallet.address;
    
    // Blockchain transaction: buyFractions
    const tx = await marketContract.buyFractions(custodianAddress, amountInPaise);
    const receipt = await tx.wait();

    console.log(`⛓️  Blockchain TX: ${receipt.hash}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    // Calculate tokens based on LIVE Yahoo Finance price (not blockchain price)
    // Formula: tokens = (amountInPaise * 1e18) / livePriceInPaise
    const tokenAmount = (amountInPaise * 1e18) / livePriceInPaise;
    const tokensReceived = BigInt(Math.floor(tokenAmount)).toString();

    console.log(`🪙 Tokens to receive: ${ethers.formatEther(tokensReceived)} ${stock.symbol}f at ₹${livePriceInPaise/100}`);

    // Update off-chain database (ledger synchronization)
    user.balanceInPaise -= amountInPaise;
    await userRepository.save(user);

    // Update or create position
    const tokenSymbol = `${stock.symbol}f`;
    let position = await positionRepository.findOne({
      where: { userId, tokenSymbol },
    });

    if (position) {
      // Update existing position
      const currentQty = BigInt(position.quantity);
      const newQty = currentQty + BigInt(tokensReceived);
      
      // Calculate new average purchase price
      const totalCost = (position.avgPricePaise * Number(currentQty)) + amountInPaise;
      position.avgPricePaise = Math.floor(totalCost / Number(newQty));
      position.quantity = newQty.toString();
    } else {
      // Create new position
      position = positionRepository.create({
        userId,
        tokenSymbol,
        quantity: tokensReceived,
        avgPricePaise: amountInPaise / Number(tokensReceived) || 0,
      });
    }

    await positionRepository.save(position);

    // Record transaction in off-chain ledger
    const transaction = transactionRepository.create({
      userId,
      type: TransactionType.BUY,
      tokenSymbol,
      quantity: tokensReceived,
      pricePaise: amountInPaise,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice?.toString() || '0',
      from: receipt.from,
      to: receipt.to,
    });

    await transactionRepository.save(transaction);

    res.json({
      message: 'Purchase successful',
      amountSpent: amountInRupees,
      tokensReceived: ethers.formatEther(tokensReceived),
      priceUsed: livePriceInPaise / 100,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      newBalance: user.balanceInPaise / 100,
      stock: stock.symbol,
    });
  } catch (error) {
    console.error('Buy error:', error);
    res.status(500).json({ error: 'Purchase failed' });
  }
});

/**
 * POST /market/sell
 * Sell fractional tokens at LIVE market price
 * Blockchain Concepts: Burning ERC-20 tokens, Event logs
 */
router.post('/sell', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amountInRupees, stockSymbol } = req.body;
    const userId = req.userId!;

    // Validation
    if (!amountInRupees || Number(amountInRupees) <= 0) {
      return res.status(400).json({ error: 'Valid rupee amount required' });
    }

    if (!stockSymbol) {
      return res.status(400).json({ error: 'Stock symbol required' });
    }

    const stock = STOCKS.find(s => s.symbol === stockSymbol);
    if (!stock) {
      return res.status(400).json({ error: 'Invalid stock symbol' });
    }

    const userRepository = AppDataSource.getRepository(User);
    const positionRepository = AppDataSource.getRepository(Position);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get position (check token holdings)
    const tokenSymbol = `${stock.symbol}f`;
    const position = await positionRepository.findOne({
      where: { userId, tokenSymbol },
    });

    if (!position) {
      return res.status(400).json({ error: 'No tokens to sell' });
    }

    // Get current live price (with fallback to blockchain)
    const { marketContract } = getBlockchainInstances();
    const blockchainPrice = await marketContract.getCurrentPrice();
    const livePriceInPaise = await getPriceWithFallback(stock.yahooSymbol, Number(blockchainPrice));

    console.log(`💰 Sell - Amount: ₹${amountInRupees}, Live Price: ₹${livePriceInPaise/100}`);

    // Calculate how many tokens to sell for this rupee amount
    const amountInPaise = amountInRupees * 100;
    const tokenAmount = (amountInPaise * 1e18) / livePriceInPaise;
    const tokenAmountWei = BigInt(Math.floor(tokenAmount));

    console.log(`📊 Selling tokens worth ₹${amountInRupees} = ${ethers.formatEther(tokenAmountWei)} ${stock.symbol}f`);

    // Check if user has enough tokens
    if (BigInt(position.quantity) < tokenAmountWei) {
      return res.status(400).json({ 
        error: 'Insufficient tokens',
        available: ethers.formatEther(position.quantity),
        required: ethers.formatEther(tokenAmountWei),
      });
    }

    // Call blockchain to burn tokens
    const { custodianWallet } = getBlockchainInstances();
    const custodianAddress = custodianWallet.address;
    
    const tx = await marketContract.sellFractions(custodianAddress, tokenAmountWei);
    const receipt = await tx.wait();

    console.log(`⛓️  Sell TX: ${receipt.hash}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);

    // Update user balance
    user.balanceInPaise += amountInPaise;
    await userRepository.save(user);

    // Update position
    const newQty = BigInt(position.quantity) - tokenAmountWei;
    if (newQty === BigInt(0)) {
      await positionRepository.remove(position);
      console.log(`🗑️  Position closed for ${tokenSymbol}`);
    } else {
      position.quantity = newQty.toString();
      await positionRepository.save(position);
      console.log(`📉 Position updated: ${ethers.formatEther(newQty)} ${stock.symbol}f remaining`);
    }

    // Record transaction
    const transaction = transactionRepository.create({
      userId,
      type: TransactionType.SELL,
      tokenSymbol,
      quantity: tokenAmountWei.toString(),
      pricePaise: amountInPaise,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: receipt.gasPrice?.toString() || '0',
      from: receipt.from,
      to: receipt.to,
    });

    await transactionRepository.save(transaction);

    console.log(`✅ Sale complete: ${ethers.formatEther(tokenAmountWei)} ${stock.symbol}f for ₹${amountInPaise/100}`);

    res.json({
      message: 'Sale successful',
      tokensSold: ethers.formatEther(tokenAmountWei),
      amountReceived: amountInPaise / 100,
      priceUsed: livePriceInPaise / 100,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      blockNumber: receipt.blockNumber,
      newBalance: user.balanceInPaise / 100,
      stock: stock.symbol,
    });
  } catch (error) {
    console.error('Sell error:', error);
    res.status(500).json({ error: 'Sale failed' });
  }
});

/**
 * POST /market/calculate-tokens
 * Calculate how many tokens can be purchased
 */
router.post('/calculate-tokens', async (req: Request, res: Response) => {
  try {
    const { amountInRupees } = req.body;
    
    if (!amountInRupees || amountInRupees <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const amountInPaise = Math.floor(amountInRupees * 100);
    const { marketContract } = getBlockchainInstances();
    
    const tokens = await marketContract.calculateTokensForAmount(amountInPaise);
    
    res.json({
      amountInRupees,
      tokensReceived: ethers.formatEther(tokens),
    });
  } catch (error) {
    console.error('Calculate error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

export default router;
