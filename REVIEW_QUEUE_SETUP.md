# Review Queue Setup Guide

The Review Queue feature allows Tim to approve, reject, or request changes for sub-agent outputs.

## Database Migration

Run the following SQL in your Supabase SQL Editor to add the necessary columns:

```sql
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
```

## Features Implemented

### 1. Review Queue Page (`/review`)
- Lists all subagent_runs with `status='completed'` and `review_status='pending'`
- Displays for each output:
  - Sub-agent name
  - Task description
  - Output/results (with truncation for long outputs)
  - Tokens used
  - Cost
  - API calls
  - Completion timestamp

### 2. Action Buttons
- **✅ Approve**: Marks output as approved
- **🔄 Request Changes**: Requests changes with optional feedback
- **❌ Reject**: Rejects the output with optional feedback

### 3. Feedback System
- Comment box for each output
- Comments saved with review action
- Comments displayed in activity log

### 4. Real-time Updates
- Uses Supabase realtime subscriptions
- Automatically updates when new outputs are ready for review
- Pending count badge updates in real-time

### 5. Activity Logging
- All review actions are logged to `activity_log` table
- Log types: `review_approved`, `review_rejected`, `review_changes_requested`

### 6. Sidebar Integration
- "Review Queue" link in sidebar
- Badge showing number of pending reviews
- Badge updates in real-time

### 7. Mobile Responsive
- Card-based layout
- Responsive grid (1 column on mobile, 2 columns on desktop)
- Touch-friendly buttons

## Usage

1. **Access the Review Queue**: Click "Review Queue" in the sidebar
2. **Review Outputs**: Each card shows a sub-agent's output
3. **Provide Feedback**: Optional comments can be added
4. **Take Action**: Approve, request changes, or reject
5. **Track Activity**: All actions are logged in the activity log

## Testing

To test the feature:

1. Ensure you have subagent_runs with `status='completed'`
2. The outputs should automatically appear in the review queue
3. Use the action buttons to test approval/rejection flow
4. Check the activity log to see review actions

## Notes

- The `output` column in `subagent_runs` should be populated by your sub-agent system
- The `reviewed_by` field currently uses 'admin' - update this to use actual user authentication when implemented
- Empty state shows when no outputs are pending review
- All database changes are backward compatible