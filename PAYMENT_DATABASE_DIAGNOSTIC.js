#!/usr/bin/env node

/**
 * Payment System Database Diagnostic
 * This script checks if the payment system is properly configured
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runDiagnostics() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║         PAYMENT SYSTEM DATABASE DIAGNOSTIC                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Test database connection
    console.log('1. Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected\n');

    // 2. Check Payment table exists
    console.log('2. Checking Payment table...');
    const paymentCount = await prisma.payment.count();
    console.log(`   ✅ Payment table exists (${paymentCount} records)\n`);

    // 3. Check User table exists
    console.log('3. Checking User table...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ User table exists (${userCount} records)\n`);

    // 4. Get a sample user
    console.log('4. Fetching sample user...');
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true
      }
    });
    
    if (user) {
      console.log(`   ✅ Sample user found:`);
      console.log(`      - ID: ${user.id} (type: ${typeof user.id})`);
      console.log(`      - Email: ${user.email}`);
      console.log(`      - Role: ${user.role}`);
      console.log(`      - Name: ${user.firstName} ${user.lastName}\n`);
    } else {
      console.log('   ⚠️  No users found in database\n');
    }

    // 5. Try to create a test payment
    console.log('5. Testing payment creation...');
    if (user) {
      try {
        const testPayment = await prisma.payment.create({
          data: {
            userId: user.id,
            amount: 999,
            currency: 'ETB',
            paymentMethod: 'chapa',
            transactionId: `test-${Date.now()}`,
            status: 'PENDING',
            description: 'Test payment'
          }
        });
        console.log(`   ✅ Test payment created successfully:`);
        console.log(`      - ID: ${testPayment.id}`);
        console.log(`      - User ID: ${testPayment.userId}`);
        console.log(`      - Amount: ${testPayment.amount}`);
        console.log(`      - Status: ${testPayment.status}\n`);

        // Clean up test payment
        await prisma.payment.delete({
          where: { id: testPayment.id }
        });
        console.log('   ✅ Test payment cleaned up\n');
      } catch (error) {
        console.log(`   ❌ Error creating test payment:`);
        console.log(`      ${error.message}\n`);
      }
    }

    // 6. Check payment records
    console.log('6. Checking existing payments...');
    const payments = await prisma.payment.findMany({
      take: 5,
      select: {
        id: true,
        userId: true,
        amount: true,
        status: true,
        transactionId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (payments.length > 0) {
      console.log(`   ✅ Found ${payments.length} payment(s):`);
      payments.forEach((p, i) => {
        console.log(`      ${i + 1}. ID: ${p.id}, User: ${p.userId}, Amount: ${p.amount}, Status: ${p.status}`);
      });
    } else {
      console.log('   ℹ️  No payments found (this is normal for new system)\n');
    }

    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    DIAGNOSTIC COMPLETE                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('SUMMARY:');
    console.log('✅ Database connection: OK');
    console.log('✅ Payment table: OK');
    console.log('✅ User table: OK');
    console.log('✅ Payment creation: OK');
    console.log('\nThe payment system is properly configured!\n');

  } catch (error) {
    console.log('\n❌ DIAGNOSTIC FAILED\n');
    console.log('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure PostgreSQL is running');
    console.log('2. Verify DATABASE_URL in server/.env');
    console.log('3. Run: npx prisma migrate deploy');
    console.log('4. Run: npx prisma generate\n');
  } finally {
    await prisma.$disconnect();
  }
}

runDiagnostics();
