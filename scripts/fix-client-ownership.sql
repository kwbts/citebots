-- Update clients to be owned by the super admin user
UPDATE clients 
SET created_by = '492541a8-daf0-42a3-885a-8a3788718d0b'
WHERE created_by IS NULL;