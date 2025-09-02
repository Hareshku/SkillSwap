-- Add online status fields to users table
ALTER TABLE users 
ADD COLUMN is_online BOOLEAN DEFAULT FALSE,
ADD COLUMN last_seen TIMESTAMP NULL;

-- Update existing users to have last_seen as their last_login
UPDATE users SET last_seen = last_login WHERE last_login IS NOT NULL;