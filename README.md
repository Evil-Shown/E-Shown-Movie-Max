# E-Shown Movie Max

A full-stack movie discovery app with a cinematic Next.js frontend and a lightweight Express backend.

The frontend powers the complete experience (home highlights, browse filters, search, movie detail pages, and infinite loading). Data is fetched from TMDB/OMDB when configured, with local fallback data so the app still runs without external API keys.

## Tech Stack

- Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- UI/Animations: Framer Motion, Three.js (`@react-three/fiber`, `@react-three/drei`)
- Backend: Node.js, Express 5, CORS
- Tooling: ESLint, Nodemon

## Project Structure

```text
E-Shown Movie Max/
  client/   # Next.js frontend app
  server/   # Express backend service
```

## Prerequisites

- Node.js 20+ recommended
- npm 10+

## Quick Start

1. Install dependencies:
   - `cd client && npm install`
   - `cd ../server && npm install`
2. Configure environment variables:
   - Copy `client/.env.example` to `client/.env.local`
   - (Optional) Copy `server/.env.example` to `server/.env`
3. Run both apps in separate terminals:
   - Frontend: `cd client && npm run dev`
   - Backend: `cd server && npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Frontend (`client/.env.local`)

Required for live catalog/search data:

```env
TMDB_API_KEY=your_tmdb_api_key
OMDB_API_KEY=your_omdb_api_key
```

Behavior without keys:
- No TMDB key: app uses curated local fallback catalog
- No OMDB key: search still works with TMDB/local sources

### Backend (`server/.env`)

Optional:

```env
PORT=5000
```

## Available Scripts

### Frontend (`client`)

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

### Backend (`server`)

- `npm run dev` - Start Express server with nodemon
- `npm run start` - Start Express server with node

## API Endpoints

Backend service currently exposes:

- `GET /api/health` - Health check response

Frontend also exposes app routes under `client/app/api`:

- `GET /api/browse` - Browse catalog pages (genre/sort/page query params)

## Notes

- Do not commit real API keys (`.env.local`, `.env`)
- The existing `client/.env.local` appears to contain active keys; rotate them if they were shared publicly

## License

No license has been declared yet. Add one before publishing/distributing.
