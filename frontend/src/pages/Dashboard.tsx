import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioAPI } from '../lib/api';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

interface Stock {
  symbol: string;
  name: string;
  yahooSymbol: string;
  sector: string;
  icon: string;
  price: number;
  priceInPaise: number;
  change: number;
  changePercent: number;
}

interface OrderBookLevel {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  lastUpdate: number;
}

interface TxDetails {
  hash: string;
  gasUsed: string;
  blockNumber: number;
  from: string;
  to: string;
  tokensReceived: string;
  priceUsed: number;
  amountSpent: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [txDetails, setTxDetails] = useState<TxDetails | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);
  const [priceKeys, setPriceKeys] = useState<Map<string, number>>(new Map());
  const [lastPrices, setLastPrices] = useState<Map<string, number>>(new Map());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch
    fetchStocks();
    fetchBalance();
    
    // Don't create intervals in the initial useEffect
    // We'll create them after stocks are loaded
  }, []);

  useEffect(() => {
    if (stocks.length === 0) return;
    
    // Create individual update intervals for each stock with random 3-7 second delays
    const intervals: NodeJS.Timeout[] = [];
    
    stocks.forEach((stock, i) => {
      // Each stock starts at a different time (staggered)
      const initialDelay = i * 400 + Math.random() * 300;
      
      setTimeout(() => {
        // Create interval with random 3-7 second timing for this specific stock
        const randomInterval = 3000 + Math.random() * 4000;
        const interval = setInterval(async () => {
          try {
            // Fetch just this one stock's latest data
            const response = await api.get('/market/stocks');
            const allStocks = response.data;
            const updatedStock = allStocks.find((s: Stock) => s.symbol === stock.symbol);
            
            if (updatedStock) {
              setStocks(prevStocks => {
                const oldStock = prevStocks.find(s => s.symbol === stock.symbol);
                
                // Check if price actually changed
                if (oldStock && oldStock.price !== updatedStock.price) {
                  setPriceKeys(prev => {
                    const newMap = new Map(prev);
                    newMap.set(stock.symbol, Date.now());
                    return newMap;
                  });
                  
                  setLastPrices(prev => {
                    const newMap = new Map(prev);
                    newMap.set(stock.symbol, updatedStock.price);
                    return newMap;
                  });
                }
                
                // Update only this stock in the array
                return prevStocks.map(s => 
                  s.symbol === stock.symbol ? updatedStock : s
                );
              });
              
              // If this is the currently selected stock, update it too
              setSelectedStock(prev => {
                if (prev && prev.symbol === stock.symbol) {
                  return updatedStock;
                }
                return prev;
              });
            }
          } catch (error) {
            console.error(`Failed to update ${stock.symbol}:`, error);
          }
        }, randomInterval);
        
        intervals.push(interval);
      }, initialDelay);
    });
    
    return () => {
      intervals.forEach(clearInterval);
    };
  }, [stocks.length]);

  useEffect(() => {
    if (selectedStock) {
      console.log('Selected stock changed to:', selectedStock.symbol);
      fetchOrderBook();
      const interval = setInterval(fetchOrderBook, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedStock?.symbol]);

  const fetchStocks = async () => {
    try {
      const response = await api.get('/market/stocks');
      const newStocks = response.data;
      
      // Update price change keys to trigger flash animation
      const newKeys = new Map(priceKeys);
      newStocks.forEach((stock: Stock) => {
        const oldStock = stocks.find(s => s.symbol === stock.symbol);
        if (oldStock && oldStock.price !== stock.price) {
          newKeys.set(stock.symbol, Date.now());
        }
      });
      setPriceKeys(newKeys);
      
      setStocks(newStocks);
      
      // Only set initial selected stock if none is selected
      if (!selectedStock && newStocks.length > 0) {
        setSelectedStock(newStocks[0]);
      }
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await portfolioAPI.getBalance();
      setBalance(response.data.balanceInRupees);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchOrderBook = async () => {
    if (!selectedStock) return;
    try {
      console.log('Fetching order book for:', selectedStock.symbol);
      const response = await api.get(`/market/orderbook/${selectedStock.symbol}`);
      console.log('Order book received for:', selectedStock.symbol);
      setOrderBook(response.data);
    } catch (error) {
      console.error('Failed to fetch order book:', error);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    
    setLoading(true);
    setMessage(null);
    setTxDetails(null);

    try {
      if (side === 'buy') {
        const response = await api.post('/market/buy', { 
          amountInRupees: Number(amount),
          stockSymbol: selectedStock.symbol 
        });
        const txData: TxDetails = {
          hash: response.data.txHash,
          gasUsed: response.data.gasUsed,
          blockNumber: response.data.blockNumber || 0,
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          tokensReceived: response.data.tokensReceived,
          priceUsed: response.data.priceUsed,
          amountSpent: Number(amount),
        };
        setTxDetails(txData);
        setShowTxModal(true);
        setMessage({
          type: 'success',
          text: `Successfully bought ${response.data.tokensReceived} ${selectedStock.symbol}f tokens!`,
        });
      } else {
        const response = await api.post('/market/sell', { 
          amountInRupees: Number(amount),
          stockSymbol: selectedStock.symbol 
        });
        const txData: TxDetails = {
          hash: response.data.txHash,
          gasUsed: response.data.gasUsed,
          blockNumber: response.data.blockNumber || 0,
          from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          tokensReceived: response.data.tokensSold,
          priceUsed: response.data.priceUsed,
          amountSpent: Number(amount),
        };
        setTxDetails(txData);
        setShowTxModal(true);
        setMessage({
          type: 'success',
          text: `Successfully sold ${response.data.tokensSold} ${selectedStock.symbol}f tokens for ₹${response.data.amountReceived}!`,
        });
      }
      setAmount('');
      fetchBalance();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Trade failed',
      });
      setShowTxModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Carousel drag/swipe handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX - scrollPosition);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - startX;
    setScrollPosition(x);
    if (carouselRef.current) {
      carouselRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const handleDragEnd = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.preventDefault();
    setIsDragging(false);
  };

  const bestBid = orderBook?.bids[0]?.price || 0;
  const bestAsk = orderBook?.asks[0]?.price || 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid > 0 ? ((spread / bestBid) * 100).toFixed(3) : '0';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💎</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">EquiChain Exchange</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-gray-400">Balance:</span>
              <span className="ml-2 font-bold text-green-400">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <button onClick={() => navigate('/portfolio')} className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold">
              Portfolio
            </button>
            <button onClick={() => navigate('/concepts')} className="text-sm text-yellow-400 hover:text-yellow-300 font-semibold">
              🔬 Tech Stack
            </button>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stock Ticker Carousel */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/20 py-4 overflow-hidden relative">
        {/* Left blur fade - extended */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-black via-black/90 via-black/60 to-transparent z-10 pointer-events-none"></div>
        {/* Right blur fade - extended */}
        <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-black via-black/90 via-black/60 to-transparent z-10 pointer-events-none"></div>
        
        <div 
          ref={carouselRef}
          className="animate-scroll-continuous"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          style={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            animationPlayState: isDragging ? 'paused' : 'running',
            touchAction: 'pan-y'
          }}
        >
          <div className="flex gap-3 px-4" style={{ width: 'max-content' }}>
            {[...stocks, ...stocks, ...stocks].map((stock, idx) => {
              const priceChangeKey = `${stock.symbol}-${stock.price}`;
              const hasRecentChange = priceKeys.has(stock.symbol);
              return (
              <div
                key={`${stock.symbol}-${idx}`}
                className="flex-shrink-0"
                style={{ width: '180px', height: '200px' }}
              >
                <button
                  onClick={(e) => {
                    if (!isDragging) {
                      e.stopPropagation();
                      console.log('Clicked stock:', stock.symbol);
                      setSelectedStock(stock);
                    }
                  }}
                  className={`w-full h-full px-6 py-4 rounded-xl border transition-all transform hover:scale-105 ${
                    selectedStock?.symbol === stock.symbol
                      ? 'bg-gradient-to-br from-yellow-600 to-yellow-700 border-yellow-500 shadow-xl shadow-yellow-600/50'
                      : 'bg-gray-900 border-gray-700 hover:border-yellow-600/50'
                  }`}
                >
                  <div className="text-4xl mb-2">{stock.icon}</div>
                  <div className="font-bold text-sm mb-1 text-yellow-400 truncate">{stock.symbol}</div>
                  <div className="text-xs text-gray-400 mb-2 truncate">{stock.sector}</div>
                  <div 
                    key={priceChangeKey}
                    className={`font-bold text-lg text-white truncate ${
                      hasRecentChange 
                        ? (stock.changePercent >= 0 ? 'price-flash-green' : 'price-flash-red')
                        : ''
                    }`}
                  >
                    ₹{stock.price.toLocaleString('en-IN')}
                  </div>
                  <div className={`text-xs font-bold mt-1 truncate ${stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
                  </div>
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        @keyframes flashGreen {
          0%, 100% { 
            background-color: transparent; 
            box-shadow: none;
          }
          50% { 
            background-color: rgba(34, 197, 94, 0.15);
            box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
          }
        }
        @keyframes flashRed {
          0%, 100% { 
            background-color: transparent;
            box-shadow: none;
          }
          50% { 
            background-color: rgba(239, 68, 68, 0.15);
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
          }
        }
        .animate-scroll-continuous {
          animation: scroll 90s linear infinite;
          will-change: transform;
          user-select: none;
          -webkit-user-select: none;
        }
        .price-flash-green {
          animation: flashGreen 0.6s ease-in-out;
        }
        .price-flash-red {
          animation: flashRed 0.6s ease-in-out;
        }
      `}</style>

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowTxModal(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-yellow-600/50 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-yellow-600/20" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400 mb-2">
                  {message?.type === 'success' ? '✅ Transaction Successful' : '❌ Transaction Failed'}
                </h2>
                <p className={`text-sm ${message?.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message?.text}
                </p>
              </div>
              <button onClick={() => setShowTxModal(false)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            {txDetails && message?.type === 'success' && (
              <div className="space-y-4">
                <div className="bg-black/50 rounded-xl p-4 border border-yellow-600/30">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-400">Transaction Hash</div>
                    <button 
                      onClick={() => copyToClipboard(txDetails.hash)}
                      className="text-xs px-3 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded border border-yellow-600/50 transition-all"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="font-mono text-yellow-400 break-all text-sm">{txDetails.hash}</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-black/50 rounded-xl p-4 border border-green-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">Tokens Received</div>
                      <button 
                        onClick={() => copyToClipboard(txDetails.tokensReceived)}
                        className="text-xs px-2 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded border border-green-600/50"
                      >
                        📋
                      </button>
                    </div>
                    <div className="text-lg font-bold text-green-400 break-words">{txDetails.tokensReceived} {selectedStock?.symbol}f</div>
                  </div>

                  <div className="bg-black/50 rounded-xl p-4 border border-red-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">Amount Spent</div>
                      <button 
                        onClick={() => copyToClipboard(txDetails.amountSpent?.toString() || '0')}
                        className="text-xs px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded border border-red-600/50"
                      >
                        📋
                      </button>
                    </div>
                    <div className="text-lg font-bold text-red-400">₹{txDetails.amountSpent?.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="bg-black/50 rounded-xl p-4 border border-yellow-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">Price Used</div>
                      <button 
                        onClick={() => copyToClipboard(txDetails.priceUsed?.toString() || '0')}
                        className="text-xs px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded border border-yellow-600/50"
                      >
                        📋
                      </button>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">₹{txDetails.priceUsed?.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="bg-black/50 rounded-xl p-4 border border-yellow-600/30">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">Gas Used</div>
                      <button 
                        onClick={() => copyToClipboard(txDetails.gasUsed)}
                        className="text-xs px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded border border-yellow-600/50"
                      >
                        📋
                      </button>
                    </div>
                    <div className="text-lg font-bold text-yellow-400">{txDetails.gasUsed}</div>
                  </div>
                </div>

                <div className="bg-black/50 rounded-xl p-4 border border-yellow-600/30">
                  <div className="text-sm text-gray-400 mb-3">⛓️ Blockchain Details</div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400">From (Custodian):</span>
                        <button 
                          onClick={() => copyToClipboard(txDetails.from)}
                          className="text-xs px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded border border-yellow-600/50"
                        >
                          📋
                        </button>
                      </div>
                      <span className="font-mono text-yellow-400 break-all text-xs">{txDetails.from}</span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-400">To (Market Contract):</span>
                        <button 
                          onClick={() => copyToClipboard(txDetails.to)}
                          className="text-xs px-2 py-1 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded border border-yellow-600/50"
                        >
                          📋
                        </button>
                      </div>
                      <span className="font-mono text-yellow-400 break-all text-xs">{txDetails.to}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-yellow-600/20">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-yellow-400 font-semibold">Hardhat Local (Chain ID: 31337)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message?.type === 'error' && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-4">
                <div className="text-red-400">
                  <p className="font-semibold mb-2">Error Details:</p>
                  <p className="text-sm break-words">{message.text}</p>
                  <p className="text-xs text-gray-400 mt-2">Please check your balance and try again.</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowTxModal(false)}
              className="w-full mt-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedStock && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Book */}
            <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 shadow-xl">
              <div className="p-6 border-b border-yellow-600/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-yellow-400">{selectedStock.icon} {selectedStock.name}</h2>
                    <p className="text-sm text-gray-400 mt-1">{selectedStock.symbol} • {selectedStock.sector}</p>
                  </div>
                  <div className="text-right">
                    <div 
                      key={`price-${selectedStock.symbol}-${selectedStock.price}`}
                      className={`text-4xl font-bold text-white ${
                        priceKeys.has(selectedStock.symbol) && (Date.now() - (priceKeys.get(selectedStock.symbol) || 0)) < 600
                          ? (selectedStock.changePercent >= 0 ? 'price-flash-green' : 'price-flash-red')
                          : ''
                      }`}
                    >
                      ₹{selectedStock.price.toLocaleString('en-IN')}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${selectedStock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedStock.changePercent >= 0 ? '▲' : '▼'} ₹{Math.abs(selectedStock.change).toFixed(2)} ({Math.abs(selectedStock.changePercent).toFixed(2)}%)
                    </div>
                    <div className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      LIVE • Spread: ₹{spread.toFixed(2)} ({spreadPercent}%)
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-yellow-600/10">
                {/* Bids - Left Side */}
                <div className="bg-black p-6">
                  <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center gap-2">
                    <span>📈</span> BUY ORDERS (BID)
                  </h3>
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                      <div className="text-right">Total</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Price</div>
                    </div>
                    {orderBook?.bids.slice(0, 15).map((bid, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-3 gap-2 text-xs hover:bg-green-900/20 p-2 rounded cursor-pointer transition-colors border-l-2 border-transparent hover:border-green-500"
                        onClick={() => setLimitPrice(bid.price.toString())}
                      >
                        <div className="text-right text-gray-400 font-mono">₹{bid.total.toLocaleString()}</div>
                        <div className="text-right text-gray-300 font-mono">{bid.quantity.toFixed(3)}</div>
                        <div className="text-right text-green-400 font-mono font-bold">₹{bid.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Asks - Right Side */}
                <div className="bg-black p-6">
                  <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                    <span>📉</span> SELL ORDERS (ASK)
                  </h3>
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                      <div>Price</div>
                      <div className="text-right">Qty</div>
                      <div className="text-right">Total</div>
                    </div>
                    {orderBook?.asks.slice(0, 15).reverse().map((ask, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-3 gap-2 text-xs hover:bg-red-900/20 p-2 rounded cursor-pointer transition-colors border-l-2 border-transparent hover:border-red-500"
                        onClick={() => setLimitPrice(ask.price.toString())}
                      >
                        <div className="text-red-400 font-mono font-bold">₹{ask.price.toLocaleString()}</div>
                        <div className="text-right text-gray-300 font-mono">{ask.quantity.toFixed(3)}</div>
                        <div className="text-right text-gray-400 font-mono">₹{ask.total.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Panel */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6 shadow-xl">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Place Order</h3>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setSide('buy')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    side === 'buy' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-600/50' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setSide('sell')}
                  className={`py-3 rounded-lg font-bold transition-all ${
                    side === 'sell' 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/50' 
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  SELL
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2 font-semibold">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
                  className="w-full bg-gray-800 border border-yellow-600/30 rounded-lg px-4 py-3 text-white focus:border-yellow-600 focus:outline-none"
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>

              {orderType === 'limit' && (
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">Limit Price (₹)</label>
                  <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-gray-800 border border-yellow-600/30 rounded-lg px-4 py-3 text-white focus:border-yellow-600 focus:outline-none"
                    placeholder="Enter price"
                    step="0.01"
                  />
                </div>
              )}

              <form onSubmit={handleTrade}>
                <div className="mb-6">
                  <label className="block text-sm text-gray-400 mb-2 font-semibold">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-800 border border-yellow-600/30 rounded-lg px-4 py-3 text-white text-lg focus:border-yellow-600 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                  <div className="mt-3 flex gap-2">
                    {[100, 1000, 5000, 10000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        className="px-3 py-1 bg-gray-800 hover:bg-yellow-600/20 hover:border-yellow-600 border border-gray-700 rounded text-xs font-semibold transition-all"
                      >
                        ₹{val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {Number(amount) > 0 && selectedStock && (
                  <div className="bg-gradient-to-r from-yellow-600/10 to-yellow-700/10 border border-yellow-600/30 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Price per Token</div>
                        <div className="text-lg font-bold text-white">
                          ₹{selectedStock.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Estimated Tokens</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {(Number(amount) / selectedStock.price).toFixed(8)} {selectedStock.symbol}f
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !amount || Number(amount) <= 0}
                  className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
                    side === 'buy'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white shadow-lg shadow-green-600/50'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : `${side.toUpperCase()} ${selectedStock.symbol}`}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-yellow-600/20">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-400">Best Bid:</span>
                  <span className="text-green-400 font-mono font-bold">₹{bestBid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Best Ask:</span>
                  <span className="text-red-400 font-mono font-bold">₹{bestAsk.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-yellow-600/30 p-4 text-center hover:border-yellow-600/50 transition-all">
              <div className="text-3xl mb-2">⛓️</div>
              <div className="text-sm text-gray-400">Blockchain</div>
              <div className="text-xs text-yellow-400 mt-1 font-semibold">Hardhat Local</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-yellow-600/30 p-4 text-center hover:border-yellow-600/50 transition-all">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-sm text-gray-400">Live Order Book</div>
              <div className="text-xs text-yellow-400 mt-1 font-semibold">1s Updates</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-yellow-600/30 p-4 text-center hover:border-yellow-600/50 transition-all">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm text-gray-400">Fractional Tokens</div>
              <div className="text-xs text-yellow-400 mt-1 font-semibold">Min ₹0.00000001</div>
            </div>
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-yellow-600/30 p-4 text-center hover:border-yellow-600/50 transition-all">
              <div className="text-3xl mb-2">🔴</div>
              <div className="text-sm text-gray-400">Live Prices</div>
              <div className="text-xs text-yellow-400 mt-1 font-semibold">Yahoo Finance</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
