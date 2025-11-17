import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initializeDatabase } from './config/db';
import { initializeBlockchain } from './config/blockchain';
// Railway: Contracts redeployed 2025-11-17

// Routes
import authRoutes from './routes/auth';
import marketRoutes from './routes/market';
import portfolioRoutes from './routes/portfolio';

async function startServer() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 EquiChain Backend Server');
  console.log('='.repeat(60) + '\n');

  // Log environment for debugging
  console.log('📊 Environment Configuration:');
  console.log(`   NODE_ENV: ${config.nodeEnv}`);
  console.log(`   PORT: ${config.port}`);
  console.log(`   DATABASE_URL: ${config.database.url.substring(0, 20)}...`);
  console.log(`   RPC_URL: ${config.blockchain.rpcUrl}`);
  console.log('');

  try {
    // Initialize database
    console.log('🗄️  Initializing database...');
    await initializeDatabase();

        // Initialize blockchain connection (REQUIRED - block until ready)
    console.log('🔗 Initializing blockchain...');
    
    let blockchainReady = false;
    let attempts = 0;
    const maxAttempts = 120; // 2 minutes total
    
    while (!blockchainReady && attempts < maxAttempts) {
      try {
        await initializeBlockchain();
        blockchainReady = true;
        console.log('✅ Blockchain initialized successfully\n');
      } catch (err: any) {
        attempts++;
        const waitTime = 1000; // 1 second between attempts
        const progress = Math.round((attempts / maxAttempts) * 100);
        
        if (attempts % 10 === 0) {
          console.warn(`⏳ Waiting for blockchain... ${progress}% (${attempts}/${maxAttempts})`);
        }
        
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error('❌ FATAL: Blockchain initialization failed after 2 minutes');
          console.error('Please ensure:');
          console.error('  1. Blockchain service is running');
          console.error('  2. Contracts are deployed');
          console.error('  3. RPC URL is correct:', config.blockchain.rpcUrl);
          process.exit(1);
        }
      }
    }
    
    // Create Express app
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });

    // Health check
    app.get('/', (req, res) => {
      res.json({
        service: 'EquiChain Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          auth: '/auth',
          market: '/market',
          portfolio: '/portfolio',
        },
      });
    });

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API Routes
    app.use('/auth', authRoutes);
    app.use('/market', marketRoutes);
    app.use('/portfolio', portfolioRoutes);

    // Error handling middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log('='.repeat(60));
      console.log('\n📚 Available endpoints:');
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   GET  http://localhost:${PORT}/health`);
      console.log(`   POST http://localhost:${PORT}/auth/register`);
      console.log(`   POST http://localhost:${PORT}/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/market/price`);
      console.log(`   POST http://localhost:${PORT}/market/buy`);
      console.log(`   POST http://localhost:${PORT}/market/sell`);
      console.log(`   GET  http://localhost:${PORT}/portfolio`);
      console.log('='.repeat(60) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
