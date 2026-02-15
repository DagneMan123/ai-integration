const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CandidateProfile = sequelize.define('CandidateProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    validate: {
      len: [2, 100]
    }
  },
  bio: {
    type: DataTypes.TEXT
  },
  experience_level: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    defaultValue: 'entry'
  },
  skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  education: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  experience: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  resume_url: {
    type: DataTypes.STRING
  },
  portfolio_url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  linkedin_url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  github_url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  location: {
    type: DataTypes.STRING
  },
  availability: {
    type: DataTypes.ENUM('immediate', '2weeks', '1month', '3months'),
    defaultValue: 'immediate'
  },
  salary_expectation: {
    type: DataTypes.INTEGER
  },
  ai_score: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  total_interviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successful_interviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  public_profile: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'candidate_profiles'
});

module.exports = CandidateProfile;