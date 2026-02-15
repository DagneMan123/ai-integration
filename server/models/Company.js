const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
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
  company_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  industry: {
    type: DataTypes.STRING,
    validate: {
      len: [2, 50]
    }
  },
  company_size: {
    type: DataTypes.ENUM('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'),
    defaultValue: '1-10'
  },
  description: {
    type: DataTypes.TEXT
  },
  website: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  logo: {
    type: DataTypes.STRING
  },
  address: {
    type: DataTypes.TEXT
  },
  city: {
    type: DataTypes.STRING
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'Ethiopia'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_documents: {
    type: DataTypes.JSON
  },
  subscription_plan: {
    type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
    defaultValue: 'free'
  },
  ai_credits: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  subscription_expires: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'companies'
});

module.exports = Company;