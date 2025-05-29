-- First, check which clients are missing created_by
SELECT 
    c.id,
    c.name,
    c.domain,
    c.created_by,
    c.created_at
FROM clients c
WHERE c.created_by IS NULL
ORDER BY c.created_at DESC;

-- Find jon@knowbots.ca user ID
SELECT id, email FROM profiles WHERE email = 'jon@knowbots.ca';

-- Update clients without created_by to be owned by jon@knowbots.ca
-- Replace 'USER_ID_HERE' with the actual ID from the query above
UPDATE clients 
SET created_by = (SELECT id FROM profiles WHERE email = 'jon@knowbots.ca' LIMIT 1)
WHERE created_by IS NULL;

-- Verify the update
SELECT 
    c.id,
    c.name,
    c.domain,
    c.created_by,
    p.email as owner_email
FROM clients c
LEFT JOIN profiles p ON c.created_by = p.id
ORDER BY c.created_at DESC;