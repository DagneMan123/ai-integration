# SimuAI - Quick Start Guide

## ✅ Project Status: 100% COMPLETE

All 31 frontend pages created with TypeScript + Tailwind CSS
All backend APIs implemented and tested
Three role-based dashboards fully functional

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies (2 min)

```bash
# Install all dependencies at once
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 2: Setup Environment (1 min)

**Backend** - Create `server/.env`:
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/simuai
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@simuai.com
CHAPA_URL=https://api.chapa.co/v1
CHAPA_SECRET_KEY=your_chapa_secret_key
AI_API_KEY=your_openai_api_key
AI_API_URL=https://api.openai.com/v1
```

**Frontend** - Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Start MongoDB (30 sec)

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Run Application (30 sec)

```bash
# From root directory - runs both servers
npm run dev
```

**OR run separately:**

Terminal 1:
```bash
cd server
npm run dev
```

Terminal 2:
```bash
cd client
npm start
```

### Step 5: Access Application

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 👥 Test Accounts

### Create Admin Account
1. Register at http://localhost:3000/register
2. Choose role: "Admin"
3. Verify email (check console logs for token)
4. Login at http://localhost:3000/login

### Create Employer Account
1. Register with role: "Employer"
2. Complete company profile
3. Post jobs and manage candidates

### Create Candidate Account
1. Register with role: "Candidate"
2. Complete profile
3. Browse jobs and apply

---

## 📱 Dashboard Access

After login, you'll be redirected based on your role:

- **Candidate** → `/candidate/dashboard`
- **Employer** → `/employer/dashboard`
- **Admin** → `/admin/dashboard`

---

## 🎯 Key Features to Test

### Candidate Dashboard
✅ View and apply for jobs
✅ Take AI-powered interviews
✅ View interview reports
✅ Track application status
✅ Manage profile
✅ View payment history

### Employer Dashboard
✅ Post and manage jobs
✅ Review candidate applications
✅ View interview results
✅ Access analytics
✅ Manage subscription
✅ Configure AI interviews

### Admin Dashboard
✅ Manage all users
✅ Verify companies
✅ Moderate job postings
✅ Monitor payments
✅ View platform analytics
✅ Access activity logs

---

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- React Router v6
- Zustand (State Management)
- Axios + React Hook Form
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Chapa Payment Integration
- AI Service Integration
- Email Service (Nodemailer)

---

## 📊 Project Statistics

- **Total Pages**: 31
- **Authentication Pages**: 5
- **Public Pages**: 4
- **Candidate Pages**: 7
- **Employer Pages**: 8
- **Admin Pages**: 7
- **Components**: 4
- **API Endpoints**: 50+
- **Database Models**: 8

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Run both servers
npm run dev

# Run backend only
cd server && npm run dev

# Run frontend only
cd client && npm start

# Build frontend for production
cd client && npm run build

# Run tests
npm test

# Kill ports if busy
npx kill-port 3000
npx kill-port 5000
```

---

## 🐛 Quick Troubleshooting

### Port Already in Use
```bash
npx kill-port 3000
npx kill-port 5000
```

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### TypeScript Errors in Frontend
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Backend Connection Issues
- Check MongoDB is running
- Verify `.env` file exists in `server/` directory
- Check `MONGODB_URI` is correct

---

## 📚 Documentation Files

- `README.md` - Main documentation
- `COMPLETE_SETUP.md` - Detailed setup guide
- `COMPLETE_FRONTEND_GUIDE.md` - Frontend documentation
- `DASHBOARD_ROLES_GUIDE.md` - Dashboard roles explanation
- `FINAL_SETUP_INSTRUCTIONS.md` - Final setup steps
- `QUICK_START.md` - This file

---

## 🎉 You're Ready!

The platform is 100% complete and ready to use. All pages are implemented with:
- ✅ Professional TypeScript code
- ✅ Clean Tailwind CSS styling
- ✅ Full backend integration
- ✅ Role-based access control
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

Start the servers and explore the platform!

---

## 📞 Need Help?

1. Check the documentation files
2. Verify environment variables
3. Ensure MongoDB is running
4. Check browser console for errors
5. Check server logs for backend issues

---

Made with ❤️ by SimuAI Team

**Status: PRODUCTION READY** 🚀
