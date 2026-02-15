const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Interview = sequelize.define('Interview', {
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
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('practice', 'job_application'),
    allowNull: false,
    defaultValue: 'practice'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'expired'),
    defaultValue: 'scheduled'
  },
  questions: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  responses: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  ai_evaluation: {
    type: DataTypes.JSON
  },
  overall_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  technical_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  communication_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  problem_solving_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  culture_fit_score: {
    type: DataTypes.DECIMAL(5, 2),
    validate: {
      min: 0,
      max: 100
    }
  },
  started_at: {
    type: DataTypes.DATE
  },
  completed_at: {
    type: DataTypes.DATE
  },
  duration: {
    type: DataTypes.INTEGER,
    comment: 'Duration in minutes'
  },
  time_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Time limit in minutes'
  },
  cheating_flags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  cheating_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  feedback: {
    type: DataTypes.TEXT
  },
  recommendation: {
    type: DataTypes.ENUM('strongly_recommend', 'recommend', 'neutral', 'not_recommend', 'strongly_not_recommend')
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  payment_id: {
    type: DataTypes.UUID,
    references: {
      model: 'payments',
      key: 'id'
    }
  }
}, {
  tableName: 'interviews'
});

module.exports = Interview;