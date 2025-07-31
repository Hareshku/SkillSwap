-- Migration to add admin-related fields to users and posts tables
-- Run this migration to add the new fields required for enhanced admin functionality

-- Add admin-related fields to users table
ALTER TABLE users 
ADD COLUMN verified_by INT NULL,
ADD COLUMN verified_at DATETIME NULL,
ADD COLUMN verification_notes TEXT NULL,
ADD COLUMN blocked_by INT NULL,
ADD COLUMN blocked_at DATETIME NULL,
ADD COLUMN blocked_reason TEXT NULL,
ADD COLUMN rejected_by INT NULL,
ADD COLUMN rejected_at DATETIME NULL,
ADD COLUMN rejection_reason TEXT NULL,
ADD COLUMN role_changed_by INT NULL,
ADD COLUMN role_changed_at DATETIME NULL,
ADD COLUMN role_change_reason TEXT NULL;

-- Add foreign key constraints for users table
ALTER TABLE users 
ADD CONSTRAINT fk_users_verified_by FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_blocked_by FOREIGN KEY (blocked_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_rejected_by FOREIGN KEY (rejected_by) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_users_role_changed_by FOREIGN KEY (role_changed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add admin-related fields to posts table
ALTER TABLE posts 
ADD COLUMN approval_notes TEXT NULL,
ADD COLUMN removed_by INT NULL,
ADD COLUMN removed_at DATETIME NULL,
ADD COLUMN removed_reason TEXT NULL;

-- Add foreign key constraint for posts table
ALTER TABLE posts 
ADD CONSTRAINT fk_posts_removed_by FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE SET NULL;

-- Update reports table to add missing fields if they don't exist
ALTER TABLE reports 
ADD COLUMN resolved_at DATETIME NULL;

-- Add indexes for better performance
CREATE INDEX idx_users_verified_by ON users(verified_by);
CREATE INDEX idx_users_verified_at ON users(verified_at);
CREATE INDEX idx_users_blocked_by ON users(blocked_by);
CREATE INDEX idx_users_blocked_at ON users(blocked_at);
CREATE INDEX idx_users_role_changed_by ON users(role_changed_by);
CREATE INDEX idx_users_role_changed_at ON users(role_changed_at);

CREATE INDEX idx_posts_removed_by ON posts(removed_by);
CREATE INDEX idx_posts_removed_at ON posts(removed_at);
CREATE INDEX idx_posts_approval_notes ON posts(approval_notes(100));

CREATE INDEX idx_reports_resolved_at ON reports(resolved_at);
