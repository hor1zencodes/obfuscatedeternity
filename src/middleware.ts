import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Cache the lowercase user-agent for faster checking
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // 2. Check if the request is from a Roblox executor
  if (
    userAgent.includes('roblox') || 
    userAgent.includes('synapse') || 
    userAgent.includes('krnl') ||
    userAgent.includes('fluxus') ||
    userAgent.includes('wave') ||
    userAgent.includes('macsploit')
  ) {
    // 3. USE REDIRECT INSTEAD OF REWRITE: 
    // This forces the executor to directly hit GitHub's ultra-fast global CDN
    // instead of making Vercel download it first and act as a middleman.
    // game:HttpGet() automatically follows redirects instantly.
    return NextResponse.redirect(new URL('https://raw.githubusercontent.com/hor1zencodes/patanahi/main/yearnerzen.lua'), 307);
  }

  // 3. If it's a normal web browser, proceed to render the React page
  return NextResponse.next();
}

// 4. MAXIMUM SPEED: Only run middleware on actual page routes. 
// Skip all static assets (.mp3, .png, _next) so the server doesn't waste time checking them.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg)$).*)',
  ],
};
