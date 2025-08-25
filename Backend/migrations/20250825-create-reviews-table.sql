-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reviewer_id INT NOT NULL,
  reviewee_id INT NOT NULL,
  meeting_id INT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  skills_exchanged JSON NULL,
  exchange_type ENUM('teaching', 'learning', 'mutual_exchange') NOT NULL,
  communication_rating INT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  knowledge_rating INT NULL CHECK (knowledge_rating >= 1 AND knowledge_rating <= 5),
  punctuality_rating INT NULL CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  would_recommend BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  admin_notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE SET NULL,
  
  -- Indexes
  INDEX idx_reviewee_id (reviewee_id),
  INDEX idx_reviewer_id (reviewer_id),
  INDEX idx_rating (rating),
  INDEX idx_is_public (is_public),
  
  -- Unique constraint to prevent duplicate reviews for the same meeting
  UNIQUE KEY unique_review_per_meeting (reviewer_id, reviewee_id, meeting_id)
);