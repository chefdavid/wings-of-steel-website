# Wings of Steel Database Management Tools

This directory contains Node.js scripts for direct database interaction and troubleshooting.

## Available Tools

### 🗄️ Database Manager (`db-manager.js`)
Direct Supabase database access with service role (bypasses RLS).

**Commands:**
```bash
# List all players in database
npm run db:list

# Get database statistics
npm run db:stats

# Test database connection
npm run db:test

# Clear all players (⚠️ DESTRUCTIVE)
npm run db:clear

# Insert real Wings of Steel roster
npm run db:insert

# Replace entire roster (clear + insert)
npm run db:replace

# Show help
npm run db
```

### 🔍 Frontend Debugger (`debug-frontend.js`)
Tests the same API calls that React app makes using anon key.

```bash
# Debug what React app sees
npm run debug:frontend
```

## Usage Examples

### Check current roster:
```bash
npm run db:list
```

### Fix roster issues:
```bash
# If players are wrong, replace with correct roster
npm run db:replace

# Verify it worked
npm run db:list
```

### Debug frontend issues:
```bash
# Check what React app should see
npm run debug:frontend

# If data is correct but React shows old data:
# 1. Hard refresh browser (Ctrl+F5)
# 2. Clear browser cache
# 3. Restart dev server
```

### Add individual player:
```javascript
const dbManager = new DatabaseManager();
await dbManager.addPlayer({
  name: 'New Player',
  age: 15,
  position: 'Forward',
  bio: 'Bio here',
  jersey_number: 99,
  tags: ['Rookie'],
  image_url: null
});
```

### Update player:
```javascript
const dbManager = new DatabaseManager();
await dbManager.updatePlayer('Jack Ashby', {
  tags: ['Captain', 'MVP']
});
```

## Environment Variables

The tools automatically detect and use:
- `VITE_SUPABASE_URL` (defaults to `http://127.0.0.1:54321`)
- `SUPABASE_SERVICE_ROLE_KEY` (defaults to local dev key)
- `VITE_SUPABASE_ANON_KEY` (defaults to local dev key)

## Troubleshooting

### "No players found"
```bash
npm run db:test    # Test connection
npm run db:stats   # Check if any data exists
npm run db:replace # Reset to correct roster
```

### "React app shows old data"
```bash
npm run debug:frontend  # Check API response
# Then hard refresh browser (Ctrl+F5)
```

### "Database connection failed"
```bash
npx supabase status  # Check if Supabase is running
npx supabase start   # Start if not running
```

## Database Schema

Players table structure:
```sql
CREATE TABLE players (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    position TEXT NOT NULL,
    bio TEXT NOT NULL,
    image_url TEXT,           -- Nullable
    jersey_number INT NOT NULL,
    tags TEXT[] DEFAULT '{}'  -- Array of tags
);
```

## Real Roster Data

The tools include the complete Wings of Steel roster:
- **14 players total**
- **10 Forwards** (including Jack Ashby #20 Captain, AJ Gonzales #8 Assistant Captain)
- **2 Defense** (Shane Phillips #2, Colin Wiederholt #7)
- **2 Goalies** (Lily Corrigan #TBD, Laurel Jastrzembski #44)

## Safety Features

- Service role access for administrative tasks
- Anon key testing to match React app behavior
- Clear confirmation messages
- Table output for easy data verification
- Automatic error handling and reporting