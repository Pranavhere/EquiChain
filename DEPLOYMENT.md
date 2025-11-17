# 🚀 EquiChain Deployment Guide

This guide will help you deploy EquiChain to the cloud for free.

## 📋 Prerequisites

- GitHub account with EquiChain repository
- Railway.app account (free tier) OR Render.com account (free tier)

---

## Option 1: Deploy on Railway.app (Recommended)

Railway offers the simplest deployment with automatic PostgreSQL database provisioning.

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your repositories

### Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `EquiChain` repository
4. Railway will automatically detect the Docker setup

### Step 3: Add Services

You need to deploy 4 services:

#### A. PostgreSQL Database
1. Click "+ New" → "Database" → "Add PostgreSQL"
2. Railway automatically provisions a database
3. Note: Database credentials are auto-generated

#### B. Blockchain Service (Hardhat Node)
1. Click "+ New" → "GitHub Repo" → Select EquiChain
2. Go to Settings → Change "Root Directory" to `contracts`
3. Add Environment Variables:
   - Click "Variables" tab
   - No variables needed for local hardhat node

#### C. Backend Service
1. Click "+ New" → "GitHub Repo" → Select EquiChain  
2. Go to Settings → Change "Root Directory" to `backend`
3. Add Environment Variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   BLOCKCHAIN_RPC_URL=${{blockchain-service.RAILWAY_PRIVATE_DOMAIN}}:8545
   JWT_SECRET=your-super-secret-jwt-key-change-this
   PORT=8000
   NODE_ENV=production
   ```
4. Click "Settings" → "Networking" → "Generate Domain" (for public access)

#### D. Frontend Service
1. Click "+ New" → "GitHub Repo" → Select EquiChain
2. Go to Settings → Change "Root Directory" to `frontend`
3. Add Environment Variables:
   ```
   VITE_API_URL=${{backend-service.RAILWAY_PUBLIC_DOMAIN}}
   ```
4. Click "Settings" → "Networking" → "Generate Domain"

### Step 4: Deploy Contracts

After blockchain service is running:

1. Open Railway CLI or use the web terminal
2. Connect to blockchain service
3. Run deployment:
   ```bash
   cd contracts
   npm run deploy:production
   ```
4. Copy the deployed contract addresses

### Step 5: Update Backend with Contract Addresses

1. Go to Backend service → Variables
2. Add:
   ```
   MARKET_CONTRACT_ADDRESS=<deployed-market-address>
   TOKEN_FACTORY_ADDRESS=<deployed-token-factory-address>
   ```

### Step 6: Access Your App

1. Go to Frontend service
2. Click on the generated domain (e.g., `equichain-production.up.railway.app`)
3. Your app is live! 🎉

---

## Option 2: Deploy on Render.com

Render offers similar free tier hosting with automatic deployments.

### Step 1: Sign Up for Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access repositories

### Step 2: Create Blueprint

1. Click "New" → "Blueprint"
2. Select your `EquiChain` repository
3. Render will detect `render.yaml` and create all services automatically

### Step 3: Configure Environment Variables

Render auto-generates most variables, but you need to add:

**Backend Service:**
- `JWT_SECRET`: Generate a random secret key

**Frontend Service:**
- Auto-configured from render.yaml

### Step 4: Deploy Contracts

1. Wait for blockchain service to be running
2. Use Render's shell:
   ```bash
   cd contracts
   npx hardhat run scripts/deploy.ts --network production
   ```

### Step 5: Update Contract Addresses

Add to backend environment variables in Render dashboard:
- `MARKET_CONTRACT_ADDRESS`
- `TOKEN_FACTORY_ADDRESS`

### Step 6: Access Your App

Click on the frontend service URL (e.g., `equichain.onrender.com`)

---

## Option 3: Deploy on Vercel + Supabase (Frontend Only)

If you want to deploy just the frontend for demonstration:

### Step 1: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>
   ```

### Step 2: Deploy Backend on Railway

Follow Railway steps above for backend only

---

## 🔧 Post-Deployment Configuration

### Update CORS Settings

In `backend/src/index.ts`, update CORS to allow your frontend domain:

```typescript
app.use(cors({
  origin: ['https://your-frontend-domain.com', 'http://localhost:5173'],
  credentials: true
}));
```

### Enable HTTPS

Both Railway and Render automatically provide SSL certificates.

### Monitor Logs

- **Railway**: Click on service → "Deployments" → View logs
- **Render**: Click on service → "Logs"

### Database Migrations

Run migrations on first deployment:
```bash
# Railway/Render shell
cd backend
npm run typeorm migration:run
```

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository is public or connected to Railway/Render
- [ ] PostgreSQL database created
- [ ] Blockchain service deployed and running
- [ ] Smart contracts deployed to blockchain
- [ ] Backend service configured with contract addresses
- [ ] Frontend service configured with backend URL
- [ ] CORS enabled for frontend domain
- [ ] Test login and trading functionality
- [ ] Blockchain explorer tab working

---

## 💰 Cost Breakdown

### Railway Free Tier
- ✅ 500 hours/month (enough for 1 project)
- ✅ $5 free credit/month
- ✅ Automatic SSL
- ✅ PostgreSQL included

### Render Free Tier
- ✅ 750 hours/month per service
- ✅ Automatic SSL
- ✅ PostgreSQL (90 days free, then $7/month)
- ⚠️ Services sleep after 15 min inactivity

### Recommended: Railway
Better for blockchain projects due to always-on services.

---

## 🐛 Troubleshooting

### Service won't start
- Check logs for errors
- Verify environment variables are set
- Ensure all services are running

### Database connection failed
- Check `DATABASE_URL` format
- Verify PostgreSQL service is running
- Check network connectivity between services

### Blockchain RPC connection failed
- Ensure blockchain service is deployed
- Check `BLOCKCHAIN_RPC_URL` uses internal domain
- Verify port 8545 is accessible

### Frontend can't reach backend
- Check `VITE_API_URL` points to backend public domain
- Verify CORS settings in backend
- Check backend is deployed and running

### Contracts not deployed
- SSH into blockchain service
- Run deployment script manually
- Copy addresses and update backend env vars

---

## 🎓 For Professor Demonstration

Your deployed app showcases:

1. ✅ **Live Trading Platform** - Real stock prices from Yahoo Finance
2. ✅ **Blockchain Integration** - Ethereum smart contracts (ERC-20 tokens)
3. ✅ **Interactive Tech Showcase** - Click "🔬 Tech Stack" to see:
   - Live blockchain metrics
   - Recent blocks and transactions
   - Clickable block explorer
   - Transaction details with gas metrics
   - Real-time updates every 5 seconds
4. ✅ **Full Stack Architecture** - React + TypeScript + Node.js + PostgreSQL + Solidity
5. ✅ **Docker Deployment** - Production-ready containerized services

**Demo URL**: Share your Railway/Render frontend domain with your professor!

---

## 📞 Support

If you encounter issues:
- Railway: [railway.app/help](https://railway.app/help)
- Render: [render.com/docs](https://render.com/docs)
- EquiChain Issues: [GitHub Issues](https://github.com/Pranavhere/EquiChain/issues)

---

**Deployment Time**: ~15 minutes  
**Monthly Cost**: $0 (free tier)  
**SSL**: ✅ Automatic  
**Auto-deploy on push**: ✅ Yes
