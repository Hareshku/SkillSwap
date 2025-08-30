import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  participant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  meeting_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isAfter: new Date().toISOString()
    }
  },
  duration_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    validate: {
      min: 15,
      max: 480
    }
  },
  meeting_type: {
    type: DataTypes.ENUM('online', 'offline'),
    allowNull: false
  },
  meeting_link: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Google Meet, Zoom, or other meeting platform link'
  },
  location: {
    type: DataTypes.STRING(300),
    allowNull: true,
    comment: 'Physical location for offline meetings'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'in_progress', 'declined'),
    defaultValue: 'pending'
  },
  google_calendar_event_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Google Calendar event ID for integration'
  },
  organizer_timezone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  participant_timezone: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  feedback_given: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Meeting notes or agenda'
  },
  cancelled_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  cancellation_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelled_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the meeting was confirmed by participant'
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the meeting was started (someone joined the link)'
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the meeting was marked as completed'
  },
  declined_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'When the meeting was declined by participant'
  },
  decline_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for declining the meeting'
  }
}, {
  tableName: 'meetings',
  indexes: [
    {
      fields: ['organizer_id']
    },
    {
      fields: ['participant_id']
    },
    {
      fields: ['meeting_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['post_id']
    }
  ]
});

export default Meeting;
