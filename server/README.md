# Movie Max Server

Express backend service for E-Shown Movie Max.

## Features

- Health check endpoint for service monitoring
- CORS enabled
- JSON request parsing enabled

## Setup

1. Install dependencies:
   - `npm install`
2. (Optional) Create env file:
   - `cp .env.example .env`
3. Run in development:
   - `npm run dev`

Default server URL: [http://localhost:5000](http://localhost:5000)

## Scripts

- `npm run dev` - Run with nodemon
- `npm run start` - Run with node

## API

- `GET /api/health`
  - Response:
    - `{ "status": "ok" }`
