-- Create user_clips table for manual video submission
CREATE TABLE IF NOT EXISTS user_clips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES content_rewards(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  view_count INTEGER,
  approved_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_clips ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own clips"
  ON user_clips FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clips"
  ON user_clips FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clips"
  ON user_clips FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clips"
  ON user_clips FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update all clips"
  ON user_clips FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_user_clips_user_id ON user_clips(user_id);
CREATE INDEX idx_user_clips_status ON user_clips(status);
CREATE INDEX idx_user_clips_platform ON user_clips(platform);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_clips_updated_at
  BEFORE UPDATE ON user_clips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
