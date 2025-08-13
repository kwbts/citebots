-- Create content_briefs table
CREATE TABLE IF NOT EXISTS content_briefs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id), -- Nullable for generic briefs
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  purpose TEXT NOT NULL,
  audience TEXT NOT NULL,
  style_guide TEXT,
  custom_instructions TEXT,
  research_depth TEXT NOT NULL,
  platforms JSONB NOT NULL, -- {chatGpt: true, perplexity: true, google: true}
  content JSONB, -- Stores the complete brief structure
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT, -- For failure tracking
  logs JSONB, -- Detailed processing logs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for client lookups and tenant filtering
CREATE INDEX IF NOT EXISTS idx_content_briefs_client_id ON content_briefs(client_id);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_content_briefs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_content_briefs_updated_at_trigger ON content_briefs;
CREATE TRIGGER update_content_briefs_updated_at_trigger
BEFORE UPDATE ON content_briefs
FOR EACH ROW
EXECUTE FUNCTION update_content_briefs_updated_at();

-- RLS Policies for content_briefs
ALTER TABLE content_briefs ENABLE ROW LEVEL SECURITY;

-- Users can view their own briefs and briefs for clients they created
CREATE POLICY "Users can view content briefs they created or for clients they own"
ON content_briefs
FOR SELECT
USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = content_briefs.client_id
    AND (clients.created_by = auth.uid() OR clients.user_id = auth.uid())
  )
);

-- Users can insert briefs for clients they own
CREATE POLICY "Users can create content briefs for clients they own"
ON content_briefs
FOR INSERT
WITH CHECK (
  (client_id IS NULL) OR
  EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = content_briefs.client_id
    AND (clients.created_by = auth.uid() OR clients.user_id = auth.uid())
  )
);

-- Users can update briefs they created
CREATE POLICY "Users can update content briefs they created"
ON content_briefs
FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

-- Users can delete briefs they created
CREATE POLICY "Users can delete content briefs they created"
ON content_briefs
FOR DELETE
USING (auth.uid() = created_by);

-- Super admins can do everything
CREATE POLICY "Super admins can manage all content briefs"
ON content_briefs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON content_briefs TO authenticated;