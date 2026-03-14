const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function unlockAccount() {
  try {
    const email = 'etenu123@gmail.com';
    
    const user = await prisma.user.update({
      where: { email },
      data: {
        isLocked: false,
        loginAttempts: 0
      }
    });

    console.log(`✅ Account unlocked successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔓 Status: Unlocked`);
    console.log(`\nYou can now login again.`);

  } catch (error) {
    console.error('❌ Error unlocking account:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

unlockAccount();
