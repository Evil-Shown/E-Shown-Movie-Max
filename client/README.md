# Movie Max Client

Next.js frontend for E-Shown Movie Max.

## Features

- Cinematic homepage with featured sections (trending, top rated, new releases)
- Browse page with genre/sort filters and infinite loading
- Search and detail experiences powered by TMDB/OMDB when available
- Local catalog fallback when API keys are not configured

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Framer Motion + Three.js

## Setup

1. Install dependencies:
   - `npm install`
2. Copy environment file:
   - `cp .env.example .env.local`
3. Add keys to `.env.local`:
   - `TMDB_API_KEY=your_tmdb_api_key`
   - `OMDB_API_KEY=your_omdb_api_key`
4. Start dev server:
   - `npm run dev`

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Lint codebase

## Key Directories

- `app/` - App Router pages and route handlers
- `components/` - Reusable UI components
- `lib/` - Data fetching/mapping services and helpers
- `public/` - Static assets

For full project documentation, see the root `README.md`.
