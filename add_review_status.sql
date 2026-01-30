-- Add review_status column to subagent_runs table
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending' 
CHECK (review_status IN ('pending', 'approved', 'changes_requested', 'rejected'));

-- Add output column to store the actual output/results
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS output TEXT;

-- Add review_comment column for feedback
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS review_comment TEXT;

-- Add reviewed_at timestamp
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by column (could be user_id if you have users table)
ALTER TABLE subagent_runs 
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Update existing completed runs to have 'pending' review_status
UPDATE subagent_runs 
SET review_status = 'pending' 
WHERE status = 'completed' AND (review_status IS NULL OR review_status NOT IN ('approved', 'changes_requested', 'rejected'));

-- Create index for faster review queue queries
CREATE INDEX IF NOT EXISTS idx_subagent_runs_review_status 
ON subagent_runs(review_status) 
WHERE review_status = 'pending';

-- Add activity_log type for review actions
-- Note: You may need to update the activity_log type enum in your application code
-- to include 'review_approved', 'review_rejected', 'review_changes_requested'