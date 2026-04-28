# Image Audit Report - Wings of Steel Website

## Local Image Files

### Public Directory Images
| File | Size | Path | Usage |
|------|------|------|-------|
| wings-logo.png | 490K | `/public/assets/wings-logo.png` | Main logo used in Navigation and TeamLanding components |
| hockey-sticks2.webp | 103K | `/public/images/hockey-sticks2.webp` | Hero background image (newly added) |
| vite.svg | 1.5K | `/public/vite.svg` | Default Vite logo (not used in production) |

### Source Assets
| File | Size | Path | Usage |
|------|------|------|-------|
| react.svg | 4.1K | `/src/assets/react.svg` | Default React logo (not used in production) |

### Distribution (Built Files)
| File | Size | Path | Notes |
|------|------|------|-------|
| wings-logo.png | 490K | `/dist/assets/wings-logo.png` | Copied during build |
| vite.svg | 1.5K | `/dist/vite.svg` | Copied during build |

## External Image Sources

### UI Avatars API
- **Service**: https://ui-avatars.com
- **Usage**: Default avatars for players and coaches without photos
- **Components Using It**:
  - `CoachManagement.tsx` - Default coach avatars
  - `PlayerManagement.tsx` - Default player avatars  
  - `TeamAssignmentManager.tsx` - Default team member avatars
  - `Team.tsx` - Display avatars for team roster
- **Format**: Dynamic generation based on name
- **Example**: `https://ui-avatars.com/api/?name=John Doe&background=4682B4&color=fff&size=128`

### Database-Stored Image URLs
- Player photos stored in `players.image_url` field
- Coach photos stored in `coaches.image_url` field
- These override the UI Avatars when available

### Printify Product Images
- Product images loaded dynamically from Printify API
- Stored in `PrintifyProduct.images` array
- Used in Store component for merchandise display

## Image Usage by Component

1. **Hero.tsx**
   - `/images/hockey-sticks2.webp` (103K) - Background image

2. **Navigation.tsx**
   - `/assets/wings-logo.png` (490K) - Logo in header

3. **TeamLanding.tsx**
   - `/assets/wings-logo.png` (490K) - Logo display

4. **Team.tsx**
   - UI Avatars API - Player/coach default avatars
   - Database URLs - Custom player/coach photos

5. **Store.tsx**
   - Printify API - Product images

6. **Admin Components**
   - UI Avatars API - Default avatars
   - Database URLs - Custom uploaded photos

## Recommendations

### Current Issues
1. **Large Logo File**: The wings-logo.png is 490K, which is quite large for a logo
   - Consider optimizing or converting to WebP format
   - Could reduce to ~50-100K without quality loss

2. **Missing Favicon**: No favicon.ico file found
   - Should add a favicon for browser tabs

3. **Unused Default Assets**: 
   - `vite.svg` and `react.svg` can be deleted

### Optimization Opportunities
1. Convert wings-logo.png to WebP format for better compression
2. Add responsive image sizes for different screen sizes
3. Implement lazy loading for player/coach images
4. Consider local caching of frequently used UI Avatar images

## Total Project Image Size
- **Local images**: ~598K (excluding dist folder)
- **External images**: Loaded on-demand (UI Avatars, Printify)

## File Structure
```
WingsWebsite/
├── public/
│   ├── assets/
│   │   └── wings-logo.png (490K)
│   ├── images/
│   │   └── hockey-sticks2.webp (103K)
│   └── vite.svg (1.5K)
├── src/
│   └── assets/
│       └── react.svg (4.1K)
└── dist/ (build output)
    ├── assets/
    │   └── wings-logo.png (490K)
    └── vite.svg (1.5K)
```