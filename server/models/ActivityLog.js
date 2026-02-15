const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ActivityLog = sequelize.define('ActivityLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resource_id: {
    type: DataTypes.UUID
  },
  details: {
    type: DataTypes.JSON
  },
  ip_address: {
    type: DataTypes.INET
  },
  user_agent: {
    type: DataTypes.TEXT
  },
  severity: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
    defaultValue: 'info'
  }
}, {
  tableName: 'activity_logs'
});

module.exports = ActivityLog;