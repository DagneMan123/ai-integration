const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

async function fixAdminRole() {
  try {
    logger.info('Fixing admin user roles...');

    // Update any admin users with lowercase role to uppercase
    const result = await prisma.user.updateMany({
      where: {
        email: 'admin@simuai.com'
      },
      data: {
        role: 'ADMIN'
      }
    });

    logger.info(`Updated ${result.count} admin user(s)`);

    // Verify the update
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@simuai.com' },
      select: { id: true, email: true, role: true }
    });

    logger.info('Admin user after fix:', admin);

    if (admin && admin.role === 'ADMIN') {
      logger.info('✅ Admin role fix successful!');
    } else {
      logger.error('❌ Admin role fix failed!');
    }
  } catch (error) {
    logger.error('Error fixing admin role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminRole();
