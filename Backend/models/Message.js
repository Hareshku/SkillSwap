import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Unique identifier for conversation between two users'
  },
  sender_id: {
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
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'meeting_request'),
    defaultValue: 'text'
  },
  attachment_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_deleted_by_sender: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_deleted_by_receiver: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reply_to_message_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'messages',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  indexes: [
    {
      fields: ['conversation_id']
    },
    {
      fields: ['sender_id']
    },
    {
      fields: ['receiver_id']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_read']
    }
  ]
});

export default Message;
