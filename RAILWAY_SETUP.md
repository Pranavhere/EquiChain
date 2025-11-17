# 🚂 Railway Deployment Setup Guide

This guide shows exactly how to configure your EquiChain deployment on Railway.

## 📋 Prerequisites

- Railway account connected to GitHub
- Your EquiChain repository pushed to GitHub

---

## 🎯 Step-by-Step Railway Setup

### Step 1: Create New Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"Deploy from GitHub repo"**
3. Select your **EquiChain** repository
4. Railway will create a new project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. Note: The `DATABASE_URL` variable is automatically created

### Step 3: Deploy Backend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your **EquiChain** repository again
3. Railway will detect it as a new service

#### Configure Backend Service:

1. Click on the service → **"Settings"**
2. **Root Directory**: Set to `backend`
3. **Custom Start Command**: Leave as default (uses Dockerfile)

#### Add Environment Variables:

Click **"Variables"** tab and add:

```bash
# Required Variables
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
PORT=8000
NODE_ENV=production

# Blockchain - Will add after deploying blockchain service
RPC_URL=http://blockchain.railway.internal:8545

# Contract addresses - Will add after deployment
MARKET_CONTRACT_ADDRESS=<will-be-filled-later>
TOKEN_CONTRACT_ADDRESS=<will-be-filled-later>
```

**Important:** 
- Replace `JWT_SECRET` with a random string (at least 32 characters)
- `${{Postgres.DATABASE_URL}}` automatically references your PostgreSQL database

4. Click **"Deploy"** - Backend will start deploying

### Step 4: Deploy Blockchain Service (Hardhat Node)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select **EquiChain** repository
3. Click on the new service → **"Settings"**
4. **Root Directory**: Set to `contracts`
5. **Custom Start Command**: `npx hardhat node --hostname 0.0.0.0`

#### Add Environment Variables:

```bash
PORT=8545
```

6. Click **"Deploy"**

**Note:** The blockchain service will be available at `blockchain.railway.internal:8545` from other services.

### Step 5: Deploy Smart Contracts

Once the blockchain service is running:

1. Click on **Blockchain service** → **"Deployments"** → Latest deployment
2. Click **"View Logs"** - you should see Hardhat node running
3. Open a **new terminal** tab in the deployment
4. Run:
   ```bash
   npx hardhat run scripts/deploy.ts --network localhost
   ```
5. **Copy the deployed contract addresses** from the output

#### Update Backend Environment Variables:

1. Go to **Backend service** → **"Variables"**
2. Add the contract addresses you just copied:
   ```bash
   MARKET_CONTRACT_ADDRESS=0x... (from deployment output)
   TOKEN_CONTRACT_ADDRESS=0x... (from deployment output)
   ```
3. Backend will automatically redeploy

### Step 6: Deploy Frontend Service

1. Click **"+ New"** → **"GitHub Repo"**
2. Select **EquiChain** repository
3. Click on the service → **"Settings"**
4. **Root Directory**: Set to `frontend`

#### Add Environment Variables:

```bash
# Backend API URL - use backend's Railway domain
VITE_API_URL=https://<your-backend-service>.up.railway.app
```

**To get your backend URL:**
1. Go to **Backend service** → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** if not already generated
3. Copy the domain (e.g., `backend-production-abc123.up.railway.app`)
4. Add `https://` prefix to the domain

#### Generate Frontend Domain:

1. In **Frontend service** → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Your app will be live at this URL!

---

## ✅ Verification Checklist

After all services are deployed, verify:

### Check Database:
- [ ] PostgreSQL service shows **"Active"**
- [ ] `DATABASE_URL` variable exists

### Check Blockchain:
- [ ] Blockchain service shows **"Active"**
- [ ] Logs show: `Started HTTP and WebSocket JSON-RPC server at http://0.0.0.0:8545`

### Check Backend:
- [ ] Backend service shows **"Active"**
- [ ] Visit `https://<backend-url>/health` - should return `{"status":"ok"}`
- [ ] Logs show: `✅ Database connection established`
- [ ] Logs show: `✅ Blockchain connected`
- [ ] Has all environment variables set

### Check Frontend:
- [ ] Frontend service shows **"Active"**
- [ ] Visit your frontend URL
- [ ] Can see login page
- [ ] No console errors about API connection

---

## 🔧 Environment Variables Reference

### Backend Service Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-linked to PostgreSQL |
| `JWT_SECRET` | `<random-32-char-string>` | For JWT token signing |
| `PORT` | `8000` | Backend server port |
| `NODE_ENV` | `production` | Environment mode |
| `RPC_URL` | `http://blockchain.railway.internal:8545` | Blockchain connection |
| `MARKET_CONTRACT_ADDRESS` | `0x...` | From contract deployment |
| `TOKEN_CONTRACT_ADDRESS` | `0x...` | From contract deployment |

### Blockchain Service Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `8545` | Hardhat node port |

### Frontend Service Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://<backend-domain>` | Backend API URL |

---

## 🐛 Troubleshooting

### Backend Health Check Failing

**Symptoms:** Backend shows "Healthcheck Failed"

**Solutions:**
1. Check `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`
2. Verify PostgreSQL service is running
3. Check logs for connection errors
4. Ensure all required environment variables are set

### Frontend Can't Connect to Backend

**Symptoms:** Login doesn't work, console shows CORS errors

**Solutions:**
1. Verify `VITE_API_URL` has correct backend domain
2. Ensure backend domain has `https://` prefix
3. Check backend CORS settings allow frontend domain
4. Redeploy frontend after changing `VITE_API_URL`

### Blockchain Service Not Running

**Symptoms:** Backend logs show "Blockchain connection failed"

**Solutions:**
1. Check blockchain service is active
2. Verify `RPC_URL` uses `railway.internal` domain
3. Check blockchain service logs for errors
4. Restart blockchain service if needed

### Database Connection Failed

**Symptoms:** Backend logs show "Database connection failed"

**Solutions:**
1. Ensure PostgreSQL service is active
2. Check `DATABASE_URL` format is correct
3. Verify database credentials
4. Check PostgreSQL logs

---

## 📊 Service Dependencies

Your services should start in this order:

1. **PostgreSQL Database** ← Must be running first
2. **Blockchain Service** ← Needs to be active
3. **Backend** ← Depends on database + blockchain
4. **Frontend** ← Depends on backend API

Railway handles this automatically with service linking.

---

## 🔐 Security Best Practices

1. ✅ Change `JWT_SECRET` to a strong random value
2. ✅ Never commit `.env` files to Git
3. ✅ Use Railway's environment variable references (`${{Postgres.DATABASE_URL}}`)
4. ✅ Enable HTTPS for all public domains (Railway does this automatically)
5. ✅ Set `NODE_ENV=production` for backend

---

## 💰 Cost & Limits (Free Tier)

Railway Free Tier includes:
- **$5 free credit/month**
- **500 hours of usage** (enough for 1-2 projects)
- **1 GB RAM** per service
- **1 GB storage** for database
- **100 GB bandwidth/month**

Your EquiChain project uses:
- 4 services (Postgres, Blockchain, Backend, Frontend)
- Approximately **$4-5/month** with free tier

---

## 🎓 Demo for Professor

Once deployed, share your **Frontend URL** (something like `https://equichain-production.up.railway.app`)

Features to demonstrate:
1. ✅ **Login/Register** - User authentication
2. ✅ **Dashboard** - Live stock prices from Yahoo Finance
3. ✅ **Buy/Sell** - Fractional equity trading
4. ✅ **Portfolio** - Real-time P&L tracking
5. ✅ **🔬 Tech Stack Button** - Interactive blockchain explorer:
   - Live blockchain metrics
   - Recent blocks and transactions
   - Clickable block hashes → Full block explorer
   - Transaction details with gas metrics
   - Real-time updates every 5 seconds

---

## 🆘 Getting Help

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **Your Logs**: Click any service → "Deployments" → "View Logs"

---

**Deployment Time:** ~20-30 minutes for first setup  
**Monthly Cost:** $0 (within free tier)  
**Uptime:** 24/7 (no sleep on Railway)  
**SSL:** ✅ Automatic HTTPS
