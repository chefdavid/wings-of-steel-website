-- This SQL sets up automatic email notifications when feedback is submitted
-- Run this in your Supabase SQL Editor after creating the feedback table

-- Create a database function to call the Edge Function
CREATE OR REPLACE FUNCTION notify_feedback_submission()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function to send email
  PERFORM
    net.http_post(
      url := 'https://zfiqvovfhkqiucmuwykw.supabase.co/functions/v1/send-feedback-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object('record', NEW)
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires when new feedback is inserted
DROP TRIGGER IF EXISTS on_feedback_created ON feedback;
CREATE TRIGGER on_feedback_created
  AFTER INSERT ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION notify_feedback_submission();

-- Alternative: If you prefer using Supabase's built-in webhook feature
-- You can create a webhook instead of the trigger above:
-- 1. Go to Database > Webhooks in Supabase Dashboard
-- 2. Create a new webhook for the 'feedback' table
-- 3. Set it to trigger on INSERT
-- 4. Point it to your Edge Function URL