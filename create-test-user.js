const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'etenu123@gmail.com';
    const password = 'Test123456';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`✅ User ${email} already exists`);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        firstName: 'Test',
        lastName: 'User',
        passwordHash: hashedPassword,
        role: 'CANDIDATE',
        isActive: true,
        candidateProfile: {
          create: {
            skills: [],
            experienceLevel: 'entry',
            education: null
          }
        }
      },
      include: {
        candidateProfile: true
      }
    });

    console.log(`✅ Test user created successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Role: CANDIDATE`);
    console.log(`\nYou can now login with these credentials.`);

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
