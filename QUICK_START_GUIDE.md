# Quick Start Guide ✅

## Prerequisites
- Node.js v14+ installed
- PostgreSQL running
- Git (optional)

---

## Step 1: Start PostgreSQL Database

### Windows (PowerShell as Administrator)
```powershell
Start-Service -Name "postgresql-x64-15"
```

### macOS
```bash
brew services start postgresql
```

### Linux
```bash
sudo systemctl start postgresql
```

---

## Step 2: Start Backend Server

```bash
cd server
npm install  # Only needed first time
npm run dev
```

Expected output:
```
[nodemon] 3.1.11
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node index.js`
✅ Database connection established successfully
Server running on port 5000
```

---

## Step 3: Start Frontend Client

Open a new terminal:

```bash
cd client
npm install  # Only needed first time
npm run dev
```

Expected output:
```
Compiled successfully!

You can now view simuai-client in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## Step 4: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## Features Working

✅ User authentication (login/register)
✅ Dashboard (candidate/employer/admin)
✅ Job posting and applications
✅ Interview scheduling
✅ File uploads (avatars, logos)
✅ Help center with fallback data
✅ Real-time notifications
✅ Payment processing (test mode)

---

## Troubleshooting

### Backend won't start

**Error:** `Cannot find module`
```bash
cd server
rm -r node_modules package-lock.json
npm install
npm run dev
```

**Error:** `Database connection failed`
- Ensure PostgreSQL is running
- Check DATABASE_URL in `server/.env`
- Run migrations: `npx prisma migrate dev`

### Frontend won't start

**Error:** `Module not found`
```bash
cd client
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Network errors in browser console

**Error:** `net::ERR_CONNECTION_REFUSED`
- Backend server is not running
- Start backend with: `cd server && npm run dev`
- Wait 5 seconds for it to fully start

**Error:** `404 Not Found`
- API endpoint doesn't exist
- Check server routes in `server/routes/`
- Verify endpoint URL in frontend service

### Help Center showing fallback data

This is normal when backend is offline. The app gracefully falls back to local data.

---

## Development Workflow

### Making Changes

1. **Backend changes:**
   - Edit files in `server/`
   - Server auto-reloads with nodemon
   - No need to restart

2. **Frontend changes:**
   - Edit files in `client/src/`
   - Browser auto-refreshes
   - No need to restart

### Testing

**Backend:**
```bash
cd server
npm test  # If test suite exists
```

**Frontend:**
```bash
cd client
npm test  # If test suite exists
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/simuai_db
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
GROQ_API_KEY=your-api-key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Common Commands

### Backend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Check code quality
npm run test     # Run tests
```

---

## Database

### Run Migrations
```bash
cd server
npx prisma migrate dev
```

### View Database
```bash
cd server
npx prisma studio
```

### Reset Database
```bash
cd server
npx prisma migrate reset
```

---

## Stopping Services

### Stop Backend
Press `Ctrl+C` in the backend terminal

### Stop Frontend
Press `Ctrl+C` in the frontend terminal

### Stop PostgreSQL

**Windows:**
```powershell
Stop-Service -Name "postgresql-x64-15"
```

**macOS:**
```bash
brew services stop postgresql
```

**Linux:**
```bash
sudo systemctl stop postgresql
```

---

## Production Deployment

### Build Backend
```bash
cd server
npm run build
npm start
```

### Build Frontend
```bash
cd client
npm run build
# Deploy the 'build' folder to your hosting
```

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check server logs in terminal
4. Check database connection

---

**Status:** ✅ Ready to develop!
