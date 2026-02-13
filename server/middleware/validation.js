const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .optional()
    .isIn(['candidate', 'employer'])
    .withMessage('Role must be either candidate or employer'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Job validation rules
const validateJob = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Job title must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Job description must be at least 10 characters long'),
  body('required_skills')
    .isArray({ min: 1 })
    .withMessage('At least one required skill must be specified'),
  body('experience_level')
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level'),
  body('job_type')
    .optional()
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Invalid job type'),
  body('salary_min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('salary_max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('interview_type')
    .optional()
    .isIn(['technical', 'behavioral', 'mixed', 'coding'])
    .withMessage('Invalid interview type'),
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Invalid difficulty level'),
  body('questions_count')
    .optional()
    .isInt({ min: 5, max: 50 })
    .withMessage('Questions count must be between 5 and 50'),
  body('time_limit')
    .optional()
    .isInt({ min: 15, max: 180 })
    .withMessage('Time limit must be between 15 and 180 minutes'),
  body('passing_score')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  handleValidationErrors
];

// Company validation rules
const validateCompany = [
  body('company_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('industry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Industry must be between 2 and 50 characters'),
  body('company_size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Invalid company size'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  handleValidationErrors
];

// Candidate profile validation rules
const validateCandidateProfile = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio must not exceed 1000 characters'),
  body('experience_level')
    .optional()
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'executive'])
    .withMessage('Invalid experience level'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('portfolio_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid portfolio URL'),
  body('linkedin_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid LinkedIn URL'),
  body('github_url')
    .optional()
    .isURL()
    .withMessage('Please provide a valid GitHub URL'),
  body('availability')
    .optional()
    .isIn(['immediate', '2weeks', '1month', '3months'])
    .withMessage('Invalid availability option'),
  body('salary_expectation')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Salary expectation must be a positive number'),
  handleValidationErrors
];

// Payment validation rules
const validatePayment = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('payment_method')
    .isIn(['telebirr', 'cbe', 'awash', 'abyssinia', 'visa', 'mastercard'])
    .withMessage('Invalid payment method'),
  body('payment_type')
    .isIn(['interview', 'subscription', 'credits', 'premium_report'])
    .withMessage('Invalid payment type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  handleValidationErrors
];

// Parameter validation
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateJob,
  validateCompany,
  validateCandidateProfile,
  validatePayment,
  validateUUID,
  validatePagination,
  handleValidationErrors
};