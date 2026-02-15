# SimuAI - Final Setup Instructions

## ✅ What's Complete

### Backend (100%)
- ✅ All models, controllers, routes
- ✅ Authentication & authorization
- ✅ Payment integration (Chapa)
- ✅ AI service integration
- ✅ Email service
- ✅ File uploads
- ✅ Analytics endpoints

### Frontend Core (100%)
- ✅ TypeScript + Tailwind CSS setup
- ✅ Authentication pages (Login, Register, Forgot/Reset Password, Verify Email)
- ✅ Public pages (Home, Jobs, Job Details)
- ✅ Candidate pages (Dashboard, Profile, Applications, Interviews, Interview Session, Interview Report, Payments)
- ✅ Employer Dashboard
- ✅ Type definitions
- ✅ API client
- ✅ State management (Zustand)
- ✅ Navigation component

## 📝 Remaining Pages to Create

Run this command to create all remaining placeholder pages:

```bash
cd client/src/pages
```

### Create Employer Pages:

```bash
# Create employer directory if not exists
mkdir -p employer
```

Create these files in `client/src/pages/employer/`:

1. **Profile.tsx** - Company profile management
2. **Jobs.tsx** - List of employer's jobs
3. **CreateJob.tsx** - Create new job posting
4. **EditJob.tsx** - Edit existing job
5. **JobCandidates.tsx** - View candidates for a job
6. **Analytics.tsx** - Hiring analytics
7. **Subscription.tsx** - Subscription management

### Create Admin Pages:

```bash
# Create admin directory if not exists
mkdir -p admin
```

Create these files in `client/src/pages/admin/`:

1. **Dashboard.tsx** - Admin overview
2. **Users.tsx** - User management
3. **Companies.tsx** - Company verification
4. **Jobs.tsx** - Job moderation
5. **Payments.tsx** - Payment monitoring
6. **Analytics.tsx** - Platform analytics
7. **Logs.tsx** - Activity logs

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Root
npm install

# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Environment Setup

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/simuai
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@simuai.com
CHAPA_URL=https://api.chapa.co/v1
CHAPA_SECRET_KEY=your_chapa_key
AI_API_KEY=your_openai_key
AI_API_URL=https://api.openai.com/v1
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start MongoDB

```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### 4. Run Application

```bash
# From root directory
npm run dev
```

Or separately:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

### 5. Access Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

## 📋 Page Template

Use this template for remaining pages:

```typescript
import React from 'react';

const PageName: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Page Title</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Content goes here...</p>
        </div>
      </div>
    </div>
  );
};

export default PageName;
```

## 🎨 Tailwind Classes Reference

### Layout
- `min-h-screen` - Full height
- `max-w-7xl mx-auto` - Centered container
- `py-8 px-4` - Padding
- `grid md:grid-cols-3 gap-6` - Grid layout

### Cards
- `bg-white rounded-lg shadow-md p-6` - Card
- `hover:shadow-lg transition` - Hover effect

### Buttons
- `bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition` - Primary button
- `bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition` - Secondary button

### Forms
- `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent` - Input

### Text
- `text-3xl font-bold text-gray-900` - Heading
- `text-gray-600` - Body text
- `text-sm text-gray-500` - Small text

### Status Badges
- `bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium` - Success
- `bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium` - Warning
- `bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium` - Error

## 🔧 Common Patterns

### Fetch Data Pattern
```typescript
const [data, setData] = useState<any>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  try {
    const response = await api.getData();
    setData(response.data.data);
  } catch (error) {
    console.error('Failed to fetch', error);
  } finally {
    setLoading(false);
  }
};

if (loading) return <Loading />;
```

### Form Submit Pattern
```typescript
const { register, handleSubmit, formState: { errors } } = useForm();
const [submitting, setSubmitting] = useState(false);

const onSubmit = async (data: any) => {
  setSubmitting(true);
  try {
    await api.submitData(data);
    toast.success('Success!');
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Failed');
  } finally {
    setSubmitting(false);
  }
};
```

## 🐛 Troubleshooting

### TypeScript Errors
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Port Issues
```bash
npx kill-port 3000
npx kill-port 5000
```

### MongoDB Issues
```bash
mongod --version
sudo systemctl restart mongod
```

## 📚 API Endpoints Reference

### Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password/:token`
- POST `/api/auth/verify-email/:token`

### Jobs
- GET `/api/jobs` - All jobs
- GET `/api/jobs/:id` - Single job
- POST `/api/jobs` - Create (employer)
- PUT `/api/jobs/:id` - Update
- DELETE `/api/jobs/:id` - Delete

### Applications
- POST `/api/applications` - Apply
- GET `/api/applications/my-applications` - Candidate apps
- GET `/api/applications/job/:jobId` - Job apps (employer)

### Interviews
- POST `/api/interviews/start` - Start
- POST `/api/interviews/:id/submit-answer` - Submit answer
- POST `/api/interviews/:id/complete` - Complete
- GET `/api/interviews/:id/report` - Get report

### Payments
- POST `/api/payments/initialize` - Initialize
- GET `/api/payments/verify/:tx_ref` - Verify
- GET `/api/payments/history` - History

### Analytics
- GET `/api/analytics/candidate/dashboard`
- GET `/api/analytics/employer/dashboard`
- GET `/api/analytics/admin/dashboard`

## ✨ Features Implemented

✅ Role-based authentication
✅ JWT with refresh tokens
✅ Email verification
✅ Password reset
✅ Job posting & browsing
✅ Application system
✅ AI interview system
✅ Interview reports
✅ Payment integration
✅ Analytics dashboards
✅ File uploads
✅ Activity logging
✅ Admin controls

## 🎯 Next Steps

1. Create remaining placeholder pages
2. Test all authentication flows
3. Test job application flow
4. Test interview flow
5. Configure Chapa payment
6. Configure AI service
7. Add unit tests
8. Deploy to production

---

Made with ❤️ by SimuAI Team
