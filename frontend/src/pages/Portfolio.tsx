import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioAPI, marketAPI } from '../lib/api';

export default function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sellAmount, setSellAmount] = useState('');
  const [sellLoading, setSellLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    setSellLoading(true);
    setMessage(null);

    try {
      const response = await marketAPI.sell(sellAmount);
      setMessage({
        type: 'success',
        text: `Successfully sold ${sellAmount} tokens for ₹${response.data.amountReceived}!`,
      });
      setSellAmount('');
      fetchPortfolio();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Sale failed',
      });
    } finally {
      setSellLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: `${label} copied to clipboard!` });
    setTimeout(() => setMessage(null), 2000);
  };

  const openTxModal = (tx: any) => {
    setSelectedTransaction(tx);
    setShowTxModal(true);
  };

  const closeTxModal = () => {
    setShowTxModal(false);
    setSelectedTransaction(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-2xl font-bold animate-pulse">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💎</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">My Portfolio</h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/dashboard')} className="text-yellow-400 hover:text-yellow-300 font-semibold">
                Dashboard
              </button>
              <button onClick={() => navigate('/concepts')} className="text-yellow-400 hover:text-yellow-300 font-semibold">
                🔬 Tech Stack
              </button>
              <span className="text-gray-400">{portfolio?.user?.email}</span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-600/30 p-6 hover:border-green-600/50 transition-all">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Cash Balance</h3>
            <p className="text-3xl font-bold text-green-400">
              ₹{portfolio?.summary?.cashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6 hover:border-yellow-600/50 transition-all">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Total Invested</h3>
            <p className="text-3xl font-bold text-yellow-400">
              ₹{portfolio?.summary?.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6 hover:border-yellow-600/50 transition-all">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Current Value</h3>
            <p className="text-3xl font-bold text-yellow-400">
              ₹{portfolio?.summary?.totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6 hover:border-yellow-600/50 transition-all">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Profit / Loss</h3>
            <p className={`text-3xl font-bold ${portfolio?.summary?.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolio?.summary?.totalProfitLoss >= 0 ? '+' : ''}₹{portfolio?.summary?.totalProfitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </p>
            <span className="text-sm text-gray-400 mt-1">
              ({portfolio?.summary?.totalProfitLossPercent}%)
            </span>
          </div>
        </div>

        {/* Holdings */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 mb-8 overflow-hidden">
          <div className="p-6 border-b border-yellow-600/20">
            <h3 className="text-2xl font-bold text-yellow-400">Holdings</h3>
          </div>
          
          {portfolio?.positions && portfolio.positions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/50">
                  <tr className="border-b border-yellow-600/20">
                    <th className="text-left py-4 px-6 text-gray-400 font-semibold">Symbol</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">Quantity</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">Avg Price</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">Current Price</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">Invested</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">Current Value</th>
                    <th className="text-right py-4 px-6 text-gray-400 font-semibold">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.positions.map((position: any, index: number) => (
                    <tr key={index} className="border-b border-yellow-600/10 hover:bg-yellow-600/5 transition-colors">
                      <td className="py-5 px-6 text-yellow-400 font-bold text-lg">{position.symbol}</td>
                      <td className="py-5 px-6 text-right text-gray-300 font-mono">{Number(position.quantity).toFixed(8)}</td>
                      <td className="py-5 px-6 text-right text-gray-300 font-mono">₹{position.avgPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-5 px-6 text-right text-white font-semibold">₹{position.currentPrice.toLocaleString('en-IN')}</td>
                      <td className="py-5 px-6 text-right text-yellow-400 font-semibold">₹{position.invested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="py-5 px-6 text-right text-yellow-400 font-semibold">₹{position.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className={`py-5 px-6 text-right font-bold text-lg ${position.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {position.profitLoss >= 0 ? '+' : ''}₹{position.profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        <br />
                        <span className="text-sm">({position.profitLossPercent}%)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-xl mb-2">No holdings yet</p>
              <p className="text-sm mb-6">Start your investment journey</p>
              <button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition-all">
                Start Trading
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 overflow-hidden">
          <div className="p-6 border-b border-yellow-600/20">
            <h3 className="text-2xl font-bold text-yellow-400">Recent Transactions</h3>
          </div>
          
          {portfolio?.recentTransactions && portfolio.recentTransactions.length > 0 ? (
            <div className="p-6 space-y-3">
              {portfolio.recentTransactions.map((tx: any) => (
                <button
                  key={tx.id}
                  onClick={() => openTxModal(tx)}
                  className="w-full flex justify-between items-center p-5 bg-black/50 rounded-xl border border-yellow-600/20 hover:border-yellow-600/60 hover:bg-yellow-600/5 transition-all cursor-pointer"
                >
                  <div className="text-left">
                    <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${tx.type === 'BUY' ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'bg-red-600/20 text-red-400 border border-red-600/50'}`}>
                      {tx.type}
                    </span>
                    <p className="text-white font-semibold text-lg mt-3">
                      {Number(tx.quantity).toFixed(8)} {tx.symbol}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold text-xl">
                      ₹{tx.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-1">
                      {tx.txHash?.substring(0, 16)}...
                    </p>
                    <p className="text-xs text-yellow-600 mt-2">Click for details →</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No transactions yet</p>
          )}
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showTxModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeTxModal}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-yellow-600/50 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30 p-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📋</div>
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Transaction Details</h2>
                  <p className="text-sm text-gray-400 mt-1">Blockchain Transaction Information</p>
                </div>
              </div>
              <button onClick={closeTxModal} className="text-gray-400 hover:text-white text-3xl leading-none">×</button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Transaction Type Badge */}
              <div className="flex items-center gap-4">
                <span className={`px-6 py-3 rounded-xl text-lg font-bold ${selectedTransaction.type === 'BUY' ? 'bg-green-600/20 text-green-400 border-2 border-green-600/50' : 'bg-red-600/20 text-red-400 border-2 border-red-600/50'}`}>
                  {selectedTransaction.type}
                </span>
                <div>
                  <p className="text-2xl font-bold text-white">{Number(selectedTransaction.quantity).toFixed(8)} {selectedTransaction.symbol}</p>
                  <p className="text-sm text-gray-400">{new Date(selectedTransaction.createdAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'long' })}</p>
                </div>
              </div>

              {/* Transaction Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-semibold">PRICE PER TOKEN</span>
                    <button onClick={() => copyToClipboard(selectedTransaction.price.toString(), 'Price')} className="text-yellow-400 hover:text-yellow-300 text-xs">📋 Copy</button>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">₹{selectedTransaction.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Total Amount */}
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-semibold">TOTAL AMOUNT</span>
                    <button onClick={() => copyToClipboard((selectedTransaction.price * Number(selectedTransaction.quantity)).toString(), 'Total')} className="text-yellow-400 hover:text-yellow-300 text-xs">📋 Copy</button>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">₹{(selectedTransaction.price * Number(selectedTransaction.quantity)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>

                {/* Quantity */}
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-semibold">QUANTITY</span>
                    <button onClick={() => copyToClipboard(selectedTransaction.quantity, 'Quantity')} className="text-yellow-400 hover:text-yellow-300 text-xs">📋 Copy</button>
                  </div>
                  <p className="text-xl font-mono text-white break-all">{Number(selectedTransaction.quantity).toFixed(8)}</p>
                </div>

                {/* Symbol */}
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-400 font-semibold">TOKEN SYMBOL</span>
                    <button onClick={() => copyToClipboard(selectedTransaction.symbol, 'Symbol')} className="text-yellow-400 hover:text-yellow-300 text-xs">📋 Copy</button>
                  </div>
                  <p className="text-xl font-bold text-yellow-400">{selectedTransaction.symbol}</p>
                </div>
              </div>

              {/* Blockchain Information */}
              <div className="border-t border-yellow-600/30 pt-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <span className="text-2xl">⛓️</span>
                  Blockchain Details
                </h3>
                
                <div className="space-y-4">
                  {/* Transaction Hash */}
                  <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs text-gray-400 font-semibold">TRANSACTION HASH</span>
                      <button onClick={() => copyToClipboard(selectedTransaction.txHash, 'Transaction Hash')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                    </div>
                    <p className="text-sm font-mono text-green-400 break-all">{selectedTransaction.txHash}</p>
                  </div>

                  {/* Block Number */}
                  {selectedTransaction.blockNumber && (
                    <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400 font-semibold">BLOCK NUMBER</span>
                        <button onClick={() => copyToClipboard(selectedTransaction.blockNumber.toString(), 'Block Number')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                      </div>
                      <p className="text-lg font-mono text-white">{selectedTransaction.blockNumber.toLocaleString()}</p>
                    </div>
                  )}

                  {/* From Address */}
                  {selectedTransaction.from && (
                    <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400 font-semibold">FROM ADDRESS</span>
                        <button onClick={() => copyToClipboard(selectedTransaction.from, 'From Address')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                      </div>
                      <p className="text-sm font-mono text-blue-400 break-all">{selectedTransaction.from}</p>
                    </div>
                  )}

                  {/* To Address (Contract) */}
                  {selectedTransaction.to && (
                    <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-400 font-semibold">TO ADDRESS (CONTRACT)</span>
                        <button onClick={() => copyToClipboard(selectedTransaction.to, 'Contract Address')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                      </div>
                      <p className="text-sm font-mono text-purple-400 break-all">{selectedTransaction.to}</p>
                    </div>
                  )}

                  {/* Gas Used */}
                  {selectedTransaction.gasUsed && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-gray-400 font-semibold">GAS USED</span>
                          <button onClick={() => copyToClipboard(selectedTransaction.gasUsed, 'Gas Used')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                        </div>
                        <p className="text-lg font-mono text-orange-400">{Number(selectedTransaction.gasUsed).toLocaleString()}</p>
                      </div>

                      {/* Gas Price */}
                      {selectedTransaction.gasPrice && (
                        <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-gray-400 font-semibold">GAS PRICE (Wei)</span>
                            <button onClick={() => copyToClipboard(selectedTransaction.gasPrice, 'Gas Price')} className="text-yellow-400 hover:text-yellow-300 text-xs font-semibold">📋 Copy</button>
                          </div>
                          <p className="text-sm font-mono text-orange-400 break-all">{selectedTransaction.gasPrice}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4 border-t border-yellow-600/30">
                <button onClick={closeTxModal} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-8 py-3 rounded-xl transition-all">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
