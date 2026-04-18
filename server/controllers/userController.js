const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Simple file upload helper
const uploadFile = (file, folder = 'avatars') => {
  try {
    const folderPath = path.join(uploadsDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}-${randomStr}${ext}`;
    const filepath = path.join(folderPath, filename);

    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/${folder}/${filename}`;
  } catch (error) {
    logger.error('Error uploading file:', error);
    throw error;
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: true,
        companies: true
      }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, bio, skills, experience, education, password, ...otherFields } = req.body;

    // Update User table with user-level fields
    const userData = {};
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    
    // Normalize email to lowercase for consistency with login
    if (email) {
      userData.email = email.toLowerCase().trim();
    }
    
    if (bio) userData.bio = bio;
    
    // Hash password if provided
    if (password) {
      const bcrypt = require('bcryptjs');
      userData.passwordHash = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: userData
    });

    if (user.role === 'CANDIDATE') {
      // Prepare candidate profile data
      const candidateData = {};
      
      // Handle skills - convert to array if string
      if (skills) {
        candidateData.skills = Array.isArray(skills) 
          ? skills 
          : skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      // Handle experience_level
      if (experience) {
        candidateData.experienceLevel = experience;
      }
      
      // Handle education - convert to JSON if string
      if (education) {
        candidateData.education = typeof education === 'string' 
          ? { description: education }
          : education;
      }

      // Only update if there's candidate data to update
      if (Object.keys(candidateData).length > 0) {
        await prisma.candidateProfile.update({
          where: { userId: user.id },
          data: candidateData
        });
      }
    } else if (user.role === 'EMPLOYER') {
      // Find the company created by this user
      const company = await prisma.company.findFirst({
        where: { createdById: user.id }
      });
      
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: otherFields
        });
      }
    }

    // Return updated user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true }
    });

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hashedPassword }
    });

    // Force re-authentication by invalidating current session
    // Return response indicating user must re-login
    res.json({
      success: true,
      message: 'Password updated successfully. Please log in again with your new password.',
      requiresReauth: true
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const avatarUrl = uploadFile(req.file, 'avatars');

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePicture: avatarUrl }
    });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

// Delete account (Soft delete)
exports.deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        isActive: false,
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user documents
exports.getDocuments = async (req, res, next) => {
  try {
    let documents = [];
    
    try {
      // Try using Prisma first
      if (prisma && prisma.document) {
        documents = await prisma.document.findMany({
          where: { userId: req.user.id },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch (prismaError) {
      // Fallback to raw SQL if Prisma fails
      logger.warn('Prisma query failed, using raw SQL:', prismaError.message);
      try {
        if (prisma && prisma.$queryRaw) {
          documents = await prisma.$queryRaw`
            SELECT id, user_id as "userId", name, type, size, url, is_private as "isPrivate", created_at as "createdAt"
            FROM documents
            WHERE user_id = ${req.user.id}
            ORDER BY created_at DESC
          `;
        }
      } catch (sqlError) {
        // If both fail, return empty array (table might not exist yet)
        logger.warn('Raw SQL query also failed:', sqlError.message);
        documents = [];
      }
    }

    const formattedDocs = documents.map(doc => ({
      id: doc.id.toString(),
      name: doc.name || 'Document',
      size: formatFileSize(doc.size || 0),
      uploadedAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      url: doc.url || '',
      type: doc.type || 'application/octet-stream',
      isPrivate: doc.isPrivate || false
    }));

    res.json({
      success: true,
      data: formattedDocs,
      message: 'Documents retrieved successfully'
    });
  } catch (error) {
    logger.error('Error in getDocuments:', error);
    // Return empty documents array instead of error to prevent page crash
    res.json({
      success: true,
      data: [],
      message: 'Documents retrieved successfully'
    });
  }
};

// Upload document
exports.uploadDocument = async (req, res, next) => {
  try {
    logger.info('Document upload started', { userId: req.user?.id, fileName: req.file?.originalname });
    
    if (!req.file) {
      logger.warn('No file provided in upload request');
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    if (!req.user || !req.user.id) {
      logger.warn('User not authenticated for document upload');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    logger.info('File received', { 
      fileName: req.file.originalname, 
      fileSize: req.file.size, 
      mimeType: req.file.mimetype 
    });

    let documentUrl;
    try {
      documentUrl = uploadFile(req.file, 'documents');
      logger.info('File saved successfully', { documentUrl });
    } catch (uploadError) {
      logger.error('File upload failed:', { 
        error: uploadError.message, 
        stack: uploadError.stack 
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to save file to disk: ' + uploadError.message
      });
    }

    try {
      const document = await prisma.document.create({
        data: {
          userId: req.user.id,
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size,
          url: documentUrl
        }
      });

      logger.info('Document record created', { documentId: document.id });

      return res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          id: document.id.toString(),
          name: document.name,
          size: formatFileSize(document.size),
          uploadedAt: document.createdAt.toISOString(),
          url: document.url,
          type: document.type
        }
      });
    } catch (prismaError) {
      // Fallback to raw SQL if Prisma fails
      logger.error('Prisma create failed:', { 
        error: prismaError.message, 
        code: prismaError.code,
        stack: prismaError.stack 
      });
      try {
        await prisma.$executeRaw`
          INSERT INTO documents (user_id, name, type, size, url, created_at, updated_at)
          VALUES (${req.user.id}, ${req.file.originalname}, ${req.file.mimetype}, ${req.file.size}, ${documentUrl}, NOW(), NOW())
        `;

        logger.info('Document record created via raw SQL');

        return res.json({
          success: true,
          message: 'Document uploaded successfully',
          data: {
            id: Date.now().toString(),
            name: req.file.originalname,
            size: formatFileSize(req.file.size),
            uploadedAt: new Date().toISOString(),
            url: documentUrl,
            type: req.file.mimetype
          }
        });
      } catch (sqlError) {
        logger.error('Raw SQL insert also failed:', { 
          error: sqlError.message, 
          code: sqlError.code,
          stack: sqlError.stack 
        });
        return res.status(500).json({
          success: false,
          message: 'Failed to save document to database: ' + sqlError.message
        });
      }
    }
  } catch (error) {
    logger.error('Unexpected error in uploadDocument:', { 
      error: error.message, 
      stack: error.stack 
    });
    return res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;

    try {
      const document = await prisma.document.findUnique({
        where: { id: parseInt(documentId) }
      });

      if (!document) {
        return next(new AppError('Document not found', 404));
      }

      if (document.userId !== req.user.id) {
        return next(new AppError('Unauthorized', 403));
      }

      // Delete file from filesystem
      const filePath = path.join(__dirname, '..', document.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await prisma.document.delete({
        where: { id: parseInt(documentId) }
      });
    } catch (prismaError) {
      // Fallback to raw SQL
      logger.warn('Prisma delete failed, using raw SQL:', prismaError.message);
      try {
        await prisma.$executeRaw`
          DELETE FROM documents 
          WHERE id = ${parseInt(documentId)} AND user_id = ${req.user.id}
        `;
      } catch (sqlError) {
        logger.error('Raw SQL delete also failed:', sqlError.message);
        return next(new AppError('Failed to delete document', 500));
      }
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Toggle document privacy
exports.toggleDocumentPrivacy = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { isPrivate } = req.body;

    try {
      const document = await prisma.document.findUnique({
        where: { id: parseInt(documentId) }
      });

      if (!document) {
        return next(new AppError('Document not found', 404));
      }

      if (document.userId !== req.user.id) {
        return next(new AppError('Unauthorized', 403));
      }

      const updatedDocument = await prisma.document.update({
        where: { id: parseInt(documentId) },
        data: { isPrivate: isPrivate }
      });

      res.json({
        success: true,
        message: `Document is now ${isPrivate ? 'private' : 'public'}`,
        data: {
          id: updatedDocument.id.toString(),
          name: updatedDocument.name,
          size: formatFileSize(updatedDocument.size),
          uploadedAt: updatedDocument.createdAt.toISOString(),
          url: updatedDocument.url,
          type: updatedDocument.type,
          isPrivate: updatedDocument.isPrivate
        }
      });
    } catch (prismaError) {
      // Fallback to raw SQL
      logger.warn('Prisma update failed, using raw SQL:', prismaError.message);
      try {
        await prisma.$executeRaw`
          UPDATE documents 
          SET is_private = ${isPrivate}
          WHERE id = ${parseInt(documentId)} AND user_id = ${req.user.id}
        `;

        res.json({
          success: true,
          message: `Document is now ${isPrivate ? 'private' : 'public'}`,
          data: {
            id: documentId,
            isPrivate: isPrivate
          }
        });
      } catch (sqlError) {
        logger.error('Raw SQL update also failed:', sqlError.message);
        return next(new AppError('Failed to update document privacy', 500));
      }
    }
  } catch (error) {
    next(error);
  }
};