# Event Visibility Management Setup

This document explains how to set up and use the event visibility toggle feature for Pizza Pins Sales and Golf Outing events.

## Overview

The event visibility system allows administrators to control which events are visible to visitors on the frontend. When an event is hidden:
- It will not appear in the navigation menu
- Direct links to the event will redirect to the home page
- Admin access to event management is not affected

## Database Setup

1. Run the SQL migration script to create the `event_visibility` table:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/event-visibility-setup.sql
```

This script will:
- Create the `event_visibility` table
- Insert default records for `pizza-pins-pop` and `golf-outing` events (both set to visible by default)
- Set up Row Level Security policies
- Create indexes for performance

## Admin Interface

1. Log into the admin dashboard at `/admin`
2. Navigate to **"Event Visibility"** in the sidebar menu
3. You'll see a list of all events with their current visibility status
4. Click **"Show"** or **"Hide"** to toggle visibility for each event
5. Changes take effect immediately on the frontend

## How It Works

### Frontend Behavior

- **Navigation Menu**: Events that are hidden will not appear in the navigation menu (both desktop and mobile)
- **Direct Links**: If someone tries to access a hidden event via direct URL (e.g., `/golf-outing`), they will be redirected to the home page
- **Real-time Updates**: The system uses Supabase real-time subscriptions to update visibility without requiring a page refresh

### Admin Access

- Admin access to event management pages (Pizza Pins Sales, Golf Outing) is **not** affected by visibility settings
- Administrators can always access these pages through the admin dashboard regardless of visibility status

## Technical Details

### Components Created

1. **`EventVisibilityManagement.tsx`**: Admin component for managing event visibility
2. **`useEventVisibility.ts`**: React hook for checking event visibility throughout the app
3. **`ProtectedEventRoute.tsx`**: Route wrapper component that redirects hidden events

### Database Schema

```sql
event_visibility (
  id UUID PRIMARY KEY,
  event_key VARCHAR(50) UNIQUE NOT NULL,  -- 'pizza-pins-pop' or 'golf-outing'
  event_name VARCHAR(255) NOT NULL,       -- Display name
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Event Keys

- `pizza-pins-pop`: Pizza, Pins & Pop event
- `golf-outing`: Golf Outing event

## Adding New Events

To add visibility control for a new event:

1. Insert a new record in the `event_visibility` table:
```sql
INSERT INTO event_visibility (event_key, event_name, is_visible)
VALUES ('new-event-key', 'New Event Name', true);
```

2. Update `Navigation.tsx` to add `eventKey` property to the menu item
3. Wrap the route in `App.tsx` with `ProtectedEventRoute`:
```tsx
<Route path="/new-event" element={
  <ProtectedEventRoute eventKey="new-event-key">
    <NewEventComponent />
  </ProtectedEventRoute>
} />
```

## Troubleshooting

### Events not appearing/hiding correctly

1. Check that the database table exists and has records
2. Verify the `event_key` matches exactly (case-sensitive)
3. Check browser console for any errors
4. Ensure Supabase real-time subscriptions are enabled

### Admin can't see events

- Admin access is not restricted by visibility settings
- If you can't see events in admin, check your authentication status

## Notes

- Visibility changes are immediate (no page refresh needed)
- The system defaults to showing events if there's an error (fail-open)
- All visibility checks are cached and updated via real-time subscriptions for performance

