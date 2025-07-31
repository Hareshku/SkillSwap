-- Insert sample badges into the database
INSERT INTO badges (name, description, badge_type, criteria, points_value, rarity, color_code, is_active, createdAt, updatedAt) VALUES
('First Teacher', 'Created your first skill-sharing post', 'skill_sharing', '{"posts_created": 1}', 10, 'common', '#10B981', true, NOW(), NOW()),
('Knowledge Sharer', 'Created 5 skill-sharing posts', 'skill_sharing', '{"posts_created": 5}', 25, 'uncommon', '#3B82F6', true, NOW(), NOW()),
('Master Teacher', 'Created 20 skill-sharing posts', 'skill_sharing', '{"posts_created": 20}', 100, 'rare', '#8B5CF6', true, NOW(), NOW()),
('First Connection', 'Made your first connection with another user', 'community_engagement', '{"connections_made": 1}', 15, 'common', '#F59E0B', true, NOW(), NOW()),
('Social Butterfly', 'Connected with 10 different users', 'community_engagement', '{"connections_made": 10}', 50, 'uncommon', '#EF4444', true, NOW(), NOW()),
('Community Leader', 'Connected with 50 different users', 'community_engagement', '{"connections_made": 50}', 200, 'epic', '#DC2626', true, NOW(), NOW()),
('Eager Learner', 'Attended your first learning session', 'learning_achievement', '{"meetings_attended": 1}', 20, 'common', '#06B6D4', true, NOW(), NOW()),
('Dedicated Student', 'Attended 10 learning sessions', 'learning_achievement', '{"meetings_attended": 10}', 75, 'uncommon', '#0891B2', true, NOW(), NOW()),
('Learning Champion', 'Attended 50 learning sessions', 'learning_achievement', '{"meetings_attended": 50}', 300, 'rare', '#0E7490', true, NOW(), NOW()),
('First Mentor', 'Conducted your first teaching session', 'mentorship', '{"sessions_taught": 1}', 30, 'common', '#84CC16', true, NOW(), NOW()),
('Skilled Mentor', 'Conducted 10 teaching sessions', 'mentorship', '{"sessions_taught": 10}', 100, 'uncommon', '#65A30D', true, NOW(), NOW()),
('Master Mentor', 'Conducted 25 teaching sessions', 'mentorship', '{"sessions_taught": 25}', 250, 'rare', '#4D7C0F', true, NOW(), NOW()),
('Week Warrior', 'Active for 7 consecutive days', 'consistency', '{"consecutive_days": 7}', 40, 'common', '#F97316', true, NOW(), NOW()),
('Month Master', 'Active for 30 consecutive days', 'consistency', '{"consecutive_days": 30}', 150, 'uncommon', '#EA580C', true, NOW(), NOW()),
('Year Legend', 'Active for 365 consecutive days', 'consistency', '{"consecutive_days": 365}', 1000, 'legendary', '#C2410C', true, NOW(), NOW()),
('Early Adopter', 'One of the first 100 users to join GrowTogather', 'special', '{"user_rank": 100}', 500, 'epic', '#7C3AED', true, NOW(), NOW()),
('Platform Pioneer', 'Beta tester and platform contributor', 'special', '{"special_contribution": true}', 1000, 'legendary', '#5B21B6', true, NOW(), NOW());

-- Give the current user some sample badges
INSERT INTO user_badges (user_id, badge_id, earned_at, progress_data, is_displayed, createdAt, updatedAt) VALUES
(1, 1, NOW(), '{}', true, NOW(), NOW()),
(1, 4, NOW(), '{}', true, NOW(), NOW()),
(1, 7, NOW(), '{}', true, NOW(), NOW()),
(1, 10, NOW(), '{}', true, NOW(), NOW()),
(1, 13, NOW(), '{}', true, NOW(), NOW());
