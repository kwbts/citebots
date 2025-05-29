-- Update access_requests table to support role and client assignment

-- Add new columns to access_requests table
ALTER TABLE access_requests 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' CHECK (role IN ('super_admin', 'partner', 'client', 'analyst'));

ALTER TABLE access_requests 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Add index for client_id lookup
CREATE INDEX IF NOT EXISTS idx_access_requests_client_id ON access_requests(client_id);

-- Comments for documentation
COMMENT ON COLUMN access_requests.role IS 'User role to be assigned when approved';
COMMENT ON COLUMN access_requests.client_id IS 'Client to assign user to (required for client role)';