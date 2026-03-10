require('dotenv').config();
const { prisma } = require('./server/config/database');
const bcrypt = require('bcryptjs');

async function createUser() {
  try {
    console.log('🔧 Creating user account...\n');

    // Use the email from your attempts
    const email = 'aydenfudagne@gmail.com';
    const password = 'Password123!'; // You can change this
    const firstName = 'Ayden';
    const lastName = 'Fudagne';

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('✅ User already exists!');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Role: ${existing.role}`);
      console.log('\n📝 Login with:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      await prisma.$disconnect();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
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

    console.log('✅ User created successfully!\n');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n🔗 Now try logging in with these credentials');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
