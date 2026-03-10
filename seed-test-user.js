require('dotenv').config();
const { prisma } = require('./server/config/database');
const bcrypt = require('bcryptjs');

async function seedTestUser() {
  try {
    console.log('🌱 Seeding test user...\n');

    // Test user credentials
    const testEmail = 'test@simuai.com';
    const testPassword = 'TestPassword123!';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Role: ${existingUser.role}`);
      console.log('\n📝 Use these credentials to login:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(testPassword, 12);

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'CANDIDATE',
        isVerified: true,
        isActive: true
      }
    });

    // Create candidate profile
    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        skills: ['JavaScript', 'React', 'Node.js'],
        experienceLevel: 'mid'
      }
    });

    console.log('✅ Test user created successfully!\n');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n🔗 Use these to login at: POST /api/auth/login');

  } catch (error) {
    console.error('❌ Error seeding user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestUser();
