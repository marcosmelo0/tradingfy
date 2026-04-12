-- TABLES SETUP

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  initial_margin DECIMAL(12,2) NOT NULL DEFAULT 0,
  buffer_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  profit_target DECIMAL(12,2) NOT NULL DEFAULT 0,
  has_median BOOLEAN NOT NULL DEFAULT TRUE,
  median_multiplier DECIMAL(5,2) NOT NULL DEFAULT 5,
  type TEXT NOT NULL DEFAULT 'challenge',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset TEXT NOT NULL,
  open_date TIMESTAMPTZ NOT NULL,
  close_date TIMESTAMPTZ NOT NULL,
  side TEXT NOT NULL, -- 'C' or 'V'
  result DECIMAL(12,2) NOT NULL,
  external_id TEXT NOT NULL, -- Unique hash to prevent duplicates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicates per account
  UNIQUE(account_id, external_id)
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) ENABLED
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- POLICIES

-- Accounts policies
CREATE POLICY "Users can manage their own accounts" 
ON accounts FOR ALL 
USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can manage their own trades" 
ON trades FOR ALL 
USING (auth.uid() = user_id);

-- Withdrawals policies
CREATE POLICY "Users can manage their own withdrawals" 
ON withdrawals FOR ALL 
USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscription_status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'expired', 'admin'
  affiliate_id TEXT,
  is_first_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, trial_start_date, subscription_status, affiliate_id)
  VALUES (
    new.id, 
    now(), 
    'trial',
    (new.raw_user_meta_data->>'affiliate_id')::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INDEXES
CREATE INDEX idx_trades_account ON trades(account_id);
CREATE INDEX idx_trades_user ON trades(user_id);
CREATE INDEX idx_trades_date ON trades(close_date);
CREATE INDEX idx_withdrawals_account ON withdrawals(account_id);
CREATE INDEX idx_profiles_user ON profiles(id);
