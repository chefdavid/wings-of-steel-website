@echo off
echo Deploying Feedback Email Function to Supabase...
echo.
echo Make sure you have:
echo 1. Supabase CLI installed (npm install -g supabase)
echo 2. Logged in (supabase login)
echo.
pause

cd supabase/functions
supabase functions deploy send-feedback-email --project-ref zfiqvovfhkqiucmuwykw

echo.
echo Deployment complete!
echo Now set up the webhook in Supabase Dashboard.
pause