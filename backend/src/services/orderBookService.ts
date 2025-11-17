import { fetchLivePrice, getSimulatedCurrentPrice } from './priceService';

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[]; // Buy orders
  asks: OrderBookLevel[]; // Sell orders
  lastUpdate: number;
}

interface OrderBookSnapshot {
  timestamp: number;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

// Cache for 60-second looping order book data per stock
const orderBookLoops: Map<string, OrderBookSnapshot[]> = new Map();
const currentPrices: Map<string, number> = new Map();

/**
 * Generate 60 seconds of order book snapshots based on live price
 * Each snapshot has slight variations to simulate real trading
 */
function generateOrderBookLoop(symbol: string, basePrice: number): OrderBookSnapshot[] {
  const snapshots: OrderBookSnapshot[] = [];
  
  for (let second = 0; second < 60; second++) {
    // Add micro-volatility (±0.05% per second)
    const timeFactor = Math.sin(second / 10) * 0.0005;
    const currentPrice = basePrice * (1 + timeFactor);
    
    // Generate ask levels first (15 levels above current price)
    const asks: OrderBookLevel[] = [];
    for (let i = 0; i < 15; i++) {
      const spreadPercent = 0.0001 + (i * 0.00009) + (Math.random() * 0.0001);
      const price = currentPrice * (1 + spreadPercent);
      const baseQty = 20 + (i * 9);
      const qtyVariation = Math.cos((second + i) / 5) * 10;
      const quantity = Math.max(1, baseQty + qtyVariation + (Math.random() * 15));
      
      asks.push({
        price: Math.round(price * 100) / 100,
        quantity: Math.round(quantity * 1000) / 1000,
        total: Math.round(price * quantity * 100) / 100,
      });
    }
    
    // Generate bid levels (15 levels below current price)
    // Ensure highest bid is lower than lowest ask
    const lowestAsk = asks[0].price;
    const bids: OrderBookLevel[] = [];
    for (let i = 0; i < 15; i++) {
      const spreadPercent = 0.0001 + (i * 0.00009) + (Math.random() * 0.0001);
      let price = currentPrice * (1 - spreadPercent);
      
      // Ensure bid is always lower than lowest ask
      if (i === 0 && price >= lowestAsk) {
        price = lowestAsk * 0.9999;
      }
      
      const baseQty = 20 + (i * 9);
      const qtyVariation = Math.sin((second + i) / 5) * 10;
      const quantity = Math.max(1, baseQty + qtyVariation + (Math.random() * 15));
      
      bids.push({
        price: Math.round(price * 100) / 100,
        quantity: Math.round(quantity * 1000) / 1000,
        total: Math.round(price * quantity * 100) / 100,
      });
    }
    
    // Sort bids descending, asks ascending
    bids.sort((a, b) => b.price - a.price);
    asks.sort((a, b) => a.price - b.price);
    asks.sort((a, b) => a.price - b.price);
    
    snapshots.push({
      timestamp: second,
      bids,
      asks,
    });
  }
  
  return snapshots;
}

/**
 * Get current order book snapshot for a stock
 * Uses 60-second loop based on live price
 */
export async function getOrderBook(symbol: string, yahooSymbol: string): Promise<OrderBook> {
  try {
    // Fetch base live price
    const priceData = await fetchLivePrice(yahooSymbol);
    const basePrice = priceData ? priceData.price / 100 : 100000;
    
    // Get simulated current price from intraday loop
    const currentPrice = await getSimulatedCurrentPrice(yahooSymbol, basePrice);
    
    // Check if we need to regenerate the loop
    const cachedPrice = currentPrices.get(symbol);
    if (!cachedPrice || Math.abs(currentPrice - cachedPrice) / cachedPrice > 0.01) {
      console.log(`📊 Regenerating order book loop for ${symbol} @ ₹${currentPrice}`);
      const loop = generateOrderBookLoop(symbol, currentPrice);
      orderBookLoops.set(symbol, loop);
      currentPrices.set(symbol, currentPrice);
    }
    
    // Get current snapshot based on second of minute
    const loop = orderBookLoops.get(symbol);
    if (!loop || loop.length === 0) {
      const newLoop = generateOrderBookLoop(symbol, currentPrice);
      orderBookLoops.set(symbol, newLoop);
    }
    
    const currentSecond = new Date().getSeconds();
    const snapshot = orderBookLoops.get(symbol)?.[currentSecond] || null;
    
    if (!snapshot) {
      return {
        symbol,
        bids: [],
        asks: [],
        lastUpdate: Date.now(),
      };
    }
    
    return {
      symbol,
      bids: snapshot.bids,
      asks: snapshot.asks,
      lastUpdate: Date.now(),
    };
  } catch (error) {
    console.error(`Failed to generate order book for ${symbol}:`, error);
    return {
      symbol,
      bids: [],
      asks: [],
      lastUpdate: Date.now(),
    };
  }
}

/**
 * Get best bid and ask prices
 */
export function getBestPrices(orderBook: OrderBook): { bid: number; ask: number; spread: number } {
  const bid = orderBook.bids[0]?.price || 0;
  const ask = orderBook.asks[0]?.price || 0;
  const spread = ask - bid;
  
  return { bid, ask, spread };
}

/**
 * Force regenerate order book loop for a stock (call when price updates)
 */
export async function refreshOrderBookLoop(symbol: string, yahooSymbol: string): Promise<void> {
  const livePrice = await fetchLivePrice(yahooSymbol);
  const currentPrice = livePrice ? livePrice.price / 100 : 100000;
  
  console.log(`🔄 Refreshing order book loop for ${symbol} @ ₹${currentPrice}`);
  const loop = generateOrderBookLoop(symbol, currentPrice);
  orderBookLoops.set(symbol, loop);
  currentPrices.set(symbol, currentPrice);
}

