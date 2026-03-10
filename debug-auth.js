const { prisma } = require('./server/config/database');
const bcrypt = require('bcryptjs');

async function debugAuth() {
  try {
    console.log('🔍 Checking database users...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isLocked: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
      console.log('\n📝 You need to register a user first.');
      console.log('Use the registration endpoint: POST /api/auth/register');
      console.log('\nExample:');
      console.log(JSON.stringify({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'candidate'
      }, null, 2));
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.email}`);
        console.log(`   Name: ${user.firstName} ${user.lastName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Locked: ${user.isLocked}`);
        console.log(`   Created: ${user.createdAt}\n`);
      });
    }

    // Test password hashing
    console.log('🔐 Testing password hashing...');
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    console.log(`Password hash test: ${isMatch ? '✅ PASS' : '❌ FAIL'}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();
