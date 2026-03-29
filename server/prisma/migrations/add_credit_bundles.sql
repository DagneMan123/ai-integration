-- Create CreditBundle table
CREATE TABLE IF NOT EXISTS credit_bundles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  credit_amount INTEGER NOT NULL,
  price_etb DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_bundles_is_active ON credit_bundles(is_active);

-- Insert default credit bundles (1 Credit = 5 ETB)
INSERT INTO credit_bundles (name, credit_amount, price_etb, is_active)
VALUES
  ('Starter Pack', 5, 25.00, true),
  ('Professional Pack', 10, 50.00, true),
  ('Enterprise Pack', 20, 100.00, true),
  ('Premium Pack', 50, 250.00, true)
ON CONFLICT DO NOTHING;

-- Ensure Wallet table has proper constraints
ALTER TABLE wallets ADD CONSTRAINT IF NOT EXISTS wallets_user_id_unique UNIQUE (user_id);

-- Ensure Payment table has proper constraints
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_transaction_id_unique UNIQUE (transaction_id);
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_chapa_reference_unique UNIQUE (chapa_reference);

-- Create indexes for Payment table
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Create indexes for Wallet table
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

-- Create WalletTransaction table if not exists
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(50) NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for WalletTransaction table
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at);
