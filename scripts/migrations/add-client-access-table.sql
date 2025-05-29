-- Add client_access table to link users to specific clients
-- This enables multiple users per client and role-based access control

CREATE TABLE IF NOT EXISTS client_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  access_level TEXT DEFAULT 'viewer' CHECK (access_level IN ('owner', 'viewer', 'editor')),
  granted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user-client pair
  UNIQUE(client_id, user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_access_client_id ON client_access(client_id);
CREATE INDEX IF NOT EXISTS idx_client_access_user_id ON client_access(user_id);
CREATE INDEX IF NOT EXISTS idx_client_access_granted_by ON client_access(granted_by);

-- Enable RLS
ALTER TABLE client_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Service role has full access
CREATE POLICY "Service role has full access on client_access"
  ON client_access
  FOR ALL
  USING (auth.role() = 'service_role');

-- Super admins can manage all client access
CREATE POLICY "Super admins can manage all client access"
  ON client_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

-- Users can view their own client access records
CREATE POLICY "Users can view their own client access"
  ON client_access
  FOR SELECT
  USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE client_access IS 'Links users to specific clients with access levels';
COMMENT ON COLUMN client_access.access_level IS 'owner: full access, viewer: read-only, editor: can modify but not delete';
COMMENT ON COLUMN client_access.granted_by IS 'User who granted this access (typically super_admin)';