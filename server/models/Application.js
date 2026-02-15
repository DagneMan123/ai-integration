const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidate_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  job_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  interview_id: {
    type: DataTypes.UUID,
    references: {
      model: 'interviews',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('applied', 'interview_scheduled', 'interview_completed', 'under_review', 'shortlisted', 'rejected', 'hired'),
    defaultValue: 'applied'
  },
  cover_letter: {
    type: DataTypes.TEXT
  },
  resume_url: {
    type: DataTypes.STRING
  },
  ai_match_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  employer_notes: {
    type: DataTypes.TEXT
  },
  rejection_reason: {
    type: DataTypes.STRING
  },
  interview_scheduled_at: {
    type: DataTypes.DATE
  },
  reviewed_at: {
    type: DataTypes.DATE
  },
  reviewed_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'applications'
});

module.exports = Application;