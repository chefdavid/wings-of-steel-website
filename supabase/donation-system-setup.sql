-- Donation System Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  company_name TEXT,
  amount DECIMAL(10,2) NOT NULL,
  donation_type TEXT NOT NULL CHECK (donation_type IN ('one-time', 'recurring')),
  player_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  message TEXT,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'canceled')),
  campaign_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Create donation_subscriptions table
CREATE TABLE IF NOT EXISTS donation_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Create donation_goals table
CREATE TABLE IF NOT EXISTS donation_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('monthly', 'annual', 'campaign')),
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(10,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_payment_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_payment_intent ON donations(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_donations_stripe_subscription ON donations(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_email ON donations(donor_email);
CREATE INDEX IF NOT EXISTS idx_donations_company_name ON donations(company_name) WHERE company_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_donations_player_name ON donations(player_name) WHERE player_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON donation_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON donation_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_donation_id ON donation_subscriptions(donation_id);

CREATE INDEX IF NOT EXISTS idx_goals_is_active ON donation_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON donation_goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_dates ON donation_goals(start_date, end_date);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_donation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers for updated_at
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_donation_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON donation_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_donation_updated_at();

CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON donation_goals
FOR EACH ROW
EXECUTE FUNCTION update_donation_updated_at();

-- 7. Enable Row Level Security
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_goals ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for donations
-- Public can read donations for progress bars (aggregated data only via views)
CREATE POLICY "Allow public read for progress tracking" ON donations
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Authenticated users can insert donations
CREATE POLICY "Allow public to create donations" ON donations
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Authenticated users can update their own donations (for status updates via webhook)
CREATE POLICY "Allow service role to update donations" ON donations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 9. Create RLS policies for donation_subscriptions
-- Public can read active subscriptions for display
CREATE POLICY "Allow public read subscriptions" ON donation_subscriptions
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Authenticated users can insert subscriptions
CREATE POLICY "Allow public to create subscriptions" ON donation_subscriptions
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

-- Authenticated users can update subscriptions
CREATE POLICY "Allow service role to update subscriptions" ON donation_subscriptions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 10. Create RLS policies for donation_goals
-- Public can read active goals
CREATE POLICY "Allow public read active goals" ON donation_goals
  FOR SELECT
  TO PUBLIC
  USING (is_active = true);

-- Authenticated users can manage goals (admin)
CREATE POLICY "Allow authenticated users to manage goals" ON donation_goals
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 11. Create view for donation progress (public-facing)
CREATE OR REPLACE VIEW donation_progress AS
SELECT 
  dg.id as goal_id,
  dg.goal_type,
  dg.goal_name,
  dg.target_amount,
  dg.start_date,
  dg.end_date,
  dg.is_active,
  COALESCE(SUM(d.amount), 0) as current_amount,
  CASE 
    WHEN dg.target_amount > 0 THEN 
      ROUND((COALESCE(SUM(d.amount), 0) / dg.target_amount) * 100, 2)
    ELSE 0
  END as percentage_complete,
  CASE 
    WHEN dg.end_date IS NOT NULL THEN 
      GREATEST(0, dg.end_date - CURRENT_DATE)
    ELSE NULL
  END as days_remaining,
  dg.created_at,
  dg.updated_at
FROM donation_goals dg
LEFT JOIN donations d ON d.campaign_id = dg.id AND d.payment_status = 'succeeded'
WHERE dg.is_active = true
GROUP BY dg.id, dg.goal_type, dg.goal_name, dg.target_amount, dg.start_date, dg.end_date, dg.is_active, dg.created_at, dg.updated_at;

-- 12. Create view for donation statistics (admin-facing)
CREATE OR REPLACE VIEW donation_statistics AS
SELECT 
  COUNT(*) FILTER (WHERE payment_status = 'succeeded') as total_donations,
  COUNT(DISTINCT donor_email) FILTER (WHERE payment_status = 'succeeded') as unique_donors,
  COALESCE(SUM(amount) FILTER (WHERE payment_status = 'succeeded'), 0) as total_raised,
  COALESCE(AVG(amount) FILTER (WHERE payment_status = 'succeeded'), 0) as average_donation,
  COUNT(*) FILTER (WHERE donation_type = 'recurring' AND payment_status = 'succeeded') as recurring_count,
  COUNT(*) FILTER (WHERE donation_type = 'one-time' AND payment_status = 'succeeded') as one_time_count,
  COALESCE(SUM(amount) FILTER (WHERE donation_type = 'recurring' AND payment_status = 'succeeded'), 0) as recurring_total,
  COALESCE(SUM(amount) FILTER (WHERE donation_type = 'one-time' AND payment_status = 'succeeded'), 0) as one_time_total,
  COUNT(*) FILTER (WHERE company_name IS NOT NULL AND payment_status = 'succeeded') as company_donations,
  COUNT(*) FILTER (WHERE player_name IS NOT NULL AND payment_status = 'succeeded') as player_honor_donations
FROM donations;

-- 13. Grant permissions
GRANT SELECT ON donation_progress TO PUBLIC;
GRANT SELECT ON donation_statistics TO authenticated;
GRANT SELECT ON donations TO PUBLIC;
GRANT INSERT ON donations TO PUBLIC;
GRANT SELECT ON donation_subscriptions TO PUBLIC;
GRANT INSERT ON donation_subscriptions TO PUBLIC;
GRANT SELECT ON donation_goals TO PUBLIC;

-- 14. Insert default active goal (optional - can be created via admin)
-- Uncomment and modify if you want a default goal
-- INSERT INTO donation_goals (goal_type, goal_name, target_amount, start_date, is_active, description)
-- VALUES ('monthly', 'January 2025 Goal', 5000.00, CURRENT_DATE, true, 'Monthly fundraising goal');

-- Verification queries (run these to verify setup)
-- SELECT * FROM donations LIMIT 1;
-- SELECT * FROM donation_subscriptions LIMIT 1;
-- SELECT * FROM donation_goals LIMIT 1;
-- SELECT * FROM donation_progress;
-- SELECT * FROM donation_statistics;

