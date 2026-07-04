import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // 1. Check if the request is from a Roblox executor
  const isRoblox = userAgent.toLowerCase().includes('roblox') || 
                   userAgent.toLowerCase().includes('synapse') || 
                   userAgent.toLowerCase().includes('krnl') ||
                   userAgent.toLowerCase().includes('fluxus') ||
                   userAgent.toLowerCase().includes('wave') ||
                   userAgent.toLowerCase().includes('macsploit');

  // 2. If it's Roblox, rewrite the request to serve the raw script
  // The script is now safely located in the 'public' folder
  if (userAgent.toLowerCase().includes('roblox')) {
    return NextResponse.rewrite(new URL('/api/script', request.url))
  }

  // 3. If it's a normal web browser, proceed to render the React page
  return NextResponse.next();
}
