# SimuAI Platform - Quick Start Guide

**Last Updated:** April 19, 2026  
**Status:** ✅ Ready to Run

---

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ running
- npm or yarn package manager
- Git installed

---

## Installation & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd simuai
```

### 2. Backend Setup

```bash
cd server
npm install
```

### 3. Environment Configuration

Create `.env` file in server folder:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/simuai"

# JWT
JWT_SECRET="your-secret-key-here"
JWT_EXPIRE="7d"
REFRESH_TOKEN_SECRET="your-refresh-secret-here"
REFRESH_TOKEN_EXPIRE="30d"

# Cloudinary
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# URLs
CLIENT_URL="http://localhost:3000"
SERVER_URL="http://localhost:5000"

# Environment
NODE_ENV="development"
PORT=5000
```

### 4. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed
```

### 5. Start Backend

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
📊 Database status: ✅ Connected
🌐 API available at http://localhost:5000
```

### 6. Frontend Setup

```bash
cd ../client
npm install
```

### 7. Frontend Environment

Create `.env` file in client folder:
```env
REACT_APP_API_URL="http://localhost:5000/api"
```

### 8. Start Frontend

```bash
npm start
```

Expected output:
```
Compiled successfully!

You can now view simuai in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

---

## Accessing the Application

### Home Page
- **URL:** http://localhost:3000
- **Access:** Public (no login required)

### Login Page
- **URL:** http://localhost:3000/login
- **Access:** Public (no login required)

### Candidate Dashboard
- **URL:** http://localhost:3000/candidate/dashboard
- **Access:** Requires login as candidate
- **Test Email:** candidate@example.com
- **Test Password:** Test@123456

### Employer Dashboard
- **URL:** http://localhost:3000/employer/dashboard
- **Access:** Requires login as employer
- **Test Email:** employer@example.com
- **Test Password:** Test@123456

### Admin Dashboard
- **URL:** http://localhost:3000/admin/dashboard
- **Access:** Requires login as admin
- **Test Email:** admin@example.com
- **Test Password:** Test@123456

---

## Testing Login Flow

### Step 1: Navigate to Login
1. Open http://localhost:3000
2. Click "Sign In" button
3. You should see the login form

### Step 2: Enter Credentials
1. Email: `candidate@example.com`
2. Password: `Test@123456`
3. Click "Sign In"

### Step 3: Verify Login
1. You should be redirected to `/candidate/dashboard`
2. Dashboard should load without errors
3. User profile should display in navbar

### Step 4: Test Protected Routes
1. Try accessing `/candidate/profile`
2. Try accessing `/candidate/applications`
3. All should load without redirect loops

### Step 5: Test Logout
1. Click user menu in navbar
2. Click "Logout"
3. You should be redirected to login page
4. localStorage should be cleared

---

## Troubleshooting

### Backend Won't Start

**Error:** `Can't reach database server at localhost:5432`

**Solution:**
```bash
# Start PostgreSQL
# On Windows:
net start postgresql-x64-15

# On Mac:
brew services start postgresql

# On Linux:
sudo systemctl start postgresql
```

**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Frontend Won't Start

**Error:** `Port 3000 already in use`

**Solution:**
```bash
# Use different port
PORT=3001 npm start
```

**Error:** `Module not found`

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Login Not Working

**Error:** `Invalid email or password`

**Solution:**
1. Verify database is running
2. Check if user exists in database
3. Verify credentials are correct
4. Check backend logs for errors

**Error:** `Cannot POST /api/auth/login`

**Solution:**
1. Verify backend is running on port 5000
2. Check API URL in frontend .env
3. Verify CORS is enabled
4. Check network tab in DevTools

### Token Issues

**Error:** `No token found in localStorage`

**Solution:**
1. Clear browser cache
2. Clear localStorage: `localStorage.clear()`
3. Try logging in again

**Error:** `Token expired`

**Solution:**
1. Logout and login again
2. Token will be refreshed automatically
3. If issue persists, clear localStorage

---

## Development Commands

### Backend
```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# View database
npx prisma studio
```

### Frontend
```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Run linter
npm run lint

# Format code
npm run format
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh token
- `GET /api/auth/verify-token` - Verify token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `POST /api/users/avatar` - Upload avatar
- `DELETE /api/users/account` - Delete account

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer)
- `PUT /api/jobs/:id` - Update job (employer)
- `DELETE /api/jobs/:id` - Delete job (employer)

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Apply for job
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Cancel application

### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Schedule interview
- `PUT /api/interviews/:id` - Update interview
- `DELETE /api/interviews/:id` - Cancel interview

---

## Performance Tips

### Frontend
1. Use Chrome DevTools to check performance
2. Check Network tab for slow requests
3. Use Lighthouse for performance audit
4. Clear cache if pages load slowly

### Backend
1. Monitor database queries
2. Check server logs for errors
3. Use `npx prisma studio` to view database
4. Monitor memory usage

---

## Security Checklist

- [x] Change JWT_SECRET in production
- [x] Change REFRESH_TOKEN_SECRET in production
- [x] Use HTTPS in production
- [x] Set secure CORS origins
- [x] Enable rate limiting
- [x] Use environment variables
- [x] Validate all inputs
- [x] Hash passwords with bcrypt

---

## Deployment

### Frontend Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Backend Deployment (Heroku)
```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create simuai-api

# Deploy
git push heroku main
```

---

## Support

### Documentation
- See `FUNCTIONALITY_VERIFICATION.md` for complete feature list
- See `INFINITE_LOOP_KILL_FIX.md` for authentication details
- See `AUTHGUARD_REFACTOR_FIX.md` for auth flow details

### Logs
- Backend logs: `server/logs/combined.log`
- Error logs: `server/logs/error.log`
- Browser console: DevTools → Console

### Contact
- For issues, check GitHub issues
- For questions, see documentation
- For bugs, create detailed issue report

---

## Next Steps

1. ✅ Start backend: `npm run dev` (in server)
2. ✅ Start frontend: `npm start` (in client)
3. ✅ Open http://localhost:3000
4. ✅ Login with test credentials
5. ✅ Explore all features
6. ✅ Report any issues

---

**Happy coding! 🚀**
