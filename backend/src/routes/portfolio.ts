import { Router, Response } from 'express';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { Position } from '../entities/Position';
import { Transaction } from '../entities/Transaction';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getBlockchainInstances } from '../config/blockchain';
import { ethers } from 'ethers';
import { fetchLivePrice } from '../services/priceService';
import { STOCKS } from '../config/stocks';

const router = Router();

// Get user portfolio
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const userRepository = AppDataSource.getRepository(User);
    const positionRepository = AppDataSource.getRepository(Position);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    // Get user
    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get positions
    const positions = await positionRepository.find({
      where: { userId },
    });

    // Get live prices for all positions
    const positionPrices = new Map<string, number>();
    for (const pos of positions) {
      // Extract base symbol (e.g., "MRFf" -> "MRF")
      const baseSymbol = pos.tokenSymbol.replace('f', '');
      const stock = STOCKS.find((s) => s.symbol === baseSymbol);
      
      if (stock) {
        try {
          const priceData = await fetchLivePrice(stock.yahooSymbol);
          if (priceData) {
            positionPrices.set(pos.tokenSymbol, priceData.price);
          } else {
            // Fallback to blockchain price
            const { marketContract } = getBlockchainInstances();
            const blockchainPrice = await marketContract.getCurrentPrice();
            positionPrices.set(pos.tokenSymbol, Number(blockchainPrice));
          }
        } catch (error) {
          console.error(`Failed to fetch live price for ${stock.yahooSymbol}:`, error);
          // Fallback to blockchain price
          const { marketContract } = getBlockchainInstances();
          const blockchainPrice = await marketContract.getCurrentPrice();
          positionPrices.set(pos.tokenSymbol, Number(blockchainPrice));
        }
      }
    }

    // Calculate portfolio value
    const positionsWithValue = positions.map((pos) => {
      const qty = BigInt(pos.quantity);
      const qtyInTokens = Number(ethers.formatEther(qty));
      const currentPriceInPaise = positionPrices.get(pos.tokenSymbol) || 0;
      const currentValue = (currentPriceInPaise * Number(qty)) / Number(1e18);
      const invested = pos.avgPricePaise * qtyInTokens;
      const profitLoss = currentValue - invested;

      return {
        symbol: pos.tokenSymbol,
        quantity: ethers.formatEther(qty),
        avgPrice: pos.avgPricePaise / 100,
        currentPrice: currentPriceInPaise / 100,
        invested: invested / 100,
        currentValue: currentValue / 100,
        profitLoss: profitLoss / 100,
        profitLossPercent: invested > 0 ? ((profitLoss / invested) * 100).toFixed(2) : '0.00',
      };
    });

    // Get recent transactions
    const transactions = await transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });

    const formattedTransactions = transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      symbol: tx.tokenSymbol,
      quantity: ethers.formatEther(tx.quantity),
      price: tx.pricePaise / 100,
      txHash: tx.txHash,
      blockNumber: tx.blockNumber,
      gasUsed: tx.gasUsed,
      gasPrice: tx.gasPrice,
      from: tx.from,
      to: tx.to,
      createdAt: tx.createdAt,
    }));

    // Calculate total portfolio value
    const totalInvested = positionsWithValue.reduce((sum, pos) => sum + pos.invested, 0);
    const totalCurrentValue = positionsWithValue.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;

    res.json({
      user: {
        email: user.email,
        balanceInRupees: user.balanceInPaise / 100,
      },
      summary: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent: totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : '0.00',
        cashBalance: user.balanceInPaise / 100,
      },
      positions: positionsWithValue,
      recentTransactions: formattedTransactions,
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
});

// Get user balance
router.get('/balance', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balanceInRupees: user.balanceInPaise / 100,
      balanceInPaise: user.balanceInPaise,
    });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

export default router;
