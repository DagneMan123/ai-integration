# SimuAI Platform - Startup Instructions

## 🚀 Quick Start (5 Minutes)

### 1. Start PostgreSQL Database
**Double-click:** `START_POSTGRES_NOW.bat`

Wait for: ✅ PostgreSQL is running and database is accessible!

### 2. Start Server (Terminal 1)
```bash
cd server
npm run dev
```

Wait for: Server running on port 5000

### 3. Start Client (Terminal 2)
```bash
cd client
npm run dev
```

Wait for: Compiled successfully!

### 4. Open Browser
```
http://localhost:3000
```

## ✅ What's Ready

All code fixes have been applied:
- ✅ Server syntax errors fixed
- ✅ Chatbot API endpoint registered
- ✅ Database configured
- ✅ All features integrated

## 📋 System Requirements

- Node.js v16+
- PostgreSQL v13+
- npm or yarn
- OpenAI API key (already configured)

## 🔧 Database Configuration

```
Host: localhost
Port: 5432
Database: simuai_db
User: postgres
Password: MYlove8
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `START_POSTGRES_NOW.bat` | Automatic PostgreSQL startup |
| `COMPLETE_STARTUP_GUIDE.md` | Detailed setup instructions |
| `QUICK_START_CHECKLIST.txt` | Quick reference checklist |
| `STARTUP_VISUAL_GUIDE.txt` | Visual step-by-step guide |
| `DATABASE_STARTUP_SUMMARY.md` | Database-specific help |

## 🎯 Features Available

- ✅ User Authentication (Register/Login)
- ✅ Job Listings & Applications
- ✅ Interview System with AI Questions
- ✅ AI Chatbot (bottom-right corner)
- ✅ Performance Reports
- ✅ Anti-Cheat Monitoring
- ✅ Dashboard Analytics
- ✅ Payment Integration
- ✅ Email Notifications
- ✅ Admin Panel

## 🐛 Troubleshooting

### PostgreSQL Won't Start
```bash
# Check if service exists
sc query | findstr postgresql

# Start manually
net start postgresql-x64-16
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :5432

# Kill process
taskkill /PID <PID> /F
```

### Database Connection Failed
```bash
cd server
npx prisma migrate dev
```

### Dependencies Missing
```bash
cd server && npm install
cd client && npm install
```

## 🧪 Test the Application

1. **Register**: Click "Register" and create an account
2. **Login**: Use your credentials to login
3. **Browse Jobs**: Click "Jobs" to see available positions
4. **Test Chatbot**: Click the chat button (bottom-right) and ask a question
5. **Apply for Job**: Select a job and apply
6. **Start Interview**: Begin an interview session

## 📊 Architecture

```
Browser (localhost:3000)
    ↓ (API Calls)
Node.js Server (localhost:5000)
    ↓ (SQL Queries)
PostgreSQL Database (localhost:5432)
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verify email

### Jobs
- `GET /api/jobs` - List jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs` - Create job

### Interviews
- `POST /api/interviews/start` - Start interview
- `POST /api/interviews/:id/submit-answer` - Submit answer
- `GET /api/interviews/:id/report` - Get report

### AI/Chatbot
- `POST /api/ai/chat` - Send message to chatbot
- `GET /api/ai/status` - Check AI service

## 📝 Environment Variables

Server configuration in `server/.env`:
```
DATABASE_URL=postgresql://postgres:MYlove8@localhost:5432/simuai_db
OPENAI_API_KEY=sk-proj-...
JWT_SECRET=c8f5d7f5d91b40c779be77dede1dca5557efce3139dd02b3f05ddac82d0ff072
PORT=5000
```

Client configuration in `client/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

## 🎓 Learning Resources

- **Interview System**: See `INTERVIEW_QUICK_START.md`
- **Dashboard Communication**: See `DASHBOARD_COMMUNICATION_GUIDE.md`
- **AI System**: See `AI_SYSTEM_ARCHITECTURE.md`
- **Payment System**: See `PAYMENT_SYSTEM_COMPLETE_STATUS.md`

## 🚨 Important Notes

⚠️ **PostgreSQL must be running before starting the server**

⚠️ **Keep both terminals (server and client) open while developing**

⚠️ **Don't close the terminals - they keep the services running**

⚠️ **If you close a terminal, restart that service**

## 📞 Support

If you encounter issues:

1. Check the logs in `server/logs/`
2. Review error messages in browser console
3. Verify all services are running
4. Ensure database is accessible
5. Check that ports 3000, 5000, and 5432 are available

## ✨ Next Steps

1. ✅ Start PostgreSQL
2. ✅ Start Server
3. ✅ Start Client
4. ✅ Open http://localhost:3000
5. ✅ Register and explore!

---

**Everything is configured and ready to go. Just follow the Quick Start steps above!**

For detailed instructions, see `COMPLETE_STARTUP_GUIDE.md`
