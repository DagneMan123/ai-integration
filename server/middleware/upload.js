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

module.exports = { upload };
