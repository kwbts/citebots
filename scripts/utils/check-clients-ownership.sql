-- Check all clients and their ownership status
SELECT 
    c.id,
    c.name,
    c.domain,
    c.created_by,
    c.created_at,
    p.email as owner_email,
    CASE 
        WHEN c.created_by IS NULL THEN 'No owner'
        WHEN p.id IS NULL THEN 'Invalid owner'
        ELSE 'Valid'
    END as ownership_status
FROM clients c
LEFT JOIN profiles p ON c.created_by = p.id
ORDER BY c.created_at DESC;

-- Count clients by ownership status
SELECT 
    CASE 
        WHEN created_by IS NULL THEN 'No owner'
        ELSE 'Has owner'
    END as status,
    COUNT(*) as count
FROM clients
GROUP BY status;

-- Check if any clients are missing from auth.users
SELECT 
    c.id,
    c.name,
    c.created_by,
    au.email as auth_email
FROM clients c
LEFT JOIN auth.users au ON c.created_by = au.id
WHERE c.created_by IS NOT NULL
AND au.id IS NULL;

-- Check RLS policies on clients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'clients'
ORDER BY policyname;

-- Check which clients would be visible to a specific user
-- Replace 'USER_ID_HERE' with your actual user ID
SELECT 
    c.id,
    c.name,
    c.domain,
    c.created_by,
    CASE 
        WHEN c.created_by = 'USER_ID_HERE' THEN 'Owned by user'
        ELSE 'Not owned by user'
    END as visibility_reason
FROM clients c
WHERE 
    -- This simulates the RLS policy check
    c.created_by = 'USER_ID_HERE'
    OR EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.id = 'USER_ID_HERE' 
        AND p.role IN ('super_admin', 'admin')
    );

-- Find clients without owners and suggest fix
SELECT 
    'UPDATE clients SET created_by = ''' || 
    (SELECT id FROM profiles WHERE email = 'jon@knowbots.ca' LIMIT 1) || 
    ''' WHERE id = ''' || c.id || ''';' as fix_query
FROM clients c
WHERE c.created_by IS NULL;