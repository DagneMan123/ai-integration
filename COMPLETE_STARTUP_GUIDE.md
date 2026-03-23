# Complete Startup Guide - SimuAI Platform

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js installed (v16+)
- ✅ PostgreSQL installed (v13+)
- ✅ npm or yarn package manager
- ✅ OpenAI API key (already configured in `.env`)

## Step 1: Start PostgreSQL Database

### Option A: Automatic (Recommended)
1. Double-click `START_POSTGRES_NOW.bat` in the project root
2. Wait for the script to complete
3. You should see: ✅ PostgreSQL is running and database is accessible!

### Option B: Manual Start
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find "PostgreSQL" in the list
4. Right-click → Select "Start"
5. Wait for status to show "Running"

### Option C: Command Line
Open Command Prompt as Administrator and run:
```cmd
net start postgresql-x64-16
```
(Replace `16` with your PostgreSQL version if different)

## Step 2: Verify Database Connection

Open Command Prompt and run:
```cmd
cd server
node -e "const {PrismaClient} = require('@prisma/client'); const p = new PrismaClient(); p.$connect().then(() => console.log('✅ Connected')).catch(e => console.log('❌', e.message))"
```

Expected output: `✅ Connected`

## Step 3: Install Dependencies

### Server Dependencies
```cmd
cd server
npm install
```

### Client Dependencies
```cmd
cd client
npm install
```

## Step 4: Setup Database Schema

Run Prisma migrations to create all tables:
```cmd
cd server
npx prisma migrate dev --name init
```

This will:
- Create all database tables
- Seed initial data (if seed.js exists)
- Generate Prisma client

## Step 5: Start the Server

Open a Command Prompt and run:
```cmd
cd server
npm run dev
```

Expected output:
```
Database connection established successfully via Prisma.
Server running on port 5000
```

## Step 6: Start the Client

Open a NEW Command Prompt and run:
```cmd
cd client
npm run dev
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

## Step 7: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Features Available

### 1. Authentication
- Register new account
- Login with email/password
- Email verification
- Password reset

### 2. Job Listings
- Browse available jobs
- View job details
- Apply for jobs

### 3. Interviews
- Start interview session
- Answer AI-generated questions
- Get performance report
- Anti-cheat monitoring

### 4. Chatbot
- Click the chat button (bottom-right corner)
- Ask questions about interviews, jobs, or platform features
- Get AI-powered responses

### 5. Dashboards
- **Candidate**: View applications, interviews, results
- **Employer**: Post jobs, view candidates, schedule interviews
- **Admin**: Manage users, view analytics, system settings

## Troubleshooting

### PostgreSQL Won't Start
```cmd
# Check if service exists
sc query | findstr postgresql

# If not found, PostgreSQL might not be installed
# Download from: https://www.postgresql.org/download/windows/
```

### Port 5432 Already in Use
```cmd
# Find process using port 5432
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Database Connection Failed
1. Verify PostgreSQL is running: `net start postgresql-x64-16`
2. Check `.env` file has correct DATABASE_URL
3. Ensure database `simuai_db` exists
4. Run: `npx prisma migrate dev`

### Server Won't Start
```cmd
# Clear node_modules and reinstall
cd server
rmdir /s /q node_modules
npm install
npm run dev
```

### Client Build Errors
```cmd
# Clear cache and reinstall
cd client
rmdir /s /q node_modules
npm install
npm run dev
```

### Chatbot Not Responding
1. Verify OpenAI API key in `server/.env`
2. Check server logs for errors
3. Ensure `/api/ai/chat` endpoint is accessible
4. Test with: `curl -X POST http://localhost:5000/api/ai/chat -H "Content-Type: application/json" -d '{"message":"hello"}'`

## Database Configuration

Current settings in `server/.env`:
```
Host: localhost
Port: 5432
Database: simuai_db
User: postgres
Password: MYlove8
```

To change these:
1. Edit `server/.env`
2. Update `DATABASE_URL`
3. Restart server

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)

### Interviews
- `POST /api/interviews/start` - Start interview
- `POST /api/interviews/:id/submit-answer` - Submit answer
- `POST /api/interviews/:id/complete` - Complete interview
- `GET /api/interviews/:id/report` - Get interview report

### AI/Chatbot
- `POST /api/ai/chat` - Send message to chatbot
- `GET /api/ai/status` - Check AI service status
- `POST /api/ai/analyze-resume` - Analyze resume

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## Performance Tips

1. **Database**: PostgreSQL should be running on localhost:5432
2. **API Calls**: Server runs on port 5000
3. **Frontend**: Client runs on port 3000
4. **Caching**: Browser cache is cleared on each build
5. **Logs**: Check `server/logs/` for error details

## Next Steps

1. ✅ Start PostgreSQL
2. ✅ Start Server (`npm run dev` in server folder)
3. ✅ Start Client (`npm run dev` in client folder)
4. ✅ Open http://localhost:3000
5. ✅ Register/Login
6. ✅ Explore features

## Support

For issues or questions:
1. Check the logs in `server/logs/`
2. Review error messages in browser console
3. Verify all services are running
4. Ensure database is accessible

---

**Status**: ✅ Ready to start development!
