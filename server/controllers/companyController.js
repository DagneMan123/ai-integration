const Company = require('../models/Company');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloud } = require('../utils/cloudStorage');

// Get all companies
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 10 } = req.query;

    const query = { isVerified: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (industry) query.industry = industry;

    const companies = await Company.find(query)
      .select('name logo industry description website')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await Company.countDocuments(query);

    res.json({
      success: true,
      data: companies,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single company
exports.getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// Get my company
exports.getMyCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user.id });

    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// Update company
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return next(new AppError('Company not found', 404));
    }

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// Upload logo
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    const logoUrl = await uploadToCloud(req.file, 'logos');

    const company = await Company.findOneAndUpdate(
      { userId: req.user.id },
      { logo: logoUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl }
    });
  } catch (error) {
    next(error);
  }
};
