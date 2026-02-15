# SimuAI - Complete Professional Setup Guide

## 🎯 Project Overview

SimuAI is a professional AI-powered interview platform with:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS
- **3 Role-Based Dashboards**: Admin, Employer, Candidate
- **Features**: AI Interviews, Payment Integration (Chapa), Analytics

---

## 📦 Installation Steps

### 1. Install All Dependencies

```bash
# Root dependencies
npm install

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install

# Create placeholder pages
node create-placeholders.js
```

### 2. Environment Configuration

#### Backend Environment (`server/.env`)

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/simuai

# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters
JWT_REFRESH_EXPIRE=30d

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@simuai.com

# Chapa Payment Gateway
CHAPA_URL=https://api.chapa.co/v1
CHAPA_SECRET_KEY=your_chapa_secret_key_here

# AI Service (OpenAI)
AI_API_KEY=your_openai_api_key_here
AI_API_URL=https://api.openai.com/v1

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpeg,jpg,png,pdf,doc,docx
```

#### Frontend Environment (`client/.env`)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Run the Application

#### Option 1: Run Both Servers (Recommended)

```bash
# From root directory
npm run dev
```

#### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🏗️ Project Structure

```
simuai-platform/
├── server/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Authentication logic
│   │   ├── userController.js       # User management
│   │   ├── jobController.js        # Job operations
│   │   ├── interviewController.js  # Interview management
│   │   ├── paymentController.js    # Payment processing
│   │   ├── analyticsController.js  # Analytics data
│   │   ├── applicationController.js # Application handling
│   │   ├── companyController.js    # Company management
│   │   └── adminController.js      # Admin operations
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   ├── validation.js           # Input validation
│   │   ├── security.js             # Security measures
│   │   ├── errorHandler.js         # Error handling
│   │   └── upload.js               # File upload
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   ├── Company.js              # Company schema
│   │   ├── Job.js                  # Job schema
│   │   ├── Interview.js            # Interview schema
│   │   ├── Application.js          # Application schema
│   │   ├── Payment.js              # Payment schema
│   │   ├── CandidateProfile.js     # Candidate profile
│   │   └── ActivityLog.js          # Activity logging
│   ├── routes/
│   │   ├── auth.js                 # Auth routes
│   │   ├── users.js                # User routes
│   │   ├── jobs.js                 # Job routes
│   │   ├── interviews.js           # Interview routes
│   │   ├── applications.js         # Application routes
│   │   ├── payments.js             # Payment routes
│   │   ├── analytics.js            # Analytics routes
│   │   ├── companies.js            # Company routes
│   │   └── admin.js                # Admin routes
│   ├── services/
│   │   ├── aiService.js            # AI integration
│   │   └── chapaService.js         # Chapa payment
│   ├── utils/
│   │   ├── jwt.js                  # JWT utilities
│   │   ├── email.js                # Email service
│   │   ├── logger.js               # Logging
│   │   └── cloudStorage.js         # File storage
│   ├── .env.example                # Environment template
│   ├── package.json
│   └── index.js                    # Server entry
│
├── client/                          # Frontend (React + TypeScript + Tailwind)
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Navigation bar
│   │   │   ├── PrivateRoute.tsx    # Protected routes
│   │   │   └── Loading.tsx         # Loading spinner
│   │   ├── pages/
│   │   │   ├── auth/               # Authentication pages
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   └── VerifyEmail.tsx
│   │   │   ├── candidate/          # Candidate dashboard
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── Applications.tsx
│   │   │   │   ├── Interviews.tsx
│   │   │   │   ├── InterviewSession.tsx
│   │   │   │   ├── InterviewReport.tsx
│   │   │   │   └── Payments.tsx
│   │   │   ├── employer/           # Employer dashboard
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── Jobs.tsx
│   │   │   │   ├── CreateJob.tsx
│   │   │   │   ├── EditJob.tsx
│   │   │   │   ├── JobCandidates.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   └── Subscription.tsx
│   │   │   ├── admin/              # Admin dashboard
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Users.tsx
│   │   │   │   ├── Companies.tsx
│   │   │   │   ├── Jobs.tsx
│   │   │   │   ├── Payments.tsx
│   │   │   │   ├── Analytics.tsx
│   │   │   │   └── Logs.tsx
│   │   │   ├── Home.tsx            # Landing page
│   │   │   ├── Jobs.tsx            # Job listings
│   │   │   └── JobDetails.tsx      # Job details
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand auth state
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript types
│   │   ├── utils/
│   │   │   └── api.ts              # API client
│   │   ├── App.tsx                 # Main app component
│   │   ├── index.tsx               # Entry point
│   │   └── index.css               # Tailwind styles
│   ├── tailwind.config.js          # Tailwind configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── postcss.config.js           # PostCSS config
│   ├── create-placeholders.js      # Placeholder generator
│   └── package.json
│
├── package.json                     # Root package.json
├── README.md                        # Main documentation
├── SETUP.md                         # Setup guide
└── COMPLETE_SETUP.md               # This file
```

---

## 🎨 Frontend Technology Stack

### Core Technologies
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Routing
- **Zustand** - State management

### Additional Libraries
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **Chart.js & Recharts** - Data visualization

### Tailwind Configuration

```javascript
// Custom colors in tailwind.config.js
colors: {
  primary: {
    DEFAULT: '#4f46e5',  // Indigo
    dark: '#4338ca',
    light: '#6366f1',
  },
  secondary: {
    DEFAULT: '#10b981',  // Green
    dark: '#059669',
    light: '#34d399',
  },
  danger: {
    DEFAULT: '#ef4444',  // Red
    dark: '#dc2626',
    light: '#f87171',
  },
  warning: {
    DEFAULT: '#f59e0b',  // Amber
    dark: '#d97706',
    light: '#fbbf24',
  },
}
```

---

## 🔧 Backend Technology Stack

### Core Technologies
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### Security & Authentication
- **JWT** - Token-based auth
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **Express Mongo Sanitize** - NoSQL injection prevention

### Additional Services
- **Nodemailer** - Email service
- **Multer** - File uploads
- **Winston** - Logging
- **Chapa** - Payment gateway

---

## 🔐 Authentication Flow

1. **Registration**
   - User registers with email/password
   - Email verification sent
   - JWT token issued
   - Role-based redirect

2. **Login**
   - Credentials validated
   - JWT token issued
   - Refresh token for auto-renewal
   - Role-based dashboard access

3. **Token Management**
   - Access token (7 days)
   - Refresh token (30 days)
   - Auto-refresh on expiration
   - Stored in Zustand + localStorage

---

## 📱 User Roles & Access

### Candidate
- Browse and apply for jobs
- Take AI-powered interviews
- View interview reports
- Track applications
- Manage profile
- Make payments

### Employer
- Post and manage jobs
- Configure AI interviews
- Review candidates
- View analytics
- Manage subscriptions
- Access AI credits

### Admin
- Manage all users
- Verify companies
- Moderate jobs
- View all payments
- Monitor AI usage
- Access system logs

---

## 🚀 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register user
POST   /api/auth/login             - Login user
POST   /api/auth/logout            - Logout user
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password/:token - Reset password
POST   /api/auth/verify-email/:token - Verify email
POST   /api/auth/refresh-token     - Refresh access token
```

### Jobs
```
GET    /api/jobs                   - Get all jobs (public)
GET    /api/jobs/:id               - Get single job
POST   /api/jobs                   - Create job (employer)
PUT    /api/jobs/:id               - Update job
DELETE /api/jobs/:id               - Delete job
GET    /api/jobs/employer/my-jobs  - Get employer jobs
```

### Applications
```
POST   /api/applications           - Create application
GET    /api/applications/my-applications - Get candidate applications
GET    /api/applications/:id       - Get single application
DELETE /api/applications/:id       - Withdraw application
GET    /api/applications/job/:jobId - Get job applications (employer)
```

### Interviews
```
POST   /api/interviews/start       - Start interview
POST   /api/interviews/:id/submit-answer - Submit answer
POST   /api/interviews/:id/complete - Complete interview
GET    /api/interviews/my-interviews - Get candidate interviews
GET    /api/interviews/:id/report  - Get interview report
```

### Payments
```
POST   /api/payments/initialize    - Initialize payment
GET    /api/payments/verify/:tx_ref - Verify payment
POST   /api/payments/webhook       - Chapa webhook
GET    /api/payments/history       - Get payment history
GET    /api/payments/subscription  - Get subscription status
```

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test

# Run all tests
npm test
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 3000
npx kill-port 3000
```

### MongoDB Connection Issues
```bash
# Check MongoDB status
mongod --version

# Restart MongoDB
sudo systemctl restart mongod

# Check if MongoDB is running
sudo systemctl status mongod
```

### TypeScript Errors
```bash
# Clear cache and reinstall
cd client
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Working
```bash
# Ensure PostCSS and Tailwind are installed
cd client
npm install -D tailwindcss postcss autoprefixer

# Rebuild
npm run build
```

---

## 📦 Deployment

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build

# Deploy the build folder
# Set environment variable: REACT_APP_API_URL
```

### Backend (Heroku/Railway/Render)

```bash
# Set all environment variables
# Connect MongoDB Atlas
# Deploy from Git repository
```

### Database (MongoDB Atlas)

1. Create cluster at mongodb.com
2. Whitelist IP addresses (0.0.0.0/0 for all)
3. Create database user
4. Get connection string
5. Update MONGODB_URI in .env

---

## 🎯 Next Steps

1. ✅ Complete remaining page implementations
2. ✅ Add comprehensive unit tests
3. ✅ Implement E2E tests with Cypress
4. ✅ Add API documentation (Swagger)
5. ✅ Set up CI/CD pipeline
6. ✅ Add Docker configuration
7. ✅ Implement WebSocket for real-time features
8. ✅ Add PWA support

---

## 📞 Support

For issues or questions:
- Check environment variables
- Ensure MongoDB is running
- Verify all dependencies are installed
- Check ports 3000 and 5000 are available

---

## 📄 License

MIT License - See LICENSE file for details

---

Made with ❤️ by SimuAI Team
