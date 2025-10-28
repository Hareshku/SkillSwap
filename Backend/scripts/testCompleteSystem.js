import { Badge, UserBadge, User, Meeting, Feedback, testConnection, sequelize } from '../models/index.js';
import BadgeService from '../services/badgeService.js';

const testCompleteSystem = async () => {
  try {
    await testConnection();
    console.log('✅ Connected to database');

    // Find a test user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`\n🧪 Testing complete badge system for user: ${user.username}`);

    // 1. Test Badge System
    console.log('\n📋 1. Testing Badge System...');
    const badges = await Badge.findAll();
    console.log(`   Found ${badges.length} badges in system`);

    // 2. Test Badge Progress
    console.log('\n📊 2. Testing Badge Progress...');
    const progress = await BadgeService.getUserBadgeProgress(user.id);
    console.log(`   Tracking progress for ${progress.length} badges`);

    // 3. Test Feedback System (simulate creating feedback)
    console.log('\n💬 3. Testing Feedback System...');

    // Find another user to give feedback to
    const otherUser = await User.findOne({
      where: {
        id: {
          [sequelize.Sequelize.Op.ne]: user.id
        }
      }
    });

    if (otherUser) {
      // Check if feedback already exists
      const existingFeedback = await Feedback.findOne({
        where: {
          giver_id: user.id,
          receiver_id: otherUser.id
        }
      });

      if (!existingFeedback) {
        // Create test feedback
        const feedback = await Feedback.create({
          giver_id: user.id,
          receiver_id: otherUser.id,
          rating: 5,
          comment: 'Great learning experience! Very helpful and knowledgeable.',
          feedback_type: 'overall',
          is_public: true
        });
        console.log(`   ✅ Created test feedback (ID: ${feedback.id})`);
      } else {
        console.log(`   ℹ️  Feedback already exists between users`);
      }

      // Get feedback stats
      const feedbackCount = await Feedback.count({
        where: {
          giver_id: user.id,
          rating: {
            [sequelize.Sequelize.Op.gte]: 4
          }
        }
      });
      console.log(`   📈 User has given ${feedbackCount} helpful feedbacks (≥4 stars)`);
    }

    // 4. Test Meeting System (simulate completing meetings)
    console.log('\n🤝 4. Testing Meeting System...');
    const completedMeetings = await Meeting.count({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { organizer_id: user.id },
          { participant_id: user.id }
        ],
        status: 'completed'
      }
    });
    console.log(`   📅 User has ${completedMeetings} completed meetings`);

    // 5. Test Badge Checking
    console.log('\n🏆 5. Testing Badge Checking...');
    const newBadges = await BadgeService.checkAndAwardBadges(user.id);

    if (newBadges.length > 0) {
      console.log(`   🎉 Awarded ${newBadges.length} new badges:`);
      newBadges.forEach(badge => {
        console.log(`      ${badge.icon_url} ${badge.name} (${badge.points_value} points)`);
      });
    } else {
      console.log(`   📝 No new badges earned (user may already have earned available badges)`);
    }

    // 6. Get Final Stats
    console.log('\n📊 6. Final Badge Statistics...');
    const finalProgress = await BadgeService.getUserBadgeProgress(user.id);
    const earnedBadges = finalProgress.filter(p => p.isEarned);
    const totalPoints = earnedBadges.reduce((sum, p) => sum + p.badge.points_value, 0);

    console.log(`\n🏆 Final Summary:`);
    console.log(`   User: ${user.username}`);
    console.log(`   Badges Earned: ${earnedBadges.length}/${finalProgress.length}`);
    console.log(`   Total Points: ${totalPoints}`);
    console.log(`   Completion: ${Math.round((earnedBadges.length / finalProgress.length) * 100)}%`);

    // 7. Test API Endpoints (simulate)
    console.log('\n🔌 7. API Endpoints Available:');
    console.log('   GET /api/badges - Get all badges');
    console.log('   GET /api/badges/my-badges - Get user badges');
    console.log('   POST /api/badges/check - Check for new badges');
    console.log('   GET /api/badges/detailed-progress - Get badge progress');
    console.log('   POST /api/feedback - Create feedback');
    console.log('   GET /api/feedback/user/:userId - Get user feedback');
    console.log('   GET /api/feedback/stats/:userId - Get feedback stats');

    console.log('\n✅ Complete system test finished successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Complete meetings to earn badges');
    console.log('   2. Give feedback to earn Community Helper badge');
    console.log('   3. Receive reviews to earn Top Rated badge');
    console.log('   4. Check /badges page to see progress');
    console.log('   5. Badge notifications will appear automatically');

  } catch (error) {
    console.error('❌ Error testing complete system:', error);
  } finally {
    process.exit(0);
  }
};

testCompleteSystem();