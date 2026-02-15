const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

class UserService {
  // Create new user
  async createUser(userData) {
    try {
      const { email, password, firstName, lastName, role, phone } = userData;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: role.toUpperCase(),
          phone,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
        }
      });

      // Create candidate profile if role is candidate
      if (role.toUpperCase() === 'CANDIDATE') {
        await prisma.candidateProfile.create({
          data: {
            userId: user.id,
            skills: [],
            languages: ['English'],
          }
        });
      }

      logger.info('User created successfully', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error: error.message, email: userData.email });
      throw error;
    }
  }

  // Get user by ID with relations
  async getUserById(id, includeProfile = false) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profilePicture: true,
          linkedinUrl: true,
          githubUrl: true,
          bio: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          candidateProfile: includeProfile ? {
            select: {
              id: true,
              resumeUrl: true,
              skills: true,
              experienceLevel: true,
              education: true,
              workExperience: true,
              certifications: true,
              languages: true,
              availability: true,
              expectedSalary: true,
            }
          } : false,
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', { error: error.message, userId: id });
      throw error;
    }
  }

  // Get user by email
  async getUserByEmail(email) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          isVerified: true,
          isActive: true,
        }
      });

      return user;
    } catch (error) {
      logger.error('Failed to get user by email', { error: error.message, email });
      throw error;
    }
  }

  // Update user profile
  async updateUser(id, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          profilePicture: true,
          linkedinUrl: true,
          githubUrl: true,
          bio: true,
          isVerified: true,
          isActive: true,
          updatedAt: true,
        }
      });

      logger.info('User updated successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to update user', { error: error.message, userId: id });
      throw error;
    }
  }

  // Update candidate profile
  async updateCandidateProfile(userId, profileData) {
    try {
      const profile = await prisma.candidateProfile.upsert({
        where: { userId: parseInt(userId) },
        update: profileData,
        create: {
          userId: parseInt(userId),
          ...profileData,
        },
        select: {
          id: true,
          resumeUrl: true,
          skills: true,
          experienceLevel: true,
          education: true,
          workExperience: true,
          certifications: true,
          languages: true,
          availability: true,
          expectedSalary: true,
          updatedAt: true,
        }
      });

      logger.info('Candidate profile updated successfully', { userId, profileId: profile.id });
      return profile;
    } catch (error) {
      logger.error('Failed to update candidate profile', { error: error.message, userId });
      throw error;
    }
  }

  // Get all users with pagination
  async getUsers(page = 1, limit = 10, role = null) {
    try {
      const skip = (page - 1) * limit;
      const where = role ? { role: role.toUpperCase() } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            phone: true,
            isVerified: true,
            isActive: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.user.count({ where })
      ]);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get users', { error: error.message });
      throw error;
    }
  }

  // Verify user email
  async verifyUser(id) {
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { isVerified: true },
        select: {
          id: true,
          email: true,
          isVerified: true,
        }
      });

      logger.info('User verified successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to verify user', { error: error.message, userId: id });
      throw error;
    }
  }

  // Deactivate user
  async deactivateUser(id) {
    try {
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          isActive: true,
        }
      });

      logger.info('User deactivated successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to deactivate user', { error: error.message, userId: id });
      throw error;
    }
  }

  // Change password
  async changePassword(id, oldPassword, newPassword) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: { id: true, passwordHash: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isValidPassword = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new Error('Invalid current password');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: parseInt(id) },
        data: { passwordHash: newPasswordHash }
      });

      logger.info('Password changed successfully', { userId: id });
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Failed to change password', { error: error.message, userId: id });
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const stats = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true
        }
      });

      const totalUsers = await prisma.user.count();
      const verifiedUsers = await prisma.user.count({
        where: { isVerified: true }
      });
      const activeUsers = await prisma.user.count({
        where: { isActive: true }
      });

      return {
        total: totalUsers,
        verified: verifiedUsers,
        active: activeUsers,
        byRole: stats.reduce((acc, stat) => {
          acc[stat.role.toLowerCase()] = stat._count.id;
          return acc;
        }, {})
      };
    } catch (error) {
      logger.error('Failed to get user statistics', { error: error.message });
      throw error;
    }
  }
}

module.exports = new UserService();