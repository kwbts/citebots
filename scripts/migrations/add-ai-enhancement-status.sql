-- Add AI enhancement tracking columns to clients table

ALTER TABLE clients ADD COLUMN IF NOT EXISTS ai_enhancement_status TEXT DEFAULT NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ai_enhancement_error TEXT DEFAULT NULL;

-- Update existing clients that have been AI enhanced
UPDATE clients 
SET ai_enhancement_status = 'completed'
WHERE ai_enhanced_at IS NOT NULL AND ai_enhancement_status IS NULL;