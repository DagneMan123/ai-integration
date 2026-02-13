const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('candidate', 'employer', 'admin'),
    allowNull: false,
    defaultValue: 'candidate'
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      len: [10, 15]
    }
  },
  profile_image: {
    type: DataTypes.STRING
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  verification_token: {
    type: DataTypes.STRING
  },
  reset_password_token: {
    type: DataTypes.STRING
  },
  reset_password_expires: {
    type: DataTypes.DATE
  },
  last_login: {
    type: DataTypes.DATE
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.isLocked = function() {
  return !!(this.locked_until && this.locked_until > Date.now());
};

User.prototype.incrementLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.locked_until && this.locked_until < Date.now()) {
    return this.update({
      login_attempts: 1,
      locked_until: null
    });
  }

  const updates = { login_attempts: this.login_attempts + 1 };
  
  if (this.login_attempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.locked_until = Date.now() + lockTime;
  }

  return this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return this.update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  });
};

module.exports = User;