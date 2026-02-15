const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
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
  transaction_reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  chapa_reference: {
    type: DataTypes.STRING,
    unique: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'ETB'
  },
  payment_method: {
    type: DataTypes.ENUM('telebirr', 'cbe', 'awash', 'abyssinia', 'visa', 'mastercard'),
    allowNull: false
  },
  payment_type: {
    type: DataTypes.ENUM('interview', 'subscription', 'credits', 'premium_report'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  description: {
    type: DataTypes.STRING
  },
  metadata: {
    type: DataTypes.JSON
  },
  chapa_response: {
    type: DataTypes.JSON
  },
  webhook_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  processed_at: {
    type: DataTypes.DATE
  },
  expires_at: {
    type: DataTypes.DATE
  },
  refund_reason: {
    type: DataTypes.STRING
  },
  refunded_at: {
    type: DataTypes.DATE
  },
  invoice_number: {
    type: DataTypes.STRING,
    unique: true
  }
}, {
  tableName: 'payments',
  hooks: {
    beforeCreate: (payment) => {
      // Generate invoice number
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      payment.invoice_number = `INV-${date}-${random}`;
    }
  }
});

module.exports = Payment;