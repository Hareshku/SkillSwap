-- Add new fields to meetings table for better status tracking
ALTER TABLE meetings 
ADD COLUMN confirmed_at TIMESTAMP NULL COMMENT 'When the meeting was confirmed by participant',
ADD COLUMN started_at TIMESTAMP NULL COMMENT 'When the meeting was started (someone joined the link)',
ADD COLUMN completed_at TIMESTAMP NULL COMMENT 'When the meeting was marked as completed',
ADD COLUMN declined_at TIMESTAMP NULL COMMENT 'When the meeting was declined by participant',
ADD COLUMN decline_reason TEXT NULL COMMENT 'Reason for declining the meeting';

-- Update the status enum to include new statuses
ALTER TABLE meetings 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'in_progress', 'declined') DEFAULT 'pending';