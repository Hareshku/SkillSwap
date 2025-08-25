import sequelize, { testConnection } from '../config/database.js';
import User from './User.js';
import Post from './Post.js';
import Message from './Message.js';
import Meeting from './Meeting.js';
import Report from './Report.js';
import { Badge, UserBadge } from './Badge.js';
import Feedback from './Feedback.js';
import { Skill, UserSkill } from './Skill.js';
import Connection from './Connection.js';
import RecommendationTracking from './RecommendationTracking.js';
import Contact from './Contact.js';
import Review from './Review.js';

// Define associations

// User associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
User.hasMany(Meeting, { foreignKey: 'organizer_id', as: 'organizedMeetings' });
User.hasMany(Meeting, { foreignKey: 'participant_id', as: 'participatedMeetings' });
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reportsMade' });
User.hasMany(Report, { foreignKey: 'reported_user_id', as: 'reportsReceived' });
User.hasMany(Feedback, { foreignKey: 'giver_id', as: 'feedbackGiven' });
User.hasMany(Feedback, { foreignKey: 'receiver_id', as: 'feedbackReceived' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven' });
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'reviewsReceived' });

// User-Badge many-to-many relationship
User.belongsToMany(Badge, {
  through: UserBadge,
  foreignKey: 'user_id',
  otherKey: 'badge_id',
  as: 'badges'
});
Badge.belongsToMany(User, {
  through: UserBadge,
  foreignKey: 'badge_id',
  otherKey: 'user_id',
  as: 'users'
});

// User-Skill many-to-many relationship
User.belongsToMany(Skill, {
  through: UserSkill,
  foreignKey: 'user_id',
  otherKey: 'skill_id',
  as: 'skills'
});
Skill.belongsToMany(User, {
  through: UserSkill,
  foreignKey: 'skill_id',
  otherKey: 'user_id',
  as: 'users'
});

// Post associations
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });
Post.hasMany(Meeting, { foreignKey: 'post_id', as: 'meetings' });
Post.hasMany(Report, { foreignKey: 'reported_post_id', as: 'reports' });
Post.hasMany(Feedback, { foreignKey: 'post_id', as: 'feedback' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Message, { foreignKey: 'reply_to_message_id', as: 'replyToMessage' });

// Meeting associations
Meeting.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });
Meeting.belongsTo(User, { foreignKey: 'participant_id', as: 'participant' });
Meeting.belongsTo(User, { foreignKey: 'cancelled_by', as: 'cancelledBy' });
Meeting.belongsTo(Post, { foreignKey: 'post_id', as: 'relatedPost' });
Meeting.hasMany(Feedback, { foreignKey: 'meeting_id', as: 'feedback' });
Meeting.hasMany(Review, { foreignKey: 'meeting_id', as: 'reviews' });

// Report associations
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reported_user_id', as: 'reportedUser' });
Report.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });
Report.belongsTo(Post, { foreignKey: 'reported_post_id', as: 'reportedPost' });

// Feedback associations
Feedback.belongsTo(User, { foreignKey: 'giver_id', as: 'giver' });
Feedback.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Feedback.belongsTo(Meeting, { foreignKey: 'meeting_id', as: 'meeting' });
Feedback.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Review associations
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });
Review.belongsTo(Meeting, { foreignKey: 'meeting_id', as: 'meeting' });

// UserBadge associations
UserBadge.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserBadge.belongsTo(Badge, { foreignKey: 'badge_id', as: 'badge' });

// UserSkill associations
UserSkill.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserSkill.belongsTo(Skill, { foreignKey: 'skill_id', as: 'skill' });

// Skill associations
Skill.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// Connection associations
Connection.belongsTo(User, { foreignKey: 'requester_id', as: 'requester' });
Connection.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
User.hasMany(Connection, { foreignKey: 'requester_id', as: 'sentConnections' });
User.hasMany(Connection, { foreignKey: 'receiver_id', as: 'receivedConnections' });

// RecommendationTracking associations
User.hasMany(RecommendationTracking, { foreignKey: 'user_id', as: 'recommendationInteractions' });
Post.hasMany(RecommendationTracking, { foreignKey: 'recommended_post_id', as: 'recommendationTracking' });
RecommendationTracking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
RecommendationTracking.belongsTo(Post, { foreignKey: 'recommended_post_id', as: 'post' });

// Contact associations
Contact.belongsTo(User, { foreignKey: 'responded_by', as: 'responder' });
User.hasMany(Contact, { foreignKey: 'responded_by', as: 'contactResponses' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully.');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
};

export {
  sequelize,
  testConnection,
  User,
  Post,
  Message,
  Meeting,
  Report,
  Badge,
  UserBadge,
  Feedback,
  Skill,
  UserSkill,
  Connection,
  RecommendationTracking,
  Contact,
  Review,
  syncDatabase
};

export default {
  sequelize,
  testConnection,
  User,
  Post,
  Message,
  Meeting,
  Report,
  Badge,
  UserBadge,
  Feedback,
  Skill,
  UserSkill,
  Connection,
  RecommendationTracking,
  Contact,
  Review,
  syncDatabase
};
