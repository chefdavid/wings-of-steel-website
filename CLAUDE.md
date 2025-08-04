# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wings of Steel is a championship sled hockey team website built with React, TypeScript, and Vite. The site promotes the team's mission of making sled hockey accessible to all children regardless of financial ability.

## Common Commands

```bash
# Development
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint for code quality
```

## Architecture

**Tech Stack:**
- React 19.1.0 with TypeScript
- Vite for build tooling
- Tailwind CSS with custom theme
- Framer Motion for animations

**Component Structure:**
The app is a single-page application with sections rendered in App.tsx:
- Navigation → Hero → About → Team → Schedule → GetInvolved → Contact → Footer

**Styling System:**
- Tailwind CSS with custom theme colors: steel-blue, steel-gray, ice-blue, dark-steel
- Custom fonts: Bebas Neue (sport), Oswald (display)
- Responsive design with mobile-first approach

**Key Files:**
- `src/App.tsx` - Main application component
- `tailwind.config.js` - Custom theme configuration
- `src/components/` - All section components

## Development Notes

- No testing framework currently configured
- All components use TypeScript with strict mode enabled
- Framer Motion is used extensively for animations
- The site emphasizes the "No child pays to play" mission throughout