import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { portfolioAPI } from '../lib/api';
import axios from 'axios';

interface BlockInfo {
  number: number;
  hash: string;
  transactions: number;
  gasUsed: string;
  timestamp: number;
}

interface ConceptMetrics {
  totalTransactions: number;
  totalGasUsed: string;
  uniqueUsers: number;
  contractInteractions: number;
  averageGasPrice: string;
  blockTime: number;
}

export default function BlockchainConcepts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'live' | 'concepts' | 'architecture'>('live');
  const [recentBlocks, setRecentBlocks] = useState<BlockInfo[]>([]);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<ConceptMetrics>({
    totalTransactions: 0,
    totalGasUsed: '0',
    uniqueUsers: 0,
    contractInteractions: 0,
    averageGasPrice: '0',
    blockTime: 2,
  });
  const [liveEvent, setLiveEvent] = useState<string>('');
  const [selectedBlock, setSelectedBlock] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      // Fetch recent transactions from portfolio
      const portfolio = await portfolioAPI.getPortfolio();
      const txs = portfolio.data.recentTransactions || [];
      setRecentTxs(txs.slice(0, 10));

      // Calculate metrics from real transaction data
      const totalGas = txs.reduce((sum: number, tx: any) => sum + (parseInt(tx.gasUsed) || 0), 0);
      const avgGasPrice = txs.length > 0 ? txs.reduce((sum: number, tx: any) => sum + (parseInt(tx.gasPrice) || 0), 0) / txs.length : 0;

      setMetrics({
        totalTransactions: txs.length,
        totalGasUsed: totalGas.toLocaleString(),
        uniqueUsers: 1, // Will be calculated from actual user count
        contractInteractions: txs.filter((tx: any) => tx.to).length,
        averageGasPrice: avgGasPrice.toLocaleString(),
        blockTime: 2,
      });

      // Fetch blockchain data
      try {
        const web3Data = await axios.post('http://localhost:8545', {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1,
        });
        const blockNumber = parseInt(web3Data.data.result, 16);

        // Fetch recent blocks
        const blocks: BlockInfo[] = [];
        for (let i = 0; i < 5; i++) {
          const blockData = await axios.post('http://localhost:8545', {
            jsonrpc: '2.0',
            method: 'eth_getBlockByNumber',
            params: [`0x${(blockNumber - i).toString(16)}`, true],
            id: 1,
          });
          if (blockData.data.result) {
            blocks.push({
              number: parseInt(blockData.data.result.number, 16),
              hash: blockData.data.result.hash,
              transactions: blockData.data.result.transactions.length,
              gasUsed: parseInt(blockData.data.result.gasUsed, 16).toLocaleString(),
              timestamp: parseInt(blockData.data.result.timestamp, 16),
            });
          }
        }
        setRecentBlocks(blocks);
      } catch (err) {
        console.log('Blockchain data fetch error:', err);
      }
    } catch (error) {
      console.error('Failed to fetch live data:', error);
    }
  };

  const exploreBlock = async (block: BlockInfo) => {
    try {
      // Fetch full block details
      const blockData = await axios.post('http://localhost:8545', {
        jsonrpc: '2.0',
        method: 'eth_getBlockByHash',
        params: [block.hash, true],
        id: 1,
      });
      setSelectedBlock(blockData.data.result);
      setShowBlockModal(true);
    } catch (error) {
      console.error('Failed to fetch block details:', error);
    }
  };

  const exploreTx = (tx: any) => {
    setSelectedTx(tx);
    setShowTxModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const conceptsData = [
    {
      id: 'erc20',
      title: '🪙 ERC-20 Token Standard',
      description: 'Fractional equity tokens implementing fungible token standard',
      liveExample: `Your MRFf tokens are ERC-20 compliant`,
      implementation: 'FractionalEquityToken.sol',
      color: 'from-yellow-600 to-yellow-700',
    },
    {
      id: 'smartcontract',
      title: '📜 Smart Contracts',
      description: 'Self-executing contracts with buy/sell logic on Ethereum',
      liveExample: `${metrics.contractInteractions} contract interactions`,
      implementation: 'EquiChainMarket.sol',
      color: 'from-green-600 to-green-700',
    },
    {
      id: 'gas',
      title: '⛽ Gas Fees & Optimization',
      description: 'Transaction costs for blockchain operations',
      liveExample: `Total gas used: ${metrics.totalGasUsed}`,
      implementation: 'Optimized with batch operations',
      color: 'from-orange-600 to-orange-700',
    },
    {
      id: 'immutability',
      title: '🔒 Immutability',
      description: 'Once recorded, transactions cannot be altered',
      liveExample: `${metrics.totalTransactions} immutable records`,
      implementation: 'Blockchain hash chain',
      color: 'from-purple-600 to-purple-700',
    },
    {
      id: 'events',
      title: '📡 Event Logs',
      description: 'Blockchain events for tracking contract state changes',
      liveExample: 'FractionsPurchased, FractionsSold events',
      implementation: 'Solidity event emission',
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'web3',
      title: '🌐 Web3 Integration',
      description: 'Connecting frontend to blockchain via ethers.js',
      liveExample: 'Real-time price updates from chain',
      implementation: 'ethers.js + TypeScript',
      color: 'from-pink-600 to-pink-700',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">⛓️</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Blockchain Technologies
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/dashboard')} className="text-yellow-400 hover:text-yellow-300 font-semibold">
                Dashboard
              </button>
              <button onClick={() => navigate('/portfolio')} className="text-yellow-400 hover:text-yellow-300 font-semibold">
                Portfolio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4">
            {[
              { id: 'live', label: '🔴 Live Activity', icon: '📊' },
              { id: 'concepts', label: 'Blockchain Concepts', icon: '💡' },
              { id: 'architecture', label: 'System Architecture', icon: '🏗️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Live Activity Tab */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            {/* Live Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-green-900/20 to-black rounded-xl border border-green-600/30 p-6">
                <div className="text-xs text-gray-400 mb-2">TOTAL TRANSACTIONS</div>
                <div className="text-3xl font-bold text-green-400">{metrics.totalTransactions}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-900/20 to-black rounded-xl border border-orange-600/30 p-6">
                <div className="text-xs text-gray-400 mb-2">TOTAL GAS USED</div>
                <div className="text-3xl font-bold text-orange-400">{metrics.totalGasUsed}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-900/20 to-black rounded-xl border border-blue-600/30 p-6">
                <div className="text-xs text-gray-400 mb-2">CONTRACT CALLS</div>
                <div className="text-3xl font-bold text-blue-400">{metrics.contractInteractions}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-900/20 to-black rounded-xl border border-purple-600/30 p-6">
                <div className="text-xs text-gray-400 mb-2">BLOCK TIME</div>
                <div className="text-3xl font-bold text-purple-400">{metrics.blockTime}s</div>
              </div>
            </div>

            {/* Live Blockchain Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Blocks */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>📦</span> Recent Blocks
                  <span className="text-xs text-gray-400 font-normal">(Click to explore)</span>
                </h3>
                <div className="space-y-3">
                  {recentBlocks.map((block) => (
                    <button
                      key={block.number}
                      onClick={() => exploreBlock(block)}
                      className="w-full bg-black/50 rounded-lg p-4 border border-yellow-600/20 hover:border-yellow-600/60 hover:bg-yellow-600/5 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-bold text-yellow-400">Block #{block.number}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(block.timestamp * 1000).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-xs font-mono text-green-400 mb-2 truncate">
                        {block.hash}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">{block.transactions} txs</span>
                        <span className="text-gray-400">Gas: {block.gasUsed}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <span>📝</span> Recent Transactions
                  <span className="text-xs text-gray-400 font-normal">(Click to explore)</span>
                </h3>
                <div className="space-y-3">
                  {recentTxs.map((tx) => (
                    <button
                      key={tx.id}
                      onClick={() => exploreTx(tx)}
                      className="w-full bg-black/50 rounded-lg p-4 border border-yellow-600/20 hover:border-yellow-600/60 hover:bg-yellow-600/5 transition-all text-left"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          tx.type === 'BUY' 
                            ? 'bg-green-600/20 text-green-400 border border-green-600/50' 
                            : 'bg-red-600/20 text-red-400 border border-red-600/50'
                        }`}>
                          {tx.type}
                        </span>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-white mb-1">
                        {Number(tx.quantity).toFixed(8)} {tx.symbol}
                      </div>
                      <div className="text-xs font-mono text-green-400 truncate mb-2">
                        {tx.txHash}
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Block: {tx.blockNumber}</span>
                        <span className="text-gray-400">Gas: {tx.gasUsed}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Concepts Tab */}
        {activeTab === 'concepts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conceptsData.map((concept) => (
              <div
                key={concept.id}
                className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6 hover:border-yellow-600/60 transition-all"
              >
                <h3 className="text-xl font-bold mb-3">{concept.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{concept.description}</p>
                
                <div className={`bg-gradient-to-r ${concept.color} bg-opacity-20 rounded-lg p-4 mb-4`}>
                  <div className="text-xs text-gray-300 mb-1">LIVE EXAMPLE</div>
                  <div className="font-bold text-white">{concept.liveExample}</div>
                </div>

                <div className="bg-black/50 rounded-lg p-3 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">IMPLEMENTATION</div>
                  <div className="text-sm font-mono text-green-400">{concept.implementation}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            {/* Technology Stack */}
            <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-yellow-600/30 p-6">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Technology Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Blockchain Layer */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-green-400 flex items-center gap-2">
                    <span>⛓️</span> Blockchain Layer
                  </h4>
                  {[
                    'Hardhat (Local Ethereum)',
                    'Solidity ^0.8.28',
                    'ethers.js v6',
                    'ERC-20 Standard',
                    'Smart Contracts',
                  ].map((tech) => (
                    <div key={tech} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <span className="text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>

                {/* Backend Layer */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                    <span>🔧</span> Backend Layer
                  </h4>
                  {[
                    'Node.js + TypeScript',
                    'Express.js API',
                    'TypeORM + SQLite',
                    'Yahoo Finance API',
                    'JWT Authentication',
                  ].map((tech) => (
                    <div key={tech} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <span className="text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>

                {/* Frontend Layer */}
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                    <span>🎨</span> Frontend Layer
                  </h4>
                  {[
                    'React + TypeScript',
                    'Vite Build Tool',
                    'TailwindCSS',
                    'React Router',
                    'Axios API Client',
                  ].map((tech) => (
                    <div key={tech} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      <span className="text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Smart Contracts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-green-600/30 p-6">
                <h4 className="text-xl font-bold text-green-400 mb-4">FractionalEquityToken.sol</h4>
                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">PURPOSE</div>
                    <div className="text-sm text-white">ERC-20 compliant fractional stock tokens</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">KEY FUNCTIONS</div>
                    <div className="text-sm font-mono text-green-400">
                      mint(), burn(), transfer()
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">ADDRESS</div>
                    <div className="text-xs font-mono text-yellow-400 break-all">
                      0x5FbDB2315678afecb367f032d93F642f64180aa3
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-blue-600/30 p-6">
                <h4 className="text-xl font-bold text-blue-400 mb-4">EquiChainMarket.sol</h4>
                <div className="space-y-3">
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">PURPOSE</div>
                    <div className="text-sm text-white">Market operations & price management</div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">KEY FUNCTIONS</div>
                    <div className="text-sm font-mono text-blue-400">
                      buyFractions(), sellFractions()
                    </div>
                  </div>
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400">ADDRESS</div>
                    <div className="text-xs font-mono text-yellow-400 break-all">
                      0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Block Explorer Modal */}
      {showBlockModal && selectedBlock && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowBlockModal(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-yellow-600/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Block Explorer</h2>
                  <p className="text-sm text-gray-400 mt-1">Deep dive into blockchain block structure</p>
                </div>
                <button onClick={() => setShowBlockModal(false)} className="text-gray-400 hover:text-white text-3xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Block Header */}
              <div className="bg-gradient-to-r from-yellow-600/10 to-yellow-700/10 border border-yellow-600/30 rounded-xl p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">📦 Block #{parseInt(selectedBlock.number, 16)}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">TIMESTAMP</div>
                    <div className="text-sm text-white">{new Date(parseInt(selectedBlock.timestamp, 16) * 1000).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">TRANSACTIONS</div>
                    <div className="text-sm text-white">{selectedBlock.transactions.length}</div>
                  </div>
                </div>
              </div>

              {/* Blockchain Concepts Demonstrated */}
              <div className="bg-black/50 rounded-xl border border-green-600/30 p-6">
                <h3 className="text-lg font-bold text-green-400 mb-4">🔬 Blockchain Concepts Demonstrated</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔗</div>
                    <div>
                      <div className="font-bold text-white">Hash Chain (Merkle Tree)</div>
                      <div className="text-sm text-gray-400">This block links to previous via parentHash</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⛏️</div>
                    <div>
                      <div className="font-bold text-white">Proof of Work (Mining)</div>
                      <div className="text-sm text-gray-400">Nonce: {selectedBlock.nonce} | Difficulty: {parseInt(selectedBlock.difficulty, 16).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔒</div>
                    <div>
                      <div className="font-bold text-white">Immutability</div>
                      <div className="text-sm text-gray-400">Changing any data would invalidate the hash</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-400">BLOCK HASH</div>
                    <button onClick={() => copyToClipboard(selectedBlock.hash)} className="text-yellow-400 text-xs">📋</button>
                  </div>
                  <div className="text-xs font-mono text-green-400 break-all">{selectedBlock.hash}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-400">PARENT HASH</div>
                    <button onClick={() => copyToClipboard(selectedBlock.parentHash)} className="text-yellow-400 text-xs">📋</button>
                  </div>
                  <div className="text-xs font-mono text-blue-400 break-all">{selectedBlock.parentHash}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">MINER</div>
                  <div className="text-xs font-mono text-purple-400 break-all">{selectedBlock.miner}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">GAS USED / LIMIT</div>
                  <div className="text-sm text-white">{parseInt(selectedBlock.gasUsed, 16).toLocaleString()} / {parseInt(selectedBlock.gasLimit, 16).toLocaleString()}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">STATE ROOT</div>
                  <div className="text-xs font-mono text-orange-400 break-all">{selectedBlock.stateRoot}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">TRANSACTIONS ROOT</div>
                  <div className="text-xs font-mono text-pink-400 break-all">{selectedBlock.transactionsRoot}</div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-yellow-600/30">
                <button onClick={() => setShowBlockModal(false)} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-8 py-3 rounded-xl">
                  Close Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Explorer Modal */}
      {showTxModal && selectedTx && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowTxModal(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-yellow-600/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-yellow-600/30 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-400">Transaction Explorer</h2>
                  <p className="text-sm text-gray-400 mt-1">Examining smart contract interaction</p>
                </div>
                <button onClick={() => setShowTxModal(false)} className="text-gray-400 hover:text-white text-3xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Transaction Type */}
              <div className="flex items-center gap-4">
                <span className={`px-6 py-3 rounded-xl text-lg font-bold ${
                  selectedTx.type === 'BUY' 
                    ? 'bg-green-600/20 text-green-400 border-2 border-green-600/50' 
                    : 'bg-red-600/20 text-red-400 border-2 border-red-600/50'
                }`}>
                  {selectedTx.type}
                </span>
                <div>
                  <div className="text-xl font-bold text-white">{Number(selectedTx.quantity).toFixed(8)} {selectedTx.symbol}</div>
                  <div className="text-sm text-gray-400">{new Date(selectedTx.createdAt).toLocaleString()}</div>
                </div>
              </div>

              {/* Smart Contract Concepts */}
              <div className="bg-black/50 rounded-xl border border-blue-600/30 p-6">
                <h3 className="text-lg font-bold text-blue-400 mb-4">📜 Smart Contract Concepts</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📡</div>
                    <div>
                      <div className="font-bold text-white">Event Emission</div>
                      <div className="text-sm text-gray-400">
                        {selectedTx.type === 'BUY' ? 'FractionsPurchased' : 'FractionsSold'} event logged on-chain
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🪙</div>
                    <div>
                      <div className="font-bold text-white">ERC-20 Token Operations</div>
                      <div className="text-sm text-gray-400">
                        {selectedTx.type === 'BUY' ? 'mint()' : 'burn()'} function called
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⛽</div>
                    <div>
                      <div className="font-bold text-white">Gas Optimization</div>
                      <div className="text-sm text-gray-400">Gas used: {selectedTx.gasUsed} (~{(parseInt(selectedTx.gasUsed) * 0.00000001).toFixed(6)} ETH)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-400">TRANSACTION HASH</div>
                    <button onClick={() => copyToClipboard(selectedTx.txHash)} className="text-yellow-400 text-xs">📋</button>
                  </div>
                  <div className="text-xs font-mono text-green-400 break-all">{selectedTx.txHash}</div>
                </div>

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">BLOCK NUMBER</div>
                  <div className="text-lg font-bold text-white">{selectedTx.blockNumber}</div>
                </div>

                {selectedTx.from && (
                  <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                    <div className="text-xs text-gray-400 mb-2">FROM (CUSTODIAN)</div>
                    <div className="text-xs font-mono text-blue-400 break-all">{selectedTx.from}</div>
                  </div>
                )}

                {selectedTx.to && (
                  <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                    <div className="text-xs text-gray-400 mb-2">TO (MARKET CONTRACT)</div>
                    <div className="text-xs font-mono text-purple-400 break-all">{selectedTx.to}</div>
                  </div>
                )}

                <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                  <div className="text-xs text-gray-400 mb-2">GAS USED</div>
                  <div className="text-lg font-bold text-orange-400">{selectedTx.gasUsed}</div>
                </div>

                {selectedTx.gasPrice && (
                  <div className="bg-black/50 rounded-xl border border-yellow-600/30 p-4">
                    <div className="text-xs text-gray-400 mb-2">GAS PRICE (Wei)</div>
                    <div className="text-xs font-mono text-orange-400 break-all">{selectedTx.gasPrice}</div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-yellow-600/30">
                <button onClick={() => setShowTxModal(false)} className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold px-8 py-3 rounded-xl">
                  Close Explorer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
