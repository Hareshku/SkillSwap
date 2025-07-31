import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Skill = sequelize.define('Skill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'skills',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_approved']
    },
    {
      fields: ['usage_count']
    }
  ]
});

// User Skills junction table for tracking user's skills and proficiency
const UserSkill = sequelize.define('UserSkill', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'skills',
      key: 'id'
    }
  },
  proficiency_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false
  },
  can_teach: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  wants_to_learn: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  years_of_experience: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 50
    }
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether this skill has been verified through feedback or assessments'
  },
  endorsement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'user_skills',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'skill_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['skill_id']
    },
    {
      fields: ['can_teach']
    },
    {
      fields: ['wants_to_learn']
    }
  ]
});

export { Skill, UserSkill };
export default Skill;
