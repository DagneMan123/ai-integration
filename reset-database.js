const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('🔄 Starting database reset...\n');

    // Delete all data in order (respecting foreign keys)
    console.log('Deleting interviews...');
    await prisma.interview.deleteMany({});

    console.log('Deleting applications...');
    await prisma.application.deleteMany({});

    console.log('Deleting jobs...');
    await prisma.job.deleteMany({});

    console.log('Deleting payments...');
    await prisma.payment.deleteMany({});

    console.log('Deleting companies...');
    await prisma.company.deleteMany({});

    console.log('Deleting users...');
    await prisma.user.deleteMany({});

    console.log('\n✅ Database reset successfully!\n');
    console.log('All tables are now empty. You can register new accounts.\n');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
