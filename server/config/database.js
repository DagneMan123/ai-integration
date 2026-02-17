require('dotenv').config();

const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Database connection established successfully via Prisma.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { prisma, testConnection };