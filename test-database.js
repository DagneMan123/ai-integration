require('dotenv').config({ path: './server/.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    console.log('\nChecking tables...');
    const users = await prisma.user.findMany();
    console.log(`✅ User table exists. Found ${users.length} users`);

    const companies = await prisma.company.findMany();
    console.log(`✅ Company table exists. Found ${companies.length} companies`);

    const jobs = await prisma.job.findMany();
    console.log(`✅ Job table exists. Found ${jobs.length} jobs`);

    console.log('\n✅ All tables exist! Database is ready.');
    
  } catch (error) {
    console.error('\n❌ Database Error:', error.message);
    
    if (error.message.includes("Can't reach database")) {
      console.log('\n💡 Solution: Start PostgreSQL service');
      console.log('   Run: net start postgresql-x64-16');
    } else if (error.message.includes('does not exist')) {
      console.log('\n💡 Solution: Create database tables');
      console.log('   Run: cd server && npx prisma db push');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
