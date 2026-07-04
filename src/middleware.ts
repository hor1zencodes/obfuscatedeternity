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

  // 2. If it's Roblox, invisibly proxy the request to your new raw GitHub repo!
  if (userAgent.toLowerCase().includes('roblox')) {
    return NextResponse.rewrite(new URL('https://raw.githubusercontent.com/hor1zencodes/patanahi/main/yearnerzen.lua'))
  }

  // 3. If it's a normal web browser, proceed to render the React page
  return NextResponse.next();
}
