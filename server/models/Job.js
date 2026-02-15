const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  company_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT
  },
  responsibilities: {
    type: DataTypes.TEXT
  },
  required_skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  optional_skills: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  experience_level: {
    type: DataTypes.ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive'),
    allowNull: false
  },
  job_type: {
    type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'internship', 'remote'),
    defaultValue: 'full-time'
  },
  location: {
    type: DataTypes.STRING
  },
  salary_min: {
    type: DataTypes.INTEGER
  },
  salary_max: {
    type: DataTypes.INTEGER
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETB'
  },
  interview_type: {
    type: DataTypes.ENUM('technical', 'behavioral', 'mixed', 'coding'),
    defaultValue: 'mixed'
  },
  difficulty_level: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  questions_count: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    validate: {
      min: 5,
      max: 50
    }
  },
  time_limit: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Time limit in minutes'
  },
  passing_score: {
    type: DataTypes.INTEGER,
    defaultValue: 70,
    validate: {
      min: 0,
      max: 100
    }
  },
  enable_coding: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  enable_video: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'active', 'paused', 'closed'),
    defaultValue: 'draft'
  },
  applications_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expires_at: {
    type: DataTypes.DATE
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'jobs'
});

module.exports = Job;