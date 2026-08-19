# Game Highlights Setup Checklist

Follow these steps to get the game highlights feature working:

## ✅ Step 1: Create the Database Table

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Go to your Wings of Steel project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `src/scripts/create-game-highlights-table.sql`
6. Paste it into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

### Verify Table Creation

1. Go to **Table Editor** in the left sidebar
2. Look for the `game_highlights` table
3. You should see these columns:
   - id
   - game_id
   - title
   - summary
   - final_score
   - key_moments
   - player_highlights
   - photos
   - video_url
   - created_at
   - updated_at
   - created_by
   - is_published

## ✅ Step 2: Verify Storage Bucket

1. Go to **Storage** in the left sidebar
2. Look for a bucket named `game-photos`
3. If it doesn't exist:
   - Click **New bucket**
   - Name: `game-photos`
   - Public bucket: **Yes** (checked)
   - Click **Create bucket**

## ✅ Step 3: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Find `game_highlights` table
3. You should see policies like:
   - "Public can view published game highlights"
   - "Authenticated users can view all game highlights"
   - "Authenticated users can insert game highlights"
   - etc.

## ✅ Step 4: Test the Feature

1. Navigate to `/admin` on your website
2. Log in with admin credentials
3. Click **Game Highlights** in the sidebar
4. Select a game from the list
5. Try creating a highlight (you can leave fields empty for testing)
6. Click **Create Highlight**
7. You should see "Highlight created successfully"

## Common Issues

### "Failed to save highlight"

**Cause**: Database table doesn't exist or RLS policies not set

**Fix**:
1. Run the SQL script in Step 1
2. Check browser console (F12) for detailed error
3. Look for errors like "relation game_highlights does not exist"

### "Failed to upload photo"

**Cause**: Storage bucket doesn't exist or policies not set

**Fix**:
1. Create the `game-photos` bucket in Step 2
2. Make sure it's set to **Public**
3. Re-run the SQL script to ensure storage policies are created

### Photos showing 404 errors

**Cause**: Storage bucket is private or doesn't exist

**Fix**:
1. Go to Storage → game-photos
2. Click the settings gear icon
3. Make sure "Public bucket" is **enabled**

### "No games showing in sidebar"

**Cause**: No games in the `game_schedules` table

**Fix**:
1. Go to `/admin` → **Game Schedule**
2. Add some games first
3. Then return to Game Highlights

## Need Help?

If you're still having issues:

1. **Check browser console** (F12 → Console tab)
2. **Look for red error messages**
3. Copy the error message
4. Common errors:
   - "relation game_highlights does not exist" → Run the SQL script
   - "permission denied" → Check RLS policies
   - "bucket not found" → Create the storage bucket

## Quick Test Query

Run this in Supabase SQL Editor to test if everything is set up:

```sql
-- Test that the table exists and can be queried
SELECT COUNT(*) FROM game_highlights;

-- Test that you can insert (will fail if RLS is wrong)
SELECT * FROM storage.buckets WHERE name = 'game-photos';
```

Both queries should run without errors.
