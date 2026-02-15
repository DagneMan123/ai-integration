# 🚀 Start Server Guide

## ✅ Issues Fixed

1. ✅ Removed `express-mongo-sanitize` (MongoDB-specific, not needed for PostgreSQL)
2. ✅ Fixed `connectDB` → `testConnection` import
3. ✅ Fixed logger import to use destructuring

## 📋 Prerequisites

Before starting the server, ensure you have:

- ✅ Node.js (v16 or higher)
- ✅ PostgreSQL installed and running
- ✅ npm dependencies installed

## 🛠️ Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simuai_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@simuai.com

# OpenAI Configuration (for AI interviews)
OPENAI_API_KEY=your_openai_api_key_here

# Chapa Payment Configuration (Ethiopian payment gateway)
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_WEBHOOK_SECRET=your_webhook_secret

# Cloud Storage (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Logging
LOG_LEVEL=info
```

### 3. Create PostgreSQL Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE simuai_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE simuai_db TO postgres;

-- Exit
\q
```

### 4. Run Database Migrations (Choose One)

#### Option A: Using Sequelize (Current Setup)

```bash
cd server
npm run migrate
```

#### Option B: Using Prisma (If you want to switch)

```bash
cd server
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Start the Server

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

## ✅ Verify Server is Running

You should see output like:

```
✅ Database connection established successfully.
INFO: Server running on port 5000
```

Test the health endpoint:

```bash
curl http://localhost:5000/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📡 Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company
- `GET /api/companies/:id` - Get company by ID
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Applications
- `GET /api/applications` - Get all applications
- `POST /api/applications` - Submit application
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id` - Update application status

### Interviews
- `GET /api/interviews` - Get all interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/:id` - Get interview by ID
- `POST /api/interviews/:id/start` - Start interview
- `POST /api/interviews/:id/submit` - Submit interview responses

### Payments
- `POST /api/payments/initialize` - Initialize payment
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/jobs` - Get job analytics
- `GET /api/analytics/applications` - Get application analytics

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `PUT /api/admin/users/:id/verify` - Verify user
- `PUT /api/admin/users/:id/deactivate` - Deactivate user

## 🐛 Troubleshooting

### Error: Cannot find module

**Solution:**
```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

### Error: Database connection failed

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-14
   
   # Or check services
   services.msc
   ```

2. Verify database credentials in `.env`
3. Ensure database exists:
   ```bash
   psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname='simuai_db'"
   ```

### Error: Port 5000 already in use

**Solution:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

### Error: JWT_SECRET not defined

**Solution:**
Make sure `.env` file exists and contains:
```env
JWT_SECRET=your_secret_key_here
```

## 🔒 Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Enable database backups
- [ ] Use environment-specific configs

## 📊 Monitoring

### View Logs

```bash
# Error logs
tail -f server/logs/error.log

# Combined logs
tail -f server/logs/combined.log
```

### Database Monitoring

```bash
# Connect to database
psql -U postgres -d simuai_db

# Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🎯 Next Steps

1. ✅ Server is running
2. Start the frontend: `cd client && npm start`
3. Access the application: `http://localhost:3000`
4. Test API endpoints using Postman or curl
5. Check logs for any errors

Your server is now ready! 🎉
