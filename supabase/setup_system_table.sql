-- Create a table to store system-wide settings
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Single row
  is_betting_closed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default row if not exists
INSERT INTO system_settings (id, is_betting_closed)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read
CREATE POLICY "Allow public read system_settings"
  ON system_settings
  FOR SELECT
  USING (true);

-- Policy: Authenticated/Anon can update (We rely on app-level admin check, or anon for simplicity in this MVP)
-- In a real app, only authenticated admin users should update.
CREATE POLICY "Allow public update system_settings"
  ON system_settings
  FOR UPDATE
  USING (true);

-- realtime
alter publication supabase_realtime add table system_settings;
