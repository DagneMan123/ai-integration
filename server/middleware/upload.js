const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');

// Configure storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allow both document and video types
  const allowedDocTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const allowedVideoTypes = /webm|mp4|mov|avi/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();
  
  const isDocValid = allowedDocTypes.test(extname) && (
    allowedDocTypes.test(mimetype) || 
    mimetype.includes('pdf') || 
    mimetype.includes('word') ||
    mimetype.includes('document')
  );
  const isVideoValid = allowedVideoTypes.test(extname) && mimetype.startsWith('video/');

  if (isDocValid || isVideoValid) {
    return cb(null, true);
  } else {
    cb(new AppError(`Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, WebM, MP4, MOV, AVI allowed. Received: ${mimetype}`, 400));
  }
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB for videos
  },
  fileFilter: fileFilter
});

// Optional upload middleware - doesn't fail if no file is provided
const uploadOptional = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    // If there's a file size error, reject it
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File too large. Maximum size is 100MB. Received: ${(err.limit / 1024 / 1024).toFixed(2)}MB`, 413));
    }
    
    // If there's a file count error, reject it
    if (err instanceof multer.MulterError && err.code === 'LIMIT_PART_COUNT') {
      return next(new AppError('Too many file parts', 400));
    }
    
    // If there's any other multer error, reject it
    if (err instanceof multer.MulterError) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    
    // If there's any other error, reject it
    if (err) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    
    // Continue - file may or may not be present
    next();
  });
};

// Streaming upload middleware for large files
const uploadStream = (req, res, next) => {
  upload.single('video')(req, res, (err) => {
    // Handle errors with proper status codes
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(`File too large. Maximum size is 100MB. Received: ${(err.limit / 1024 / 1024).toFixed(2)}MB`, 413));
      }
      if (err.code === 'LIMIT_PART_COUNT') {
        return next(new AppError('Too many file parts', 400));
      }
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    
    if (err) {
      return next(new AppError(`Upload error: ${err.message}`, 400));
    }
    
    // Validate file if present
    if (req.file) {
      if (!req.file.buffer || req.file.buffer.length === 0) {
        return next(new AppError('Uploaded file is empty', 400));
      }
    }
    
    next();
  });
};

module.exports = { upload, uploadOptional, uploadStream };
