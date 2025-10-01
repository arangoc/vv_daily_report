/*
  # Construction Project Management Database Schema

  ## Overview
  This migration creates a comprehensive database schema for managing construction project daily reports,
  including personnel tracking, equipment usage, materials, project progress, and financial data.

  ## New Tables

  ### 1. `projects`
  Stores construction project information
  - `id` (uuid, primary key) - Unique project identifier
  - `name` (text) - Project name
  - `client` (text) - Client/customer name
  - `created_at` (timestamptz) - Project creation timestamp
  - `created_by` (uuid) - User who created the project (references auth.users)
  - `is_active` (boolean) - Whether project is currently active

  ### 2. `daily_reports`
  Main table for daily construction reports
  - `id` (uuid, primary key) - Unique report identifier
  - `project_id` (uuid) - Reference to projects table
  - `report_date` (date) - Date of the report
  - `supervisor` (text) - Name of site supervisor
  - `weather` (text) - Weather conditions (Soleado, Nublado, Lluvioso)
  - `observations` (text) - General observations and notes
  - `safety_incidents` (text) - Safety incidents or concerns
  - `created_by` (uuid) - User who created the report
  - `created_at` (timestamptz) - Report creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `report_personnel`
  Tracks personnel (field and administrative) for each report
  - `id` (uuid, primary key)
  - `report_id` (uuid) - Reference to daily_reports
  - `name` (text) - Person's full name
  - `type` (text) - Job type/role
  - `category` (text) - 'field' or 'admin'
  - `hours_normal` (numeric) - Regular hours worked
  - `hours_extra` (numeric) - Overtime hours
  - `hourly_rate` (numeric) - Pay rate per hour
  - `is_present` (boolean) - Whether person was present
  - `activity` (text) - Activity assigned

  ### 4. `report_equipment`
  Tracks equipment usage for each report
  - `id` (uuid, primary key)
  - `report_id` (uuid) - Reference to daily_reports
  - `equipment_type` (text) - Type of equipment
  - `identification` (text) - Equipment ID or plate number
  - `operator` (text) - Operator name
  - `hours_worked` (numeric) - Hours of operation
  - `fuel_consumed` (numeric) - Fuel used in gallons
  - `cost_per_hour` (numeric) - Rental/operation cost per hour
  - `status` (text) - Equipment status (Operativo, Mantenimiento, Averiado, Standby)
  - `activity` (text) - Activity performed

  ### 5. `report_materials`
  Tracks materials received/used for each report
  - `id` (uuid, primary key)
  - `report_id` (uuid) - Reference to daily_reports
  - `material_type` (text) - Type of material
  - `quantity` (numeric) - Amount received/used
  - `unit` (text) - Unit of measure (m3, ton, saco, und)
  - `supplier` (text) - Supplier name
  - `unit_cost` (numeric) - Cost per unit
  - `total_cost` (numeric) - Total cost (quantity × unit_cost)

  ### 6. `report_progress`
  Tracks progress on contract line items (partidas)
  - `id` (uuid, primary key)
  - `report_id` (uuid) - Reference to daily_reports
  - `item_code` (text) - Contract item code (e.g., "4.01")
  - `item_description` (text) - Item description
  - `progress_today` (numeric) - Progress made today
  - `progress_accumulated` (numeric) - Total accumulated progress (%)
  - `unit` (text) - Unit of measure
  - `notes` (text) - Progress notes

  ### 7. `contract_items`
  Stores contract line items (partidas del contrato)
  - `id` (uuid, primary key)
  - `project_id` (uuid) - Reference to projects table
  - `code` (text) - Item code (e.g., "1.01", "4.01")
  - `description` (text) - Item description
  - `unit` (text) - Unit of measure
  - `budget_amount` (numeric) - Budgeted amount

  ## Security

  ### Row Level Security (RLS)
  - All tables have RLS enabled
  - Users can only access data for their own reports and projects
  - Authentication required for all operations

  ### Policies
  Each table has policies for:
  - SELECT: Users can view their own data
  - INSERT: Users can create new records
  - UPDATE: Users can update their own records
  - DELETE: Users can delete their own records

  ## Important Notes
  - All foreign keys use CASCADE delete to maintain referential integrity
  - Timestamps use `now()` defaults for automatic tracking
  - All monetary values use numeric type for precision
  - Date fields are properly typed for date operations
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active boolean DEFAULT true
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create daily_reports table
CREATE TABLE IF NOT EXISTS daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  report_date date NOT NULL,
  supervisor text DEFAULT '',
  weather text DEFAULT '',
  observations text DEFAULT '',
  safety_incidents text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, report_date)
);

ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- Create report_personnel table
CREATE TABLE IF NOT EXISTS report_personnel (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  category text NOT NULL CHECK (category IN ('field', 'admin')),
  hours_normal numeric DEFAULT 8,
  hours_extra numeric DEFAULT 0,
  hourly_rate numeric DEFAULT 0,
  is_present boolean DEFAULT true,
  activity text DEFAULT ''
);

ALTER TABLE report_personnel ENABLE ROW LEVEL SECURITY;

-- Create report_equipment table
CREATE TABLE IF NOT EXISTS report_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
  equipment_type text NOT NULL,
  identification text DEFAULT '',
  operator text DEFAULT '',
  hours_worked numeric DEFAULT 0,
  fuel_consumed numeric DEFAULT 0,
  cost_per_hour numeric DEFAULT 0,
  status text DEFAULT 'Operativo',
  activity text DEFAULT ''
);

ALTER TABLE report_equipment ENABLE ROW LEVEL SECURITY;

-- Create report_materials table
CREATE TABLE IF NOT EXISTS report_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
  material_type text NOT NULL,
  quantity numeric DEFAULT 0,
  unit text DEFAULT '',
  supplier text DEFAULT '',
  unit_cost numeric DEFAULT 0,
  total_cost numeric DEFAULT 0
);

ALTER TABLE report_materials ENABLE ROW LEVEL SECURITY;

-- Create report_progress table
CREATE TABLE IF NOT EXISTS report_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid REFERENCES daily_reports(id) ON DELETE CASCADE NOT NULL,
  item_code text NOT NULL,
  item_description text DEFAULT '',
  progress_today numeric DEFAULT 0,
  progress_accumulated numeric DEFAULT 0,
  unit text DEFAULT '',
  notes text DEFAULT ''
);

ALTER TABLE report_progress ENABLE ROW LEVEL SECURITY;

-- Create contract_items table
CREATE TABLE IF NOT EXISTS contract_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  code text NOT NULL,
  description text NOT NULL,
  unit text NOT NULL,
  budget_amount numeric DEFAULT 0,
  UNIQUE(project_id, code)
);

ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROJECTS POLICIES
-- =============================================

CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- =============================================
-- DAILY REPORTS POLICIES
-- =============================================

CREATE POLICY "Users can view own reports"
  ON daily_reports FOR SELECT
  TO authenticated
  USING (
    auth.uid() = created_by OR
    auth.uid() IN (
      SELECT created_by FROM projects WHERE id = daily_reports.project_id
    )
  );

CREATE POLICY "Users can create reports"
  ON daily_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    auth.uid() IN (
      SELECT created_by FROM projects WHERE id = project_id
    )
  );

CREATE POLICY "Users can update own reports"
  ON daily_reports FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own reports"
  ON daily_reports FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- =============================================
-- REPORT PERSONNEL POLICIES
-- =============================================

CREATE POLICY "Users can view report personnel"
  ON report_personnel FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_personnel.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add report personnel"
  ON report_personnel FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update report personnel"
  ON report_personnel FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete report personnel"
  ON report_personnel FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_personnel.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

-- =============================================
-- REPORT EQUIPMENT POLICIES
-- =============================================

CREATE POLICY "Users can view report equipment"
  ON report_equipment FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_equipment.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add report equipment"
  ON report_equipment FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update report equipment"
  ON report_equipment FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete report equipment"
  ON report_equipment FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_equipment.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

-- =============================================
-- REPORT MATERIALS POLICIES
-- =============================================

CREATE POLICY "Users can view report materials"
  ON report_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_materials.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add report materials"
  ON report_materials FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update report materials"
  ON report_materials FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete report materials"
  ON report_materials FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_materials.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

-- =============================================
-- REPORT PROGRESS POLICIES
-- =============================================

CREATE POLICY "Users can view report progress"
  ON report_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_progress.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add report progress"
  ON report_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update report progress"
  ON report_progress FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete report progress"
  ON report_progress FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM daily_reports
      WHERE daily_reports.id = report_progress.report_id
      AND daily_reports.created_by = auth.uid()
    )
  );

-- =============================================
-- CONTRACT ITEMS POLICIES
-- =============================================

CREATE POLICY "Users can view contract items"
  ON contract_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = contract_items.project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can add contract items"
  ON contract_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update contract items"
  ON contract_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.created_by = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_id
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete contract items"
  ON contract_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = contract_items.project_id
      AND projects.created_by = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_reports_project_date ON daily_reports(project_id, report_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_created_by ON daily_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_report_personnel_report_id ON report_personnel(report_id);
CREATE INDEX IF NOT EXISTS idx_report_equipment_report_id ON report_equipment(report_id);
CREATE INDEX IF NOT EXISTS idx_report_materials_report_id ON report_materials(report_id);
CREATE INDEX IF NOT EXISTS idx_report_progress_report_id ON report_progress(report_id);
CREATE INDEX IF NOT EXISTS idx_contract_items_project_id ON contract_items(project_id);
