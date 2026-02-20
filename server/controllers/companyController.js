const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { uploadToCloud } = require('../utils/cloudStorage');

// Get all companies (With search and pagination)
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { search, industry, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build Prisma query object
    const where = {
      isVerified: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry) {
      where.industry = industry;
    }

    // Execute query
    const [companies, count] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          logo: true,
          industry: true,
          description: true,
          website: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.company.count({ where })
    ]);

    res.json({
      success: true,
      data: companies,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single company
exports.getCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.params.id }
    });

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

// Get my company profile
exports.getMyCompany = async (req, res, next) => {
  try {
    const company = await prisma.company.findFirst({
      where: { createdById: req.user.id }
    });

    if (!company) {
      return next(new AppError('Company profile not found. Please complete your company profile first.', 404));
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// Update company profile
exports.updateCompany = async (req, res, next) => {
  try {
    // Validate user is authenticated
    if (!req.user || !req.user.id) {
      return next(new AppError('User not authenticated', 401));
    }

    // Check if company exists first
    const existingCompany = await prisma.company.findFirst({
      where: { createdById: req.user.id }
    });

    if (!existingCompany) {
      return next(new AppError('Company profile not found. Please complete your company profile first.', 404));
    }

    // Validate input data
    const { name, industry, description, website, address } = req.body;
    
    if (!name || !industry) {
      return next(new AppError('Company name and industry are required', 400));
    }

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data: {
        name,
        industry,
        description: description || existingCompany.description,
        website: website || existingCompany.website,
        address: address || existingCompany.address
      }
    });

    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: company
    });
  } catch (error) {
    next(error);
  }
};

// Upload company logo
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please upload a file', 400));
    }

    // Check if company exists
    const existingCompany = await prisma.company.findFirst({
      where: { createdById: req.user.id }
    });

    if (!existingCompany) {
      return next(new AppError('Company profile not found', 404));
    }

    const logoUrl = await uploadToCloud(req.file, 'logos');

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data: { logo: logoUrl }
    });

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl }
    });
  } catch (error) {
    next(error);
  }
};