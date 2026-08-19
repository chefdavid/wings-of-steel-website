-- Optional: Email queue table for processing registration emails
-- This is an alternative approach if you want to use a different email service

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  reply_to TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Add RLS policies
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access email queue
CREATE POLICY "Service role can manage email queue" ON email_queue
  FOR ALL TO service_role
  USING (true);

-- Create index for processing
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created_at ON email_queue(created_at);

-- Alternative: Database trigger to automatically queue emails on registration
CREATE OR REPLACE FUNCTION queue_registration_email()
RETURNS TRIGGER AS $$
DECLARE
  age INTEGER;
  experience_display TEXT;
BEGIN
  -- Calculate age
  age := DATE_PART('year', AGE(NEW.date_of_birth));
  
  -- Format experience level
  CASE NEW.experience_level
    WHEN 'beginner' THEN experience_display := 'No Experience / Beginner';
    WHEN 'some' THEN experience_display := 'Some Experience (1-2 years)';
    WHEN 'experienced' THEN experience_display := 'Experienced (3+ years)';
    WHEN 'sled' THEN experience_display := 'Previous Sled Hockey Experience';
    ELSE experience_display := NEW.experience_level;
  END CASE;

  -- Insert email into queue
  INSERT INTO email_queue (to, subject, body, reply_to)
  VALUES (
    ARRAY['jeanmwiederholt@gmail.com', 'sjsledhockey@hotmail.com'],
    'New Team Registration: ' || NEW.player_name,
    'New Team Registration Received!' || E'\n\n' ||
    'PLAYER INFORMATION' || E'\n' ||
    '==================' || E'\n' ||
    'Name: ' || NEW.player_name || E'\n' ||
    'Date of Birth: ' || NEW.date_of_birth || ' (Age: ' || age || ')' || E'\n' ||
    'Experience: ' || experience_display || E'\n' ||
    COALESCE('Diagnosis: ' || NEW.diagnosis || E'\n', '') ||
    E'\n' ||
    'PARENT/GUARDIAN CONTACT' || E'\n' ||
    '=======================' || E'\n' ||
    'Name: ' || NEW.parent_name || E'\n' ||
    'Email: ' || NEW.email || E'\n' ||
    'Phone: ' || NEW.phone || E'\n' ||
    E'\n' ||
    'ADDRESS' || E'\n' ||
    '=======' || E'\n' ||
    NEW.address || E'\n' ||
    NEW.city || ', ' || NEW.state || ' ' || NEW.zip_code || E'\n' ||
    E'\n' ||
    'EMERGENCY CONTACT' || E'\n' ||
    '=================' || E'\n' ||
    'Name: ' || NEW.emergency_contact || E'\n' ||
    'Phone: ' || NEW.emergency_phone || E'\n' ||
    E'\n' ||
    COALESCE('How they heard about us: ' || NEW.how_heard || E'\n', '') ||
    COALESCE('Additional Information: ' || NEW.additional_info || E'\n', '') ||
    E'\n' ||
    'Submitted: ' || NOW() || E'\n' ||
    E'\n' ||
    'Please contact this family within 24-48 hours.' || E'\n' ||
    E'\n' ||
    '---' || E'\n' ||
    'Wings of Steel Youth Sled Hockey' || E'\n' ||
    'No Child Pays to Play',
    NEW.email
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically queue email on new registration
CREATE TRIGGER queue_email_on_registration
  AFTER INSERT ON team_registrations
  FOR EACH ROW
  EXECUTE FUNCTION queue_registration_email();

-- Note: You'll need to set up a separate process (cron job, webhook, or external service)
-- to actually send the emails from the queue