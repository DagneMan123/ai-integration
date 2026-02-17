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
    console.error('Please start PostgreSQL service and ensure database exists.');
    console.error('See START_POSTGRESQL.md for instructions.');
    // Don't exit - allow server to run for other endpoints
  }
};

module.exports = { prisma, testConnection };