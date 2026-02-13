const { sequelize } = require('../config/database');
const User = require('./User');
const Company = require('./Company');
const CandidateProfile = require('./CandidateProfile');
const Job = require('./Job');
const Interview = require('./Interview');
const Payment = require('./Payment');
const Application = require('./Application');
const ActivityLog = require('./ActivityLog');

// Define associations
User.hasOne(Company, { foreignKey: 'user_id', as: 'company' });
Company.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(CandidateProfile, { foreignKey: 'user_id', as: 'candidateProfile' });
CandidateProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Company.hasMany(Job, { foreignKey: 'company_id', as: 'jobs' });
Job.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

User.hasMany(Interview, { foreignKey: 'candidate_id', as: 'interviews' });
Interview.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

Job.hasMany(Interview, { foreignKey: 'job_id', as: 'interviews' });
Interview.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

User.hasMany(Payment, { foreignKey: 'user_id', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Interview.belongsTo(Payment, { foreignKey: 'payment_id', as: 'payment' });
Payment.hasOne(Interview, { foreignKey: 'payment_id', as: 'interview' });

User.hasMany(Application, { foreignKey: 'candidate_id', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

Interview.hasOne(Application, { foreignKey: 'interview_id', as: 'application' });
Application.belongsTo(Interview, { foreignKey: 'interview_id', as: 'interview' });

User.hasMany(ActivityLog, { foreignKey: 'user_id', as: 'activityLogs' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Employer review association
Application.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

module.exports = {
  sequelize,
  User,
  Company,
  CandidateProfile,
  Job,
  Interview,
  Payment,
  Application,
  ActivityLog
};