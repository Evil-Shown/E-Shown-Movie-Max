import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS for the mobile app, using Next.js 16's proxy.ts convention
 * (the renamed successor to middleware.ts — same behavior, runs on Node.js
 * rather than the Edge runtime).
 *
 * This API has no cookies/session auth to protect, so allowing all origins
 * is fine. If you ever add user accounts with cookie-based auth, lock this
 * down to specific origins.
 */
export function proxy(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  const response = NextResponse.next();
  for (const [key, value] of Object.entries(corsHeaders())) {
    response.headers.set(key, value);
  }
  return response;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export const config = {
  matcher: '/api/:path*',
};
