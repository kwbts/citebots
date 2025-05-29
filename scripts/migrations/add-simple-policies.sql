-- Add simple, fast policies
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR created_by = auth.uid()
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can view their own analysis runs"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    OR created_by = auth.uid()
  );