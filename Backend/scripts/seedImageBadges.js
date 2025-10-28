import { Badge, testConnection } from '../models/index.js';

const badgesFromImage = [
  {
    name: 'Master Mentor',
    description: 'For top-level teachers',
    badge_type: 'mentorship',
    criteria: {
      type: 'teach_skills_successfully',
      target: 5,
      description: 'Teach 5 skills successfully'
    },
    points_value: 100,
    rarity: 'epic',
    color_code: '#FFD700',
    icon_url: '🏆'
  },
  {
    name: 'Learning Champion',
    description: 'For active learners',
    badge_type: 'learning_achievement',
    criteria: {
      type: 'complete_learning_sessions',
      target: 5,
      description: 'Complete 5 learning sessions'
    },
    points_value: 75,
    rarity: 'rare',
    color_code: '#4169E1',
    icon_url: '🏆'
  },
  {
    name: 'Top Rated',
    description: 'For high-quality mentors',
    badge_type: 'mentorship',
    criteria: {
      type: 'maintain_high_rating',
      target_rating: 4.0,
      minimum_reviews: 5,
      description: 'Maintain average rating ≥ 4 across 5+ reviews'
    },
    points_value: 150,
    rarity: 'epic',
    color_code: '#FFD700',
    icon_url: '🏆'
  },
  {
    name: 'Community Helper',
    description: 'Encourages engagement',
    badge_type: 'community_engagement',
    criteria: {
      type: 'give_helpful_feedback',
      target: 4,
      description: 'Give 4 helpful feedbacks'
    },
    points_value: 50,
    rarity: 'uncommon',
    color_code: '#FF6347',
    icon_url: '🏅'
  },
  {
    name: 'All-Rounder',
    description: 'Shows versatility',
    badge_type: 'skill_sharing',
    criteria: {
      type: 'teach_and_learn_skills',
      teach_target: 2,
      learn_target: 2,
      description: 'Both taught and learned at least 2 skills'
    },
    points_value: 80,
    rarity: 'rare',
    color_code: '#32CD32',
    icon_url: '🏅'
  },
  {
    name: 'SkillSwap Legend',
    description: 'The ultimate trophy',
    badge_type: 'special',
    criteria: {
      type: 'earn_all_other_badges',
      description: 'Earn all other trophies',
      required_badges: ['Master Mentor', 'Learning Champion', 'Top Rated', 'Community Helper', 'All-Rounder']
    },
    points_value: 500,
    rarity: 'legendary',
    color_code: '#8A2BE2',
    icon_url: '👑'
  }
];

const seedImageBadges = async () => {
  try {
    await testConnection();
    console.log('✅ Connected to database');

    // Clear existing badges to avoid duplicates
    await Badge.destroy({ where: {} });
    console.log('🗑️ Cleared existing badges');

    // Create new badges
    for (const badgeData of badgesFromImage) {
      const badge = await Badge.create(badgeData);
      console.log(`✅ Created badge: ${badge.icon_url} ${badge.name}`);
    }

    console.log('\n🎉 Successfully seeded all badges from image!');
    console.log('\n📋 Badge Summary:');
    badgesFromImage.forEach((badge, index) => {
      console.log(`${index + 1}. ${badge.icon_url} ${badge.name}`);
      console.log(`   📝 ${badge.description}`);
      console.log(`   🎯 Criteria: ${badge.criteria.description}`);
      console.log(`   💎 Rarity: ${badge.rarity} | 🏆 Points: ${badge.points_value}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding badges:', error);
  } finally {
    process.exit(0);
  }
};

seedImageBadges();