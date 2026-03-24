const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');

// Get subscription plans
exports.getSubscriptionPlans = async (req, res) => {
  try {
    let plans = [];
    
    try {
      plans = await prisma.subscriptionPlan.findMany({
        orderBy: { price: 'asc' }
      });
    } catch (dbError) {
      logger.warn('SubscriptionPlan table may not exist yet:', dbError.message);
      // Return default plans if table doesn't exist
      return res.json({
        success: true,
        data: [
          {
            id: 1,
            name: 'Basic',
            description: 'Perfect for getting started',
            price: 5,
            currency: 'ETB',
            duration: 30,
            features: ['5 interviews per month', 'Basic analytics', 'Email support'],
            isActive: true
          },
          {
            id: 2,
            name: 'Professional',
            description: 'For serious job seekers',
            price: 15,
            currency: 'ETB',
            duration: 30,
            features: ['20 interviews per month', 'Advanced analytics', 'Priority support', 'Interview feedback'],
            isActive: true
          },
          {
            id: 3,
            name: 'Premium',
            description: 'Unlimited access',
            price: 30,
            currency: 'ETB',
            duration: 30,
            features: ['Unlimited interviews', 'Full analytics', '24/7 support', 'AI coaching', 'Resume review'],
            isActive: true
          }
        ],
        message: 'Database tables not yet created. Run migration: npm run migrate'
      });
    }

    // If no plans exist, create default ones
    if (plans.length === 0) {
      try {
        plans = await prisma.$transaction([
          prisma.subscriptionPlan.create({
            data: {
              name: 'Basic',
              description: 'Perfect for getting started',
              price: 5,
              currency: 'ETB',
              duration: 30,
              features: ['5 interviews per month', 'Basic analytics', 'Email support'],
              isActive: true
            }
          }),
          prisma.subscriptionPlan.create({
            data: {
              name: 'Professional',
              description: 'For serious job seekers',
              price: 15,
              currency: 'ETB',
              duration: 30,
              features: ['20 interviews per month', 'Advanced analytics', 'Priority support', 'Interview feedback'],
              isActive: true
            }
          }),
          prisma.subscriptionPlan.create({
            data: {
              name: 'Premium',
              description: 'Unlimited access',
              price: 30,
              currency: 'ETB',
              duration: 30,
              features: ['Unlimited interviews', 'Full analytics', '24/7 support', 'AI coaching', 'Resume review'],
              isActive: true
            }
          })
        ]);
      } catch (createError) {
        logger.warn('Could not create default plans:', createError.message);
      }
    }

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error('Error fetching subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription plans',
      error: error.message
    });
  }
};

// Get employer subscription
exports.getEmployerSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { employerId: userId },
      include: { plan: true }
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: null,
        message: 'No active subscription'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    logger.error('Error fetching employer subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { planId, paymentMethod } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Verify plan exists
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Cancel existing subscription if any
    await prisma.subscription.updateMany({
      where: { employerId: userId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' }
    });

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        employerId: userId,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        paymentMethod: paymentMethod || 'CHAPA'
      },
      include: { plan: true }
    });

    res.status(201).json({
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { employerId: userId, status: 'ACTIVE' }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: { plan: true }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    logger.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Get subscription history
exports.getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const history = await prisma.subscription.findMany({
      where: { employerId: userId },
      include: { plan: true },
      orderBy: { startDate: 'desc' }
    });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error fetching subscription history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription history',
      error: error.message
    });
  }
};

// Check subscription status
exports.checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await prisma.subscription.findFirst({
      where: { employerId: userId, status: 'ACTIVE' },
      include: { plan: true }
    });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          isActive: false,
          message: 'No active subscription'
        }
      });
    }

    const now = new Date();
    const isExpired = subscription.endDate < now;

    if (isExpired) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' }
      });

      return res.json({
        success: true,
        data: {
          isActive: false,
          message: 'Subscription has expired'
        }
      });
    }

    res.json({
      success: true,
      data: {
        isActive: true,
        subscription,
        daysRemaining: Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24))
      }
    });
  } catch (error) {
    logger.error('Error checking subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check subscription status',
      error: error.message
    });
  }
};
