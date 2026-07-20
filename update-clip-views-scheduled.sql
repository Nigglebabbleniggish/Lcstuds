-- Function to calculate earnings based on views and platform
CREATE OR REPLACE FUNCTION calculate_earnings(platform TEXT, view_count INTEGER)
RETURNS NUMERIC AS $$
DECLARE
  rate_per_1k NUMERIC;
BEGIN
  CASE platform
    WHEN 'youtube' THEN rate_per_1k := 0.65;
    WHEN 'instagram' THEN rate_per_1k := 0.85;
    WHEN 'twitter' THEN rate_per_1k := 0.35;
    WHEN 'tiktok' THEN rate_per_1k := 0.80;
    ELSE rate_per_1k := 0.50;
  END CASE;
  
  RETURN (view_count::NUMERIC / 1000) * rate_per_1k;
END;
$$ LANGUAGE plpgsql;

-- Function to update clip views and create pending earnings
CREATE OR REPLACE FUNCTION update_clip_views()
RETURNS VOID AS $$
DECLARE
  clip_record RECORD;
  new_earnings NUMERIC;
BEGIN
  -- Update clips that haven't been updated in 2 days and are approved
  FOR clip_record IN 
    SELECT id,user_id,platform,view_count,last_updated 
    FROM user_clips 
    WHERE status = 'approved' 
    AND (last_updated IS NULL OR last_updated < NOW() - INTERVAL '2 days')
  LOOP
    -- Fetch actual video views from platform APIs (YouTube, Instagram, Twitter, TikTok)
    -- The view_count should represent views for this specific video, not overall platform views
    -- In production, replace the simulation below with actual API calls:
    -- - YouTube: Use YouTube Data API v3 to get video statistics
    -- - Instagram: Use Instagram Graph API to get media insights
    -- - Twitter: Use Twitter API v2 to get tweet metrics
    -- - TikTok: Use TikTok API to get video statistics
    UPDATE user_clips
    SET view_count = COALESCE(view_count, 0) * 1.10,
        last_updated = NOW()
    WHERE id = clip_record.id;
    
    -- Calculate new earnings based on view increase
    new_earnings := calculate_earnings(clip_record.platform, clip_record.view_count * 0.10);
    
    -- Insert into pending earnings (4-day processing)
    INSERT INTO pending_earnings (user_id, clip_id, amount, platform, status, created_at, process_date)
    VALUES (
      clip_record.user_id,
      clip_record.id,
      new_earnings,
      clip_record.platform,
      'pending',
      NOW(),
      NOW() + INTERVAL '4 days'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create pending_earnings table
CREATE TABLE IF NOT EXISTS pending_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  clip_id UUID REFERENCES user_clips(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  platform VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  process_date TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE pending_earnings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own pending earnings"
  ON pending_earnings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending earnings"
  ON pending_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create indexes
CREATE INDEX idx_pending_earnings_user_id ON pending_earnings(user_id);
CREATE INDEX idx_pending_earnings_status ON pending_earnings(status);
CREATE INDEX idx_pending_earnings_process_date ON pending_earnings(process_date);

-- Function to process pending earnings (4-day schedule)
CREATE OR REPLACE FUNCTION process_pending_earnings()
RETURNS VOID AS $$
DECLARE
  earning_record RECORD;
BEGIN
  -- Process earnings that are due (4 days have passed)
  FOR earning_record IN 
    SELECT id, user_id, amount, clip_id
    FROM pending_earnings
    WHERE status = 'pending'
    AND process_date <= NOW()
  LOOP
    -- Move to actual earnings
    INSERT INTO earnings (user_id, amount, description, campaign_id, payment_method, created_at)
    VALUES (
      earning_record.user_id,
      earning_record.amount,
      'Clip views earnings',
      earning_record.clip_id::TEXT,
      'USDT',
      NOW()
    );
    
    -- Mark as completed
    UPDATE pending_earnings
    SET status = 'completed',
        processed_at = NOW()
    WHERE id = earning_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Note: To run these functions on a schedule, you would need:
-- 1. A cron job or scheduled task
-- 2. Or use Supabase's pg_cron extension if available
-- Example cron calls:
-- SELECT cron.schedule('update-clip-views', '0 0 * * *', 'SELECT update_clip_views()');
-- SELECT cron.schedule('process-earnings', '0 0 * * *', 'SELECT process_pending_earnings()');
