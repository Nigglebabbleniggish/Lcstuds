-- Add campaign_id column to existing user_clips table
ALTER TABLE user_clips ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES content_rewards(id) ON DELETE CASCADE;

-- Create index for faster queries by campaign_id
CREATE INDEX IF NOT EXISTS idx_user_clips_campaign_id ON user_clips(campaign_id);
