# 🚀 Prisma Setup Guide for SimuAI

This guide will help you set up Prisma ORM for the SimuAI project with PostgreSQL.

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
cd server
npm install @prisma/client prisma
```

### 2. Environment Configuration

Create or update your `.env` file in the server directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/simuai_db?schema=public"

# Example for local development
DATABASE_URL="postgresql://postgres:password@localhost:5432/simuai_db?schema=public"

# Example for production (replace with your actual values)
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Push Schema to Database

For development (creates tables without migrations):
```bash
npm run db:push
```

Or for production (with proper migrations):
```bash
npm run db:migrate
```

### 5. Seed the Database

```bash
npm run db:seed
```

## 📊 Available Scripts

```json
{
  "db:generate": "prisma generate",           // Generate Prisma client
  "db:push": "prisma db push",               // Push schema to DB (dev)
  "db:migrate": "prisma migrate dev",        // Create and apply migration
  "db:migrate:prod": "prisma migrate deploy", // Apply migrations (prod)
  "db:seed": "node prisma/seed.js",          // Seed database
  "db:studio": "prisma studio",              // Open Prisma Studio
  "db:reset": "prisma migrate reset"         // Reset database
}
```

## 🗄️ Database Schema Overview

### Core Models

1. **User** - All user types (candidate, employer, admin)
2. **Company** - Company profiles
3. **Job** - Job postings
4. **CandidateProfile** - Extended candidate information
5. **Application** - Job applications
6. **Interview** - AI interview sessions
7. **Payment** - Payment transactions
8. **ActivityLog** - System activity tracking

### Key Features

- **Type Safety**: Full TypeScript support
- **Relations**: Proper foreign key relationships
- **Enums**: Status enums for better data integrity
- **JSON Fields**: Flexible data storage for complex objects
- **Indexes**: Optimized for performance
- **Constraints**: Data validation at database level

## 🔧 Usage Examples

### Basic CRUD Operations

```javascript
const prisma = require('./lib/prisma');

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    passwordHash: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CANDIDATE'
  }
});

// Find user with relations
const userWithProfile = await prisma.user.findUnique({
  where: { id: 1 },
  include: {
    candidateProfile: true,
    applications: true
  }
});

// Update user
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { isVerified: true }
});

// Delete user
await prisma.user.delete({
  where: { id: 1 }
});
```

### Advanced Queries

```javascript
// Get jobs with company and applications count
const jobs = await prisma.job.findMany({
  include: {
    company: {
      select: {
        name: true,
        logoUrl: true
      }
    },
    _count: {
      select: {
        applications: true
      }
    }
  },
  where: {
    status: 'ACTIVE'
  },
  orderBy: {
    createdAt: 'desc'
  }
});

// Get user statistics
const stats = await prisma.user.groupBy({
  by: ['role'],
  _count: {
    id: true
  }
});

// Complex filtering
const candidates = await prisma.user.findMany({
  where: {
    role: 'CANDIDATE',
    candidateProfile: {
      skills: {
        hasSome: ['JavaScript', 'React']
      },
      expectedSalary: {
        lte: 50000
      }
    }
  },
  include: {
    candidateProfile: true
  }
});
```

## 🔄 Migrations

### Create New Migration

```bash
npx prisma migrate dev --name add_new_field
```

### Apply Migrations in Production

```bash
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

## 🎨 Prisma Studio

Launch the visual database browser:

```bash
npm run db:studio
```

Access at: http://localhost:5555

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Connection Pooling**: Configure for production
3. **SSL**: Use SSL connections in production
4. **Validation**: Always validate input data
5. **Transactions**: Use for complex operations

### Example Transaction

```javascript
const result = await prisma.$transaction(async (prisma) => {
  const user = await prisma.user.create({
    data: userData
  });

  const profile = await prisma.candidateProfile.create({
    data: {
      userId: user.id,
      ...profileData
    }
  });

  return { user, profile };
});
```

## 🚀 Production Deployment

### 1. Environment Setup

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?schema=public&sslmode=require"
NODE_ENV="production"
```

### 2. Build and Deploy

```bash
# Generate Prisma client
npm run db:generate

# Apply migrations
npm run db:migrate:prod

# Start application
npm start
```

### 3. Connection Pooling

For production, consider using connection pooling:

```javascript
// lib/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection Error**: Check DATABASE_URL format
2. **Migration Failed**: Ensure database exists
3. **Type Errors**: Run `npm run db:generate`
4. **Seed Failed**: Check data constraints

### Debug Mode

Enable query logging:

```javascript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## 📚 Sample Data

The seed file creates:

- **Admin**: admin@simuai.com / admin123
- **Employer**: employer@techcorp.com / employer123  
- **Candidate**: candidate@example.com / candidate123
- **Sample Jobs**: 3 tech positions
- **Sample Applications**: 1 application
- **Sample Interview**: 1 pending interview

## 🔗 Useful Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## 🎯 Next Steps

1. Install dependencies: `npm install`
2. Set up environment variables
3. Generate Prisma client: `npm run db:generate`
4. Push schema: `npm run db:push`
5. Seed database: `npm run db:seed`
6. Start development: `npm run dev`

Your Prisma setup is now complete! 🎉