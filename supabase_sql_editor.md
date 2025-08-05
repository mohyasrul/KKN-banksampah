-- Bank Sampah RW 10 Database Schema
-- Execute this script in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create RT (Rukun Tetangga) table
CREATE TABLE IF NOT EXISTS rt (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nomor TEXT UNIQUE NOT NULL,
  ketua_rt TEXT NOT NULL,
  jumlah_kk INTEGER DEFAULT 0,
  alamat TEXT,
  kontak TEXT,
  saldo DECIMAL(15,2) DEFAULT 0,
  total_transaksi INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste types table
CREATE TABLE IF NOT EXISTS waste_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  price_per_kg DECIMAL(10,2) DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create waste transactions table
CREATE TABLE IF NOT EXISTS waste_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  waste_type_id UUID REFERENCES waste_types(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight DECIMAL(10,2) NOT NULL,
  price_per_kg DECIMAL(10,2) NOT NULL,
  total_value DECIMAL(15,2) GENERATED ALWAYS AS (weight * price_per_kg) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create savings transactions table
CREATE TABLE IF NOT EXISTS savings_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rt_id UUID REFERENCES rt(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  amount_after_tax DECIMAL(15,2),
  tax_rate DECIMAL(5,4) DEFAULT 0,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create app settings table for tax and other configurations
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  data_type TEXT CHECK (data_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'operator')) DEFAULT 'operator',
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit log table for tracking user activities
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table for storing generated reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_type TEXT NOT NULL, -- 'daily', 'monthly', 'tax_summary', 'rt_performance'
  title TEXT NOT NULL,
  description TEXT,
  parameters JSONB, -- Store filter parameters like date range, rt_ids, etc
  data JSONB NOT NULL, -- Store report data
  generated_by UUID REFERENCES users(id),
  file_url TEXT, -- URL to exported file (Excel/PDF)
  status TEXT CHECK (status IN ('generating', 'completed', 'failed')) DEFAULT 'generating',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waste_transactions_rt_id ON waste_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_waste_transactions_date ON waste_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_rt_id ON savings_transactions(rt_id);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_date ON savings_transactions(date);
CREATE INDEX IF NOT EXISTS idx_savings_transactions_type ON savings_transactions(type);
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_by ON reports(generated_by);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to RT table
DROP TRIGGER IF EXISTS update_rt_updated_at ON rt;
CREATE TRIGGER update_rt_updated_at
  BEFORE UPDATE ON rt
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to app_settings table
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to reports table
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default waste types
INSERT INTO waste_types (name, price_per_kg, unit, description) VALUES
('Plastik', 2000, 'kg', 'Botol plastik, kemasan makanan, kantong plastik'),
('Kertas', 1500, 'kg', 'Kertas bekas, koran, majalah, buku'),
('Logam', 5000, 'kg', 'Kaleng minuman, aluminium, besi bekas'),
('Kaca', 1000, 'kg', 'Botol kaca, pecahan kaca'),
('Kardus', 1800, 'kg', 'Kardus bekas, karton packaging')
ON CONFLICT (name) DO NOTHING;

-- Insert default app settings
INSERT INTO app_settings (setting_key, setting_value, data_type, description) VALUES
('tax_rate', '0.10', 'number', 'Tax rate for withdrawals (10%)'),
('min_withdrawal_amount', '50000', 'number', 'Minimum withdrawal amount in Rupiah'),
('app_name', 'Bank Sampah RW 10', 'string', 'Application name'),
('price_per_kg_default', '2000', 'number', 'Default price per kg for waste'),
('auto_backup_enabled', 'true', 'boolean', 'Enable automatic backup'),
('session_timeout_hours', '4', 'number', 'Session timeout in hours'),
('max_login_attempts', '5', 'number', 'Maximum login attempts before lockout'),
('backup_retention_days', '30', 'number', 'Backup retention period in days')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default users (password: 'admin123' and 'operator123' - should be changed immediately)
-- Note: In production, use proper password hashing
INSERT INTO users (username, password_hash, full_name, role, email) VALUES
('admin', '$2b$10$rMiKZH8Z3GzY8K7vQ2sXAeX.JqZqZK7qJ1vS3KzM8wX5Y9P2QsR6W', 'Administrator Bank Sampah', 'admin', 'admin@banksampah.rw10.id'),
('operator1', '$2b$10$rMiKZH8Z3GzY8K7vQ2sXAeX.JqZqZK7qJ1vS3KzM8wX5Y9P2QsR6W', 'Operator 1', 'operator', 'operator1@banksampah.rw10.id')
ON CONFLICT (username) DO NOTHING;

-- Insert sample RT data (optional for testing)
INSERT INTO rt (nomor, ketua_rt, jumlah_kk, alamat) VALUES
('01', 'Pak Budi Santoso', 25, 'Jl. Mawar No. 1-25'),
('02', 'Ibu Siti Rahayu', 30, 'Jl. Melati No. 1-30'),
('03', 'Pak Ahmad Wijaya', 28, 'Jl. Kenanga No. 1-28')
ON CONFLICT (nomor) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Create policies (for now allow all operations, can be refined later)
DROP POLICY IF EXISTS "Enable all operations for all users" ON rt;
CREATE POLICY "Enable all operations for all users" ON rt FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_types;
CREATE POLICY "Enable all operations for all users" ON waste_types FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON waste_transactions;
CREATE POLICY "Enable all operations for all users" ON waste_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON savings_transactions;
CREATE POLICY "Enable all operations for all users" ON savings_transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON app_settings;
CREATE POLICY "Enable all operations for all users" ON app_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON users;
CREATE POLICY "Enable all operations for all users" ON users FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON user_sessions;
CREATE POLICY "Enable all operations for all users" ON user_sessions FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON audit_logs;
CREATE POLICY "Enable all operations for all users" ON audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable all operations for all users" ON reports;
CREATE POLICY "Enable all operations for all users" ON reports FOR ALL USING (true);

-- Helper function to update RT saldo
CREATE OR REPLACE FUNCTION update_rt_saldo(rt_uuid UUID, amount_change DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE rt
  SET
    saldo = saldo + amount_change,
    total_transaksi = total_transaksi + 1,
    updated_at = NOW()
  WHERE id = rt_uuid;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate tax for withdrawal
CREATE OR REPLACE FUNCTION calculate_withdrawal_tax(withdrawal_amount DECIMAL)
RETURNS TABLE(
  tax_amount DECIMAL,
  amount_after_tax DECIMAL,
  tax_rate DECIMAL
) AS $$
DECLARE
  current_tax_rate DECIMAL;
BEGIN
  -- Get current tax rate from settings
  SELECT CAST(setting_value AS DECIMAL) INTO current_tax_rate
  FROM app_settings 
  WHERE setting_key = 'tax_rate' AND is_active = true;
  
  -- Default to 10% if not found
  IF current_tax_rate IS NULL THEN
    current_tax_rate := 0.10;
  END IF;
  
  RETURN QUERY SELECT 
    withdrawal_amount * current_tax_rate,
    withdrawal_amount - (withdrawal_amount * current_tax_rate),
    current_tax_rate;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get minimum withdrawal amount
CREATE OR REPLACE FUNCTION get_min_withdrawal_amount()
RETURNS DECIMAL AS $$
DECLARE
  min_amount DECIMAL;
BEGIN
  SELECT CAST(setting_value AS DECIMAL) INTO min_amount
  FROM app_settings 
  WHERE setting_key = 'min_withdrawal_amount' AND is_active = true;
  
  -- Default to 50000 if not found
  IF min_amount IS NULL THEN
    min_amount := 50000;
  END IF;
  
  RETURN min_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION authenticate_user(input_username TEXT, input_password TEXT)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.id,
    u.username,
    u.full_name,
    u.role,
    (u.password_hash = crypt(input_password, u.password_hash)) as is_valid
  FROM users u
  WHERE u.username = input_username AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to create user session
CREATE OR REPLACE FUNCTION create_user_session(
  user_uuid UUID,
  session_token_input TEXT,
  ip_addr TEXT DEFAULT NULL,
  user_agent_input TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  session_id UUID;
  session_hours INTEGER;
BEGIN
  -- Get session timeout from settings
  SELECT CAST(setting_value AS INTEGER) INTO session_hours
  FROM app_settings 
  WHERE setting_key = 'session_timeout_hours' AND is_active = true;
  
  -- Default to 4 hours if not found
  IF session_hours IS NULL THEN
    session_hours := 4;
  END IF;
  
  -- Insert new session
  INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (
    user_uuid,
    session_token_input,
    NOW() + INTERVAL '1 hour' * session_hours,
    ip_addr,
    user_agent_input
  )
  RETURNING id INTO session_id;
  
  -- Update user last login
  UPDATE users SET last_login = NOW() WHERE id = user_uuid;
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(session_token_input TEXT)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.full_name,
    u.role,
    (s.expires_at > NOW() AND s.is_active = true AND u.is_active = true) as is_valid
  FROM user_sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.session_token = session_token_input;
END;
$$ LANGUAGE plpgsql;

-- Function to log audit trail
CREATE OR REPLACE FUNCTION log_audit(
  user_uuid UUID,
  action_input TEXT,
  table_name_input TEXT DEFAULT NULL,
  record_id_input UUID DEFAULT NULL,
  old_values_input JSONB DEFAULT NULL,
  new_values_input JSONB DEFAULT NULL,
  ip_addr TEXT DEFAULT NULL,
  user_agent_input TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_values, new_values, ip_address, user_agent
  )
  VALUES (
    user_uuid, action_input, table_name_input, record_id_input,
    old_values_input, new_values_input, ip_addr, user_agent_input
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate daily report data
CREATE OR REPLACE FUNCTION generate_daily_report(report_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB AS $$
DECLARE
  report_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'date', report_date,
    'summary', jsonb_build_object(
      'total_deposits', COALESCE(SUM(CASE WHEN s.type = 'deposit' THEN s.amount ELSE 0 END), 0),
      'total_withdrawals', COALESCE(SUM(CASE WHEN s.type = 'withdrawal' THEN s.amount ELSE 0 END), 0),
      'total_tax_collected', COALESCE(SUM(CASE WHEN s.type = 'withdrawal' THEN s.tax_amount ELSE 0 END), 0),
      'transaction_count', COUNT(*),
      'active_rts', COUNT(DISTINCT s.rt_id)
    ),
    'transactions', COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'rt_nomor', r.nomor,
        'rt_name', r.ketua_rt,
        'type', s.type,
        'amount', s.amount,
        'tax_amount', s.tax_amount,
        'amount_after_tax', s.amount_after_tax,
        'description', s.description,
        'time', s.created_at
      )
    ), '[]'::jsonb),
    'rt_summary', COALESCE(jsonb_agg(
      DISTINCT jsonb_build_object(
        'rt_nomor', r.nomor,
        'rt_name', r.ketua_rt,
        'current_balance', r.saldo,
        'daily_deposits', COALESCE(rt_deposits.total, 0),
        'daily_withdrawals', COALESCE(rt_withdrawals.total, 0)
      )
    ), '[]'::jsonb)
  ) INTO report_data
  FROM savings_transactions s
  JOIN rt r ON s.rt_id = r.id
  LEFT JOIN (
    SELECT rt_id, SUM(amount) as total
    FROM savings_transactions
    WHERE type = 'deposit' AND date = report_date
    GROUP BY rt_id
  ) rt_deposits ON r.id = rt_deposits.rt_id
  LEFT JOIN (
    SELECT rt_id, SUM(amount) as total
    FROM savings_transactions
    WHERE type = 'withdrawal' AND date = report_date
    GROUP BY rt_id
  ) rt_withdrawals ON r.id = rt_withdrawals.rt_id
  WHERE s.date = report_date;
  
  RETURN report_data;
END;
$$ LANGUAGE plpgsql;

-- Function to generate monthly report data
CREATE OR REPLACE FUNCTION generate_monthly_report(report_month INTEGER, report_year INTEGER)
RETURNS JSONB AS $$
DECLARE
  report_data JSONB;
  start_date DATE;
  end_date DATE;
BEGIN
  start_date := DATE(report_year || '-' || report_month || '-01');
  end_date := (start_date + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
  
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'month', report_month,
      'year', report_year,
      'start_date', start_date,
      'end_date', end_date
    ),
    'summary', jsonb_build_object(
      'total_deposits', COALESCE(SUM(CASE WHEN s.type = 'deposit' THEN s.amount ELSE 0 END), 0),
      'total_withdrawals', COALESCE(SUM(CASE WHEN s.type = 'withdrawal' THEN s.amount ELSE 0 END), 0),
      'total_tax_collected', COALESCE(SUM(CASE WHEN s.type = 'withdrawal' THEN s.tax_amount ELSE 0 END), 0),
      'net_savings', COALESCE(SUM(CASE WHEN s.type = 'deposit' THEN s.amount WHEN s.type = 'withdrawal' THEN -s.amount ELSE 0 END), 0),
      'transaction_count', COUNT(*),
      'deposit_count', COUNT(CASE WHEN s.type = 'deposit' THEN 1 END),
      'withdrawal_count', COUNT(CASE WHEN s.type = 'withdrawal' THEN 1 END)
    ),
    'rt_performance', COALESCE(jsonb_agg(
      jsonb_build_object(
        'rt_nomor', r.nomor,
        'rt_name', r.ketua_rt,
        'total_deposits', COALESCE(rt_stats.deposits, 0),
        'total_withdrawals', COALESCE(rt_stats.withdrawals, 0),
        'net_savings', COALESCE(rt_stats.net, 0),
        'current_balance', r.saldo,
        'transaction_count', COALESCE(rt_stats.tx_count, 0)
      )
    ), '[]'::jsonb)
  ) INTO report_data
  FROM rt r
  LEFT JOIN (
    SELECT 
      rt_id,
      SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as deposits,
      SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as withdrawals,
      SUM(CASE WHEN type = 'deposit' THEN amount WHEN type = 'withdrawal' THEN -amount ELSE 0 END) as net,
      COUNT(*) as tx_count
    FROM savings_transactions
    WHERE date >= start_date AND date <= end_date
    GROUP BY rt_id
  ) rt_stats ON r.id = rt_stats.rt_id
  LEFT JOIN savings_transactions s ON r.id = s.rt_id AND s.date >= start_date AND s.date <= end_date
  GROUP BY r.id, r.nomor, r.ketua_rt, r.saldo, rt_stats.deposits, rt_stats.withdrawals, rt_stats.net, rt_stats.tx_count;
  
  RETURN report_data;
END;
$$ LANGUAGE plpgsql;

-- Function to generate tax summary report
CREATE OR REPLACE FUNCTION generate_tax_summary_report(start_date DATE, end_date DATE)
RETURNS JSONB AS $$
DECLARE
  report_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'period', jsonb_build_object(
      'start_date', start_date,
      'end_date', end_date
    ),
    'tax_summary', jsonb_build_object(
      'total_tax_collected', COALESCE(SUM(tax_amount), 0),
      'total_withdrawals', COALESCE(SUM(amount), 0),
      'average_tax_rate', COALESCE(AVG(tax_rate), 0),
      'withdrawal_count', COUNT(*),
      'total_amount_after_tax', COALESCE(SUM(amount_after_tax), 0)
    ),
    'daily_breakdown', COALESCE(jsonb_agg(
      jsonb_build_object(
        'date', date,
        'tax_collected', daily_tax,
        'withdrawals', daily_withdrawals,
        'transaction_count', daily_count
      )
    ), '[]'::jsonb),
    'rt_tax_breakdown', COALESCE(rt_breakdown, '[]'::jsonb)
  ) INTO report_data
  FROM (
    SELECT 
      date,
      SUM(tax_amount) as daily_tax,
      SUM(amount) as daily_withdrawals,
      COUNT(*) as daily_count
    FROM savings_transactions
    WHERE type = 'withdrawal' AND date >= start_date AND date <= end_date
    GROUP BY date
    ORDER BY date
  ) daily_data,
  LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'rt_nomor', r.nomor,
        'rt_name', r.ketua_rt,
        'total_tax_paid', COALESCE(SUM(s.tax_amount), 0),
        'total_withdrawals', COALESCE(SUM(s.amount), 0),
        'withdrawal_count', COUNT(s.id)
      )
    ) as rt_breakdown
    FROM rt r
    LEFT JOIN savings_transactions s ON r.id = s.rt_id 
      AND s.type = 'withdrawal' 
      AND s.date >= start_date 
      AND s.date <= end_date
    GROUP BY r.id, r.nomor, r.ketua_rt
  ) rt_data,
  savings_transactions
  WHERE type = 'withdrawal' AND date >= start_date AND date <= end_date;
  
  RETURN report_data;
END;
$$ LANGUAGE plpgsql;
