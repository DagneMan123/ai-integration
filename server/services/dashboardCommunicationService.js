const prisma = require('../lib/prisma');
const { logger } = require('../utils/logger');

/**
 * Dashboard Communication Service
 * Handles real-time communication between all 3 dashboards
 * All communications are saved to database for persistence
 */

class DashboardCommunicationService {
  constructor() {
    this.subscribers = new Map();
    this.messageQueue = [];
  }

  /**
   * Subscribe to dashboard events
   */
  subscribe(dashboard, callback) {
    if (!this.subscribers.has(dashboard)) {
      this.subscribers.set(dashboard, []);
    }
    this.subscribers.get(dashboard).push(callback);
    
    return () => {
      const callbacks = this.subscribers.get(dashboard);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Broadcast message to all dashboards
   */
  async broadcast(fromDashboard, eventType, data) {
    try {
      // Check if table exists
      if (!prisma.dashboardMessage) {
        logger.warn('DashboardMessage table not available - run migrations');
        return null;
      }

      // Save to database
      const message = await prisma.dashboardMessage.create({
        data: {
          fromDashboard,
          eventType,
          data: JSON.stringify(data),
          timestamp: new Date()
        }
      }).catch(err => {
        logger.warn('Failed to save message to database:', err.message);
        return null;
      });

      // Notify all subscribers
      for (const [dashboard, callbacks] of this.subscribers) {
        if (dashboard !== fromDashboard) {
          callbacks.forEach(callback => {
            try {
              callback({
                id: message?.id,
                fromDashboard,
                eventType,
                data,
                timestamp: message?.timestamp || new Date()
              });
            } catch (error) {
              logger.error('Error in callback:', error);
            }
          });
        }
      }

      return message;
    } catch (error) {
      logger.error('Error broadcasting message:', error);
      // Don't throw - allow app to continue
      return null;
    }
  }

  /**
   * Send direct message from one dashboard to another
   */
  async sendMessage(fromDashboard, toDashboard, eventType, data) {
    try {
      // Save to database
      const message = await prisma.dashboardMessage.create({
        data: {
          fromDashboard,
          toDashboard,
          eventType,
          data: JSON.stringify(data),
          timestamp: new Date()
        }
      });

      // Notify specific dashboard
      if (this.subscribers.has(toDashboard)) {
        this.subscribers.get(toDashboard).forEach(callback => {
          try {
            callback({
              id: message.id,
              fromDashboard,
              toDashboard,
              eventType,
              data,
              timestamp: message.timestamp
            });
          } catch (error) {
            logger.error('Error in callback:', error);
          }
        });
      }

      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get message history
   */
  async getMessageHistory(dashboard, limit = 50) {
    try {
      // Check if table exists
      if (!prisma.dashboardMessage) {
        logger.warn('DashboardMessage table not available - run migrations');
        return [];
      }

      const messages = await prisma.dashboardMessage.findMany({
        where: {
          OR: [
            { fromDashboard: dashboard },
            { toDashboard: dashboard },
            { toDashboard: null } // Broadcast messages
          ]
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      });

      return messages.map(msg => ({
        id: msg.id,
        fromDashboard: msg.fromDashboard,
        toDashboard: msg.toDashboard,
        eventType: msg.eventType,
        data: JSON.parse(msg.data),
        timestamp: msg.timestamp
      }));
    } catch (error) {
      logger.error('Error fetching message history:', error);
      // Return empty array instead of throwing to prevent app crash
      return [];
    }
  }

  /**
   * Candidate dashboard notifies others of application update
   */
  async notifyApplicationUpdate(candidateId, applicationId, status) {
    try {
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: { createdBy: true }
          },
          candidate: true
        }
      });

      if (!application) throw new Error('Application not found');

      const data = {
        applicationId,
        candidateId,
        candidateName: application.candidate.name,
        jobTitle: application.job.title,
        employerId: application.job.createdById,
        status,
        timestamp: new Date()
      };

      // Broadcast to employer and admin
      await this.broadcast('candidate', 'APPLICATION_UPDATE', data);

      // Also save to application activity log
      await prisma.applicationActivity.create({
        data: {
          applicationId,
          action: 'STATUS_CHANGED',
          details: JSON.stringify({ oldStatus: application.status, newStatus: status }),
          timestamp: new Date()
        }
      });

      return data;
    } catch (error) {
      logger.error('Error notifying application update:', error);
      throw error;
    }
  }

  /**
   * Employer dashboard notifies others of interview update
   */
  async notifyInterviewUpdate(employerId, interviewId, status) {
    try {
      const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          job: true,
          candidate: true
        }
      });

      if (!interview) throw new Error('Interview not found');

      const data = {
        interviewId,
        candidateId: interview.candidateId,
        candidateName: interview.candidate.name,
        jobTitle: interview.job.title,
        employerId,
        status,
        timestamp: new Date()
      };

      // Broadcast to candidate and admin
      await this.broadcast('employer', 'INTERVIEW_UPDATE', data);

      // Save to interview activity log
      await prisma.interviewActivity.create({
        data: {
          interviewId,
          action: 'STATUS_CHANGED',
          details: JSON.stringify({ oldStatus: interview.status, newStatus: status }),
          timestamp: new Date()
        }
      });

      return data;
    } catch (error) {
      logger.error('Error notifying interview update:', error);
      throw error;
    }
  }

  /**
   * Admin dashboard notifies others of system update
   */
  async notifySystemUpdate(adminId, updateType, data) {
    try {
      const systemUpdate = await prisma.systemUpdate.create({
        data: {
          adminId,
          updateType,
          details: JSON.stringify(data),
          timestamp: new Date()
        }
      });

      const broadcastData = {
        updateId: systemUpdate.id,
        adminId,
        updateType,
        details: data,
        timestamp: systemUpdate.timestamp
      };

      // Broadcast to all dashboards
      await this.broadcast('admin', 'SYSTEM_UPDATE', broadcastData);

      return broadcastData;
    } catch (error) {
      logger.error('Error notifying system update:', error);
      throw error;
    }
  }

  /**
   * Get real-time stats for all dashboards
   */
  async getRealTimeStats() {
    try {
      const stats = {
        totalUsers: await prisma.user.count().catch(() => 0),
        totalJobs: await prisma.job.count().catch(() => 0),
        totalApplications: await prisma.application.count().catch(() => 0),
        totalInterviews: await prisma.interview.count().catch(() => 0),
        activeInterviews: await prisma.interview.count({
          where: { status: 'IN_PROGRESS' }
        }).catch(() => 0),
        pendingApplications: await prisma.application.count({
          where: { status: 'PENDING' }
        }).catch(() => 0),
        recentMessages: prisma.dashboardMessage ? await prisma.dashboardMessage.count({
          where: {
            timestamp: {
              gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
            }
          }
        }).catch(() => 0) : 0,
        timestamp: new Date()
      };

      return stats;
    } catch (error) {
      logger.error('Error getting real-time stats:', error);
      // Return default stats instead of throwing
      return {
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalInterviews: 0,
        activeInterviews: 0,
        pendingApplications: 0,
        recentMessages: 0,
        timestamp: new Date()
      };
    }
  }

  /**
   * Clear old messages (older than 30 days)
   */
  async cleanupOldMessages() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const deleted = await prisma.dashboardMessage.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo
          }
        }
      });

      logger.info(`Cleaned up ${deleted.count} old messages`);
      return deleted;
    } catch (error) {
      logger.error('Error cleaning up old messages:', error);
      throw error;
    }
  }
}

module.exports = new DashboardCommunicationService();
