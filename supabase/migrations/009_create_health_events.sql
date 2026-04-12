-- Create health_events table
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vaccine', 'medication', 'appointment')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  veterinarian TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE health_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their pets' health events"
  ON health_events FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert health events for their pets"
  ON health_events FOR INSERT
  WITH CHECK (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pets' health events"
  ON health_events FOR UPDATE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pets' health events"
  ON health_events FOR DELETE
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX health_events_pet_id_idx ON health_events(pet_id);
CREATE INDEX health_events_date_idx ON health_events(date DESC);

-- Comments
COMMENT ON TABLE health_events IS 'Health events (vaccines, medications, appointments) for pets';
COMMENT ON COLUMN health_events.type IS 'Type of health event: vaccine, medication, or appointment';
COMMENT ON COLUMN health_events.date IS 'Date when the event occurred or is scheduled';
