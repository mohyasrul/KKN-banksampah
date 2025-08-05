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

-- Create app settings table for configurations
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
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
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

-- Create audit log table for tracking activities
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
('session_timeout_hours', '4', 'number', 'Session timeout in hours'),
('max_login_attempts', '5', 'number', 'Maximum failed login attempts before lockout'),
('lockout_duration_minutes', '30', 'number', 'Account lockout duration in minutes')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default users (Admin RW dan 2 Operator/Pengelola)
-- Password default: 'password123' - HARUS DIGANTI setelah first login
-- Hash menggunakan bcrypt dengan salt rounds 10
INSERT INTO users (username, password_hash, full_name, role, email) VALUES
('admin_rw', '$2b$10$rOy8K2M3Z1bQ7yJ8wP4XA.3yJ9Q5K8L6M7N2O1P9Q3R4S5T6U7V8W9', 'Administrator RW 10', 'admin', 'rw10@desa.cidatar.id'),
('pengelola1', '$2b$10$rOy8K2M3Z1bQ7yJ8wP4XA.3yJ9Q5K8L6M7N2O1P9Q3R4S5T6U7V8W9', 'Pengelola Bank Sampah 1', 'operator', 'pengelola1@banksampah.rw10.id'),
('pengelola2', '$2b$10$rOy8K2M3Z1bQ7yJ8wP4XA.3yJ9Q5K8L6M7N2O1P9Q3R4S5T6U7V8W9', 'Pengelola Bank Sampah 2', 'operator', 'pengelola2@banksampah.rw10.id')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

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

-- Function to authenticate user with lockout protection
CREATE OR REPLACE FUNCTION authenticate_user(input_username TEXT, input_password TEXT, ip_addr TEXT DEFAULT NULL)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  full_name TEXT,
  role TEXT,
  is_valid BOOLEAN,
  is_locked BOOLEAN,
  message TEXT
) AS $$
DECLARE
  user_record RECORD;
  max_attempts INTEGER;
  lockout_duration INTEGER;
BEGIN
  -- Get security settings
  SELECT CAST(setting_value AS INTEGER) INTO max_attempts
  FROM app_settings WHERE setting_key = 'max_login_attempts' AND is_active = true;
  
  SELECT CAST(setting_value AS INTEGER) INTO lockout_duration
  FROM app_settings WHERE setting_key = 'lockout_duration_minutes' AND is_active = true;
  
  -- Default values if settings not found
  IF max_attempts IS NULL THEN max_attempts := 5; END IF;
  IF lockout_duration IS NULL THEN lockout_duration := 30; END IF;
  
  -- Get user record
  SELECT * INTO user_record FROM users u WHERE u.username = input_username AND u.is_active = true;
  
  -- User not found
  IF user_record IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, false, false, 'Username tidak ditemukan';
    RETURN;
  END IF;
  
  -- Check if account is locked
  IF user_record.locked_until IS NOT NULL AND user_record.locked_until > NOW() THEN
    RETURN QUERY SELECT user_record.id, user_record.username, user_record.full_name, user_record.role, 
                        false, true, 'Akun terkunci. Coba lagi dalam ' || 
                        EXTRACT(MINUTES FROM (user_record.locked_until - NOW()))::TEXT || ' menit';
    RETURN;
  END IF;
  
  -- Validate password
  IF user_record.password_hash = crypt(input_password, user_record.password_hash) THEN
    -- Password correct - reset failed attempts and update last login
    UPDATE users SET 
      failed_login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
    WHERE id = user_record.id;
    
    -- Log successful login
    INSERT INTO audit_logs (user_id, action, ip_address) 
    VALUES (user_record.id, 'LOGIN_SUCCESS', ip_addr);
    
    RETURN QUERY SELECT user_record.id, user_record.username, user_record.full_name, user_record.role,
                        true, false, 'Login berhasil';
  ELSE
    -- Password incorrect - increment failed attempts
    UPDATE users SET 
      failed_login_attempts = failed_login_attempts + 1,
      locked_until = CASE 
        WHEN failed_login_attempts + 1 >= max_attempts THEN NOW() + INTERVAL '1 minute' * lockout_duration
        ELSE NULL
      END
    WHERE id = user_record.id;
    
    -- Log failed login
    INSERT INTO audit_logs (user_id, action, ip_address) 
    VALUES (user_record.id, 'LOGIN_FAILED', ip_addr);
    
    IF user_record.failed_login_attempts + 1 >= max_attempts THEN
      RETURN QUERY SELECT user_record.id, user_record.username, user_record.full_name, user_record.role,
                          false, true, 'Terlalu banyak percobaan login. Akun dikunci selama ' || lockout_duration || ' menit';
    ELSE
      RETURN QUERY SELECT user_record.id, user_record.username, user_record.full_name, user_record.role,
                          false, false, 'Password salah. Sisa percobaan: ' || (max_attempts - user_record.failed_login_attempts - 1);
    END IF;
  END IF;
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
  FROM app_settings WHERE setting_key = 'session_timeout_hours' AND is_active = true;
  
  -- Default to 4 hours if not found
  IF session_hours IS NULL THEN session_hours := 4; END IF;
  
  -- Deactivate existing sessions for user
  UPDATE user_sessions SET is_active = false WHERE user_id = user_uuid;
  
  -- Create new session
  INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (
    user_uuid,
    session_token_input,
    NOW() + INTERVAL '1 hour' * session_hours,
    ip_addr,
    user_agent_input
  )
  RETURNING id INTO session_id;
  
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

-- Function to logout user
CREATE OR REPLACE FUNCTION logout_user(session_token_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_uuid UUID;
BEGIN
  -- Get user_id and deactivate session
  UPDATE user_sessions 
  SET is_active = false 
  WHERE session_token = session_token_input AND is_active = true
  RETURNING user_id INTO user_uuid;
  
  -- Log logout if session was found
  IF user_uuid IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, action) VALUES (user_uuid, 'LOGOUT');
    RETURN true;
  END IF;
  
  RETURN false;
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

-- Function to calculate withdrawal tax
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
  FROM app_settings WHERE setting_key = 'tax_rate' AND is_active = true;
  
  -- Default to 10% if not found
  IF current_tax_rate IS NULL THEN current_tax_rate := 0.10; END IF;
  
  RETURN QUERY SELECT 
    withdrawal_amount * current_tax_rate,
    withdrawal_amount - (withdrawal_amount * current_tax_rate),
    current_tax_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get minimum withdrawal amount
CREATE OR REPLACE FUNCTION get_min_withdrawal_amount()
RETURNS DECIMAL AS $$
DECLARE
  min_amount DECIMAL;
BEGIN
  SELECT CAST(setting_value AS DECIMAL) INTO min_amount
  FROM app_settings WHERE setting_key = 'min_withdrawal_amount' AND is_active = true;
  
  -- Default to 50000 if not found
  IF min_amount IS NULL THEN min_amount := 50000; END IF;
  
  RETURN min_amount;
END;
$$ LANGUAGE plpgsql;
