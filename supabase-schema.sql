-- Valentine Message Generator Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Create clicks table (for analytics)
CREATE TABLE IF NOT EXISTS clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  recipient_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_sender_email ON messages(sender_email);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_clicked ON messages(clicked);
CREATE INDEX IF NOT EXISTS idx_clicks_message_id ON clicks(message_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using anon key)
-- Allow anyone to insert messages (for link generation)
CREATE POLICY "Allow public insert on messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read their own messages by ID
CREATE POLICY "Allow public read on messages"
  ON messages
  FOR SELECT
  TO public
  USING (true);

-- Allow anyone to update messages (for click tracking)
CREATE POLICY "Allow public update on messages"
  ON messages
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow anyone to insert clicks
CREATE POLICY "Allow public insert on clicks"
  ON clicks
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read clicks
CREATE POLICY "Allow public read on clicks"
  ON clicks
  FOR SELECT
  TO public
  USING (true);

-- Create users table (for OAuth authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Add missing columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS ip_address TEXT;

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Create rate_limits table (for rate limiting)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_email ON rate_limits(user_email);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);

-- Enable RLS on new tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table
CREATE POLICY "Allow public read on users"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on users"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on users"
  ON users
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- RLS policies for rate_limits table
CREATE POLICY "Allow public access on rate_limits"
  ON rate_limits
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Backfill user_id for existing messages (match by email)
-- This will run safely even if no users exist yet
UPDATE messages m
SET user_id = u.id
FROM users u
WHERE m.sender_email = u.email
AND m.user_id IS NULL;

-- Optional: Add some sample data for testing
-- Uncomment the lines below to add test data
/*
INSERT INTO messages (recipient_name, sender_email, sender_name)
VALUES
  ('Sarah', 'john@example.com', 'John'),
  ('Emma', 'mike@example.com', 'Mike'),
  ('Alex', 'jane@example.com', NULL);

-- Mark one as clicked
UPDATE messages
SET clicked = true, clicked_at = NOW()
WHERE recipient_name = 'Sarah';

INSERT INTO clicks (message_id, recipient_name, sender_email)
SELECT id, recipient_name, sender_email
FROM messages
WHERE recipient_name = 'Sarah';
*/
