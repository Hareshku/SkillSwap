import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reviewer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who is giving the review'
  },
  reviewee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who is being reviewed'
  },
  meeting_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'meetings',
      key: 'id'
    },
    comment: 'Optional: Meeting this review is related to'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating from 1 to 5 stars'
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 1000]
    },
    comment: 'Written feedback about the skill exchange experience'
  },
  skills_exchanged: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of skills that were exchanged in this session'
  },
  exchange_type: {
    type: DataTypes.ENUM('teaching', 'learning', 'mutual_exchange'),
    allowNull: false,
    comment: 'Type of skill exchange that took place'
  },
  communication_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating for communication skills (1-5)'
  },
  knowledge_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating for knowledge/expertise (1-5)'
  },
  punctuality_rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    },
    comment: 'Rating for punctuality (1-5)'
  },
  would_recommend: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether the reviewer would recommend this person to others'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this review has been verified by admin'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this review is publicly visible'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Admin notes about this review'
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['reviewee_id']
    },
    {
      fields: ['reviewer_id']
    },
    {
      fields: ['rating']
    },
    {
      fields: ['is_public']
    },
    {
      unique: true,
      fields: ['reviewer_id', 'reviewee_id', 'meeting_id'],
      name: 'unique_review_per_meeting'
    }
  ]
});

export default Review;