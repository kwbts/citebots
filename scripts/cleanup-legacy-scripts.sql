-- CLEANUP LEGACY SCRIPT REFERENCES
-- Remove files that reference the old edge function objects

-- Files to be archived/removed:
-- 1. verify-queue-system.sql (references queue_status view)
-- 2. create-queue-infrastructure.sql (creates queue_status view) 
-- 3. create-queue-infrastructure-idempotent.sql (creates queue_status view)
-- 4. add-queue-flat-fields.sql (references queue status indexes)

-- Note: These scripts were for the old edge function queue system
-- They are no longer needed with the local server architecture

-- The queue_status view was created by these scripts and should be removed
-- along with any other legacy queue infrastructure