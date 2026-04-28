# Schedule Update Guide - 2025-2026 Season

## Issue Resolved
The error "Could not find the 'date' column" was because the database uses separate `game_date` and `game_time` columns, not a combined `date` column.

## Database Schema (ACTUAL from Supabase)
The `game_schedules` table has these columns:
- `id` - Unique identifier
- `game_date` - Date in YYYY-MM-DD format
- `game_time` - Start time in HH:MM format (24-hour)
- `end_time` - End time (optional)
- `opponent` - Opponent team name
- `location` - Venue location
- `home_away` - Either 'home' or 'away'
- `game_type` - Type of game (optional)
- `result` - Game result (optional, used after game is complete)
- `notes` - Additional notes (optional)
- `season` - Season identifier (e.g., '2025-2026')
- `is_active` - Whether game is active
- `created_at` - Timestamp
- `updated_at` - Timestamp

Note: The database does NOT have `date`, `home_game`, or `status` columns.

## How to Import the Schedule

### Option 1: Admin Interface (Recommended)
1. Navigate to `/admin` and log in
2. Go to "Game Schedule" section
3. Click the green "Bulk Import" button
4. Review the 16 games in the preview table
5. Click "Import 2025-2026 Schedule"
6. The system will:
   - Delete existing 2025-2026 games
   - Import all 16 new games
   - Show success message with count

### Option 2: Manual Entry
Use the "Add Game" button in the admin interface to add games one by one.

### Option 3: Database Script (Advanced)
If you have direct database access:
```bash
npx tsx src/scripts/import-schedule.ts
```

## Schedule Data Location
The complete 2025-2026 schedule is stored in:
- `src/data/schedule-2025-2026.ts`

## Schedule Summary
- **Total Games**: 16
- **Home Games**: 11 (at Flyers Skate Zone)
- **Away Games**: 5
- **Season**: October 2025 - March 2026
- **Special Events**: 
  - Family Game/Holiday Party on 12/21/2025
  - Multiple TBD opponents to be determined

## Verification
All dates have been verified to have the correct day of the week. Run verification:
```bash
npx tsx src/scripts/verify-schedule-dates.ts
```

## Troubleshooting

### If import fails:
1. Check that your Supabase database has the correct schema
2. Ensure the `game_schedules` table exists (not `game_schedule`)
3. Verify the columns match the schema above
4. Check Supabase connection in `.env` file

### If games don't display:
1. Check browser console for errors
2. Verify Supabase anon key is correct
3. Ensure RLS policies allow reading game_schedules

## Files Modified
- `src/components/admin/ScheduleBulkImport.tsx` - New bulk import component
- `src/components/admin/GameScheduleManagement.tsx` - Updated to use correct fields
- `src/data/schedule-2025-2026.ts` - Complete schedule data
- `src/scripts/import-schedule.ts` - Command-line import script
- `src/scripts/verify-schedule-dates.ts` - Date verification script