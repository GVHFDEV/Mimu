-- Create daily_logs table
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their pets' daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can insert daily logs for their pets" ON daily_logs;
DROP POLICY IF EXISTS "Users can update their pets' daily logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can delete their pets' daily logs" ON daily_logs;

-- Create RLS Policies
CREATE POLICY "Users can view their pets' daily logs"
  ON daily_logs FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert daily logs for their pets"
  ON daily_logs FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pets' daily logs"
  ON daily_logs FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pets' daily logs"
  ON daily_logs FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX daily_logs_pet_id_idx ON daily_logs(pet_id);
CREATE INDEX daily_logs_activity_id_idx ON daily_logs(activity_id);
CREATE INDEX daily_logs_completed_at_idx ON daily_logs(completed_at DESC);
CREATE INDEX daily_logs_created_at_idx ON daily_logs(created_at DESC);

-- Add comments
COMMENT ON TABLE daily_logs IS 'Daily activity logs for pets';
COMMENT ON COLUMN daily_logs.completed_at IS 'Timestamp when the activity was completed';