# Game Highlights Feature - Setup Guide

This document explains how to set up and use the Game Highlights feature for the Wings of Steel website.

## Overview

The Game Highlights feature allows administrators to:
- Add game summaries and recaps for completed games
- Upload multiple photos from each game
- Track key moments and player highlights
- Link to game videos
- Display highlights to visitors on the website

## Database Setup

### 1. Run the SQL Schema

Execute the SQL script located at `src/scripts/create-game-highlights-table.sql` in your Supabase SQL editor.

This script will:
- Create the `game_highlights` table
- Set up Row Level Security (RLS) policies
- Create a storage bucket for game photos (`game-photos`)
- Set up automatic timestamp updates

### 2. Verify Table Creation

In Supabase, verify that:
- The `game_highlights` table exists with all columns
- The `game-photos` storage bucket is created
- RLS policies are enabled

## How to Use

### Admin Panel Access

1. Navigate to `/admin` on your website
2. Log in with admin credentials
3. Click on "Game Highlights" in the left sidebar

### Creating a Game Highlight

1. **Select a Game**: Click on a game from the left sidebar
   - Past games are preferred for highlights
   - Games with existing highlights will show a "Has Highlight" badge

2. **Fill in Details**:
   - **Title**: Give the game recap a catchy title (e.g., "Dominant Victory Over Hammerheads")
   - **Final Score**: Enter the score (e.g., "5-2")
   - **Game Summary**: Write a detailed summary of the game
   - **Video URL**: (Optional) Link to a YouTube or other video of the game

3. **Add Key Moments**:
   - Enter the time (e.g., "1st Period 5:23")
   - Describe what happened (e.g., "Smith scores on a breakaway")
   - Click "Add" to include the moment

4. **Add Player Highlights**:
   - Enter player name
   - Describe their achievement (e.g., "2 goals, 1 assist")
   - Click "Add" to include

5. **Upload Photos**:
   - Select multiple photos at once (hold Ctrl/Cmd to select multiple)
   - Photos are **automatically compressed and optimized** - no need to resize them first!
   - (Optional) Add a caption for the first photo
   - The system will:
     - Resize images to max 1920px (maintains aspect ratio)
     - Compress to high-quality JPEG (85% quality)
     - Show you the file size reduction
     - Support up to 50MB per original file
   - Progress bar shows compression and upload status
   - Delete photos by hovering and clicking the "Delete" button

6. **Publish**:
   - Check the "Publish" checkbox to make the highlight visible to the public
   - Click "Create Highlight" or "Update Highlight"

### Editing a Highlight

1. Select a game that has an existing highlight
2. Modify any fields as needed
3. Click "Update Highlight"

### Deleting a Highlight

1. Select the game highlight you want to delete
2. Click the "Delete Highlight" button (red button at top right)
3. Confirm the deletion

## How Highlights Appear on the Website

### Schedule Page

- Published highlights appear in a "Game Highlights" section on the schedule page
- Shows up to 6 most recent game highlights as cards
- Each card displays:
  - Game photo (if uploaded)
  - Game date and score
  - Title and summary preview
  - Number of player highlights and photos

### Individual Game Pages

When a visitor clicks on a highlight card:
- They're taken to `/game/{gameId}`
- The full game recap is displayed with:
  - Hero section with game details and score
  - Full game summary
  - All key moments in chronological order
  - All player highlights
  - Photo gallery (click photos to view full size)
  - Video link (if provided)

## Automatic Photo Optimization

The system includes built-in automatic photo optimization that makes it easy for anyone to upload photos, regardless of technical knowledge.

### How It Works

When you upload photos, the system automatically:

1. **Validates** - Checks that files are images and under 50MB
2. **Compresses** - Reduces file size while maintaining quality
3. **Resizes** - Scales down large images to web-friendly dimensions (max 1920px)
4. **Converts** - Optimizes to JPEG format for best web performance
5. **Reports** - Shows you exactly how much space was saved

### Benefits

- **No technical skills needed** - Just select your photos and upload
- **Faster page loads** - Optimized images load quickly for visitors
- **Storage savings** - Reduced file sizes save Supabase storage space
- **Better quality** - Maintains visual quality while reducing size
- **Batch processing** - Upload multiple photos at once

### Technical Details

- **Max original size**: 50MB per file
- **Output size**: Typically 100-500KB per photo (60-90% reduction for large files)
- **Output format**: JPEG at 80% quality
- **Max dimensions**: 1920px width/height (maintains aspect ratio)
- **Processing**: Client-side (no server load)
- **Smart optimization**:
  - Small images under 300KB that are already JPEG are kept as-is
  - If compression makes file larger, original is used instead
  - Only compresses when it actually helps reduce file size

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   └── GameHighlightsManagement.tsx  # Admin interface
│   ├── GameHighlights.tsx                # Full game highlight display
│   └── GameHighlightsPreview.tsx         # Preview card component
├── hooks/
│   └── useGameHighlights.ts              # Hook for data management
├── pages/
│   └── GamePage.tsx                      # Individual game page
├── types/
│   └── database.ts                       # TypeScript types
├── utils/
│   └── imageCompression.ts               # Photo optimization utility
└── scripts/
    └── create-game-highlights-table.sql  # Database schema
```

## Data Structure

### GameHighlight Interface

```typescript
{
  id: string;
  game_id: string;
  title?: string;
  summary?: string;
  final_score?: string;
  key_moments: Array<{
    time: string;
    description: string;
  }>;
  player_highlights: Array<{
    player_name: string;
    achievement: string;
  }>;
  photos: Array<{
    url: string;
    caption?: string;
    order: number;
  }>;
  video_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

## Tips and Best Practices

### Photos
- **Upload your best photos directly** - the system automatically compresses and optimizes them!
- No need to resize or compress beforehand - just select your original photos
- Upload multiple photos at once for faster workflow
- Use high-quality, action shots when possible
- The system will:
  - Automatically resize large images to 1920px max (perfect for web)
  - Compress to optimized JPEG format
  - Show you how much space was saved
  - Typically reduces file sizes by 60-90%
- Add descriptive captions to provide context
- Upload photos in the order you want them displayed

### Game Summary
- Include final score, standout plays, and team performance
- Mention both offensive and defensive highlights
- Keep it engaging and positive
- Typical length: 2-4 paragraphs

### Key Moments
- Focus on game-changing plays
- Include period and approximate time
- Be concise but descriptive

### Player Highlights
- Recognize both scoring and defensive contributions
- Include assists, saves, and other achievements
- Be fair and recognize multiple players when possible

## Troubleshooting

### Photos Not Uploading
- Check original file size (max 50MB before compression)
- Ensure files are valid image formats (JPG, PNG, WebP, etc.)
- Verify the `game-photos` bucket exists in Supabase Storage
- Check browser console for errors
- Ensure storage policies are set correctly
- Try uploading one photo at a time if batch upload fails
- Clear browser cache and try again

### Compression Taking Too Long
- Large batches (10+ photos) may take 30-60 seconds to compress
- Very large original files (20MB+) take longer to process
- This is normal - compression happens in your browser
- Progress bar shows current status
- Consider uploading in smaller batches if needed

### Highlights Not Showing on Website
- Verify the "Publish" checkbox is checked
- Clear browser cache
- Check that the game is in the past games list
- Verify RLS policies allow public read access for published highlights

### Cannot Edit/Delete Highlights
- Ensure you're logged in as admin
- Check authentication status
- Verify RLS policies allow authenticated users to modify data

## Security Notes

- Only authenticated admin users can create/edit/delete highlights
- Only published highlights are visible to the public
- Photos are stored in a public bucket but URLs are not easily guessable
- Consider implementing additional authentication layers for production use

## Future Enhancements

Potential features to add:
- Video upload (currently supports URLs only)
- Multiple video clips per game
- Social media integration for sharing
- Game statistics integration
- Email notifications when highlights are published
- Comment system for highlights
