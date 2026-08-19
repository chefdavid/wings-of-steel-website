# Sticky Note Feedback System

## Overview
A development-only feedback system that allows non-technical users to click anywhere on the website and leave comments. Feedback is automatically sent to your Supabase database.

## Setup Instructions

### 1. Create the Feedback Table in Supabase
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the SQL script in `supabase/create_feedback_table.sql`
4. This creates a `feedback` table with proper permissions

### 2. Configure Environment Variables
Make sure your `.env` file has your Supabase credentials:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Enable the Widget
The widget is automatically enabled in development via `.env.development`:
```env
VITE_ENABLE_FEEDBACK=true
```

## How Users Use It

1. **Click the blue message icon** (bottom-right corner)
2. **Click "Add Sticky Note"** button
3. **Click anywhere on the page** where there's an issue
4. **Type what's wrong** in the yellow sticky note
5. **Click "Send Feedback"** - That's it! No emails, no copying, it just sends automatically

## How You View Feedback

### Option 1: Supabase Dashboard (Easy)
1. Go to your Supabase project
2. Navigate to Table Editor
3. Select the `feedback` table
4. You'll see all feedback with:
   - The user's comment
   - Exact URL and element clicked
   - Position coordinates
   - Timestamp
   - Browser info

### Option 2: SQL Query
```sql
-- View recent feedback
SELECT * FROM feedback 
ORDER BY created_at DESC;

-- Mark feedback as resolved
UPDATE feedback 
SET resolved = true, notes = 'Fixed in v1.2' 
WHERE id = 'feedback-id-here';
```

## Features

- **Automatic submission** - Users just click send, no email needed
- **Visual sticky notes** - Yellow dots mark exactly where issues are
- **Success confirmation** - Green banner shows feedback was sent
- **Persistent notes** - Notes stay on page until submitted
- **Toggle visibility** - Eye icon to show/hide all notes

## Production Deployment

### To Enable in Production:
Add `?feedback=true` to any URL, or set `VITE_ENABLE_FEEDBACK=true` in production environment.

### To Disable (Default):
Simply don't set `VITE_ENABLE_FEEDBACK` in production, and the widget won't appear.

## Complete Removal

To completely remove the feedback system:

1. Remove from `src/App.tsx`:
   ```tsx
   // Remove these lines
   import FeedbackWidget from './components/FeedbackWidget'
   {import.meta.env.VITE_ENABLE_FEEDBACK === 'true' && <FeedbackWidget />}
   ```

2. Delete these files:
   - `src/components/FeedbackWidget.tsx`
   - `supabase/create_feedback_table.sql`
   - `FEEDBACK_SYSTEM.md` (this file)
   - Remove `VITE_ENABLE_FEEDBACK` from `.env.development`

## Troubleshooting

**Feedback not sending?**
- Check that Supabase credentials are in your `.env` file
- Verify the feedback table was created in Supabase
- Check browser console for errors

**Widget not appearing?**
- Make sure `VITE_ENABLE_FEEDBACK=true` is set
- Restart the dev server after changing .env files
- Try adding `?feedback=true` to the URL