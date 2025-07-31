import { Badge, testConnection } from '../models/index.js';

const sampleBadges = [
  // Skill Sharing Badges
  {
    name: 'First Teacher',
    description: 'Created your first skill-sharing post',
    badge_type: 'skill_sharing',
    criteria: { posts_created: 1 },
    points_value: 10,
    rarity: 'common',
    color_code: '#10B981'
  },
  {
    name: 'Knowledge Sharer',
    description: 'Created 5 skill-sharing posts',
    badge_type: 'skill_sharing',
    criteria: { posts_created: 5 },
    points_value: 25,
    rarity: 'uncommon',
    color_code: '#3B82F6'
  },
  {
    name: 'Master Teacher',
    description: 'Created 20 skill-sharing posts',
    badge_type: 'skill_sharing',
    criteria: { posts_created: 20 },
    points_value: 100,
    rarity: 'rare',
    color_code: '#8B5CF6'
  },

  // Community Engagement Badges
  {
    name: 'First Connection',
    description: 'Made your first connection with another user',
    badge_type: 'community_engagement',
    criteria: { connections_made: 1 },
    points_value: 15,
    rarity: 'common',
    color_code: '#F59E0B'
  },
  {
    name: 'Social Butterfly',
    description: 'Connected with 10 different users',
    badge_type: 'community_engagement',
    criteria: { connections_made: 10 },
    points_value: 50,
    rarity: 'uncommon',
    color_code: '#EF4444'
  },
  {
    name: 'Community Leader',
    description: 'Connected with 50 different users',
    badge_type: 'community_engagement',
    criteria: { connections_made: 50 },
    points_value: 200,
    rarity: 'epic',
    color_code: '#DC2626'
  },

  // Learning Achievement Badges
  {
    name: 'Eager Learner',
    description: 'Attended your first learning session',
    badge_type: 'learning_achievement',
    criteria: { meetings_attended: 1 },
    points_value: 20,
    rarity: 'common',
    color_code: '#06B6D4'
  },
  {
    name: 'Dedicated Student',
    description: 'Attended 10 learning sessions',
    badge_type: 'learning_achievement',
    criteria: { meetings_attended: 10 },
    points_value: 75,
    rarity: 'uncommon',
    color_code: '#0891B2'
  },
  {
    name: 'Learning Champion',
    description: 'Attended 50 learning sessions',
    badge_type: 'learning_achievement',
    criteria: { meetings_attended: 50 },
    points_value: 300,
    rarity: 'rare',
    color_code: '#0E7490'
  },

  // Mentorship Badges
  {
    name: 'First Mentor',
    description: 'Conducted your first teaching session',
    badge_type: 'mentorship',
    criteria: { sessions_taught: 1 },
    points_value: 30,
    rarity: 'common',
    color_code: '#84CC16'
  },
  {
    name: 'Skilled Mentor',
    description: 'Conducted 10 teaching sessions',
    badge_type: 'mentorship',
    criteria: { sessions_taught: 10 },
    points_value: 100,
    rarity: 'uncommon',
    color_code: '#65A30D'
  },
  {
    name: 'Master Mentor',
    description: 'Conducted 25 teaching sessions',
    badge_type: 'mentorship',
    criteria: { sessions_taught: 25 },
    points_value: 250,
    rarity: 'rare',
    color_code: '#4D7C0F'
  },

  // Consistency Badges
  {
    name: 'Week Warrior',
    description: 'Active for 7 consecutive days',
    badge_type: 'consistency',
    criteria: { consecutive_days: 7 },
    points_value: 40,
    rarity: 'common',
    color_code: '#F97316'
  },
  {
    name: 'Month Master',
    description: 'Active for 30 consecutive days',
    badge_type: 'consistency',
    criteria: { consecutive_days: 30 },
    points_value: 150,
    rarity: 'uncommon',
    color_code: '#EA580C'
  },
  {
    name: 'Year Legend',
    description: 'Active for 365 consecutive days',
    badge_type: 'consistency',
    criteria: { consecutive_days: 365 },
    points_value: 1000,
    rarity: 'legendary',
    color_code: '#C2410C'
  },

  // Special Badges
  {
    name: 'Early Adopter',
    description: 'One of the first 100 users to join GrowTogather',
    badge_type: 'special',
    criteria: { user_rank: 100 },
    points_value: 500,
    rarity: 'epic',
    color_code: '#7C3AED'
  },
  {
    name: 'Platform Pioneer',
    description: 'Beta tester and platform contributor',
    badge_type: 'special',
    criteria: { special_contribution: true },
    points_value: 1000,
    rarity: 'legendary',
    color_code: '#5B21B6'
  }
];

const seedBadges = async () => {
  try {
    console.log('🌱 Seeding badges...');

    // Test database connection first
    await testConnection();
    console.log('✅ Database connection successful');

    for (const badgeData of sampleBadges) {
      const [badge, created] = await Badge.findOrCreate({
        where: { name: badgeData.name },
        defaults: badgeData
      });
      
      if (created) {
        console.log(`✅ Created badge: ${badge.name}`);
      } else {
        console.log(`⚠️  Badge already exists: ${badge.name}`);
      }
    }
    
    console.log('🎉 Badge seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
  }
};

export default seedBadges;

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBadges().then(() => process.exit(0));
}
