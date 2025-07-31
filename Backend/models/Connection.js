import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Connection = sequelize.define('Connection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  requester_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'blocked'),
    allowNull: false,
    defaultValue: 'pending'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'connections',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['requester_id', 'receiver_id']
    },
    {
      fields: ['receiver_id']
    },
    {
      fields: ['status']
    }
  ],
  validate: {
    // Prevent self-connections
    notSelfConnection() {
      if (this.requester_id === this.receiver_id) {
        throw new Error('Cannot create connection with yourself');
      }
    }
  }
});

export default Connection;
