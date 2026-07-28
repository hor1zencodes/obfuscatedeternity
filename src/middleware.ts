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
    // 3. SECURE REWRITE: 
    // Acts as an invisible proxy. The executor never sees the real GitHub URL.
    const targetUrl = new URL('https://api.jnkie.com/api/v1/luascripts/public/33c4e8b5d41c8725d2d612456622846dc4201c3d8b2ea5d7f7eb90a374984081/download');
    
    // Add a timestamp to bust Vercel's Edge cache so it always fetches the newest version
    targetUrl.searchParams.set('t', Date.now().toString());

    const response = NextResponse.rewrite(targetUrl);
    
    // Force headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    
    return response;
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
