import fetch from 'node-fetch';

// Yahoo Finance API endpoint (free, no key needed)
const YAHOO_FINANCE_API = 'https://query1.finance.yahoo.com/v8/finance/chart';

interface StockPrice {
  symbol: string;
  price: number;
  currency: string;
  timestamp: number;
  change: number;
  changePercent: number;
  intradayPrices?: Array<{ time: number; price: number }>;
}

// Cache for prices (refresh every 2 seconds for live movement)
const priceCache: Map<string, { price: StockPrice; expiry: number }> = new Map();
const CACHE_DURATION = 2 * 1000; // 2 seconds

/**
 * Fetch live stock price from Yahoo Finance
 */
export async function fetchLivePrice(symbol: string): Promise<StockPrice | null> {
  try {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && cached.expiry > Date.now()) {
      console.log(`📊 Using cached price for ${symbol}`);
      return cached.price;
    }

    console.log(`📡 Fetching live price for ${symbol}...`);
    
    // Yahoo Finance expects symbols with exchange suffix for Indian stocks
    // MRF.NS for NSE, MRF.BO for BSE
    const yahooSymbol = symbol === 'MRF' ? 'MRF.NS' : symbol;
    
    const response = await fetch(`${YAHOO_FINANCE_API}/${yahooSymbol}?interval=1d&range=1d`);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data: any = await response.json();
    
    // Extract current price from Yahoo Finance response
    const quote = data?.chart?.result?.[0];
    if (!quote || !quote.meta?.regularMarketPrice) {
      throw new Error('Invalid response from Yahoo Finance');
    }

    const priceInUSD = quote.meta.regularMarketPrice;
    const previousClose = quote.meta.chartPreviousClose || quote.meta.previousClose || priceInUSD;
    const currency = quote.meta.currency || 'USD';
    
    // Convert to INR if needed (approximate rate: 1 USD = 83 INR)
    const priceInINR = currency === 'INR' ? priceInUSD : priceInUSD * 83;
    const prevCloseINR = currency === 'INR' ? previousClose : previousClose * 83;
    
    const change = priceInINR - prevCloseINR;
    const changePercent = prevCloseINR > 0 ? (change / prevCloseINR) * 100 : 0;
    
    // Add slight real-time movement to live price (±0.1%)
    const microMove = (Math.random() - 0.5) * 0.002;
    const adjustedPrice = priceInINR * (1 + microMove);
    const adjustedChange = adjustedPrice - prevCloseINR;
    const adjustedChangePercent = prevCloseINR > 0 ? (adjustedChange / prevCloseINR) * 100 : 0;
    
    const stockPrice: StockPrice = {
      symbol,
      price: Math.round(adjustedPrice * 100), // Convert to paise
      currency: 'INR',
      timestamp: Date.now(),
      change: Math.round(adjustedChange * 100), // Change in paise
      changePercent: Math.round(adjustedChangePercent * 100) / 100, // 2 decimal places
    };

    // Cache the price
    priceCache.set(symbol, {
      price: stockPrice,
      expiry: Date.now() + CACHE_DURATION,
    });

    console.log(`✅ Live price for ${symbol}: ₹${priceInINR.toFixed(2)}`);
    return stockPrice;
  } catch (error) {
    console.error(`❌ Error fetching price for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get price with fallback to default if API fails
 */
export async function getPriceWithFallback(symbol: string, fallbackPaise: number): Promise<number> {
  const livePrice = await fetchLivePrice(symbol);
  
  if (livePrice) {
    return livePrice.price;
  }
  
  // Fallback to default price if API fails
  console.log(`⚠️  Using fallback price for ${symbol}: ₹${fallbackPaise / 100}`);
  return fallbackPaise;
}

/**
 * Get multiple stock prices
 */
// Cache for intraday prices (390 data points for 6.5 hour trading day)
const intradayCache = new Map<string, { prices: number[]; timestamp: number }>();
const INTRADAY_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch intraday prices (1-minute intervals) for simulating live updates
 * even when markets are closed
 */
export async function fetchIntradayPrices(symbol: string): Promise<number[]> {
  const cached = intradayCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < INTRADAY_CACHE_DURATION) {
    return cached.prices;
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url);
    const data = await response.json();
    
    const timestamps = data?.chart?.result?.[0]?.timestamp || [];
    const prices = data?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
    
    if (prices.length === 0) {
      return [];
    }
    
    // Filter out null values and convert to INR if needed
    const currency = data?.chart?.result?.[0]?.meta?.currency || 'USD';
    const validPrices = prices
      .filter((p: number | null) => p !== null)
      .map((p: number) => (currency === 'INR' ? p : p * 83));
    
    intradayCache.set(symbol, { prices: validPrices, timestamp: Date.now() });
    return validPrices;
  } catch (error) {
    console.error(`Failed to fetch intraday prices for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get current simulated price based on intraday data loop with second-level dispersion
 */
export async function getSimulatedCurrentPrice(symbol: string, basePrice: number): Promise<number> {
  const intradayPrices = await fetchIntradayPrices(symbol);
  
  if (intradayPrices.length === 0) {
    // Fallback to base price with tiny random movement
    const microMove = (Math.random() - 0.5) * 0.005; // ±0.25%
    return basePrice * (1 + microMove);
  }
  
  // Loop through intraday prices based on current second
  const secondOfDay = Math.floor((Date.now() / 1000) % (6.5 * 60 * 60)); // 6.5 hour trading day
  const minuteOfDay = Math.floor(secondOfDay / 60);
  const index = minuteOfDay % intradayPrices.length;
  
  // Get base price from minute data
  const minutePrice = intradayPrices[index];
  
  // Add second-level dispersion (random within ±0.5% of minute price)
  const secondOfMinute = secondOfDay % 60;
  const dispersion = Math.sin(secondOfMinute * 0.1047) * 0.005; // Smooth sine wave ±0.5%
  const randomNoise = (Math.random() - 0.5) * 0.001; // Additional ±0.05% noise
  
  return minutePrice * (1 + dispersion + randomNoise);
}

export async function getMultiplePrices(symbols: string[]): Promise<Map<string, StockPrice>> {
  const priceMap = new Map<string, StockPrice>();
  
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const price = await fetchLivePrice(symbol);
        if (price) {
          priceMap.set(symbol, price);
        }
      } catch (error) {
        console.error(`Failed to fetch price for ${symbol}:`, error);
      }
    })
  );
  
  return priceMap;
}

/**
 * Clear price cache (for testing/debugging)
 */
export function clearPriceCache(): void {
  priceCache.clear();
  console.log('🧹 Price cache cleared');
}
