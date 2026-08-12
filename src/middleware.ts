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
    // 3. SECURE LOADER: 
    // If they hit the root URL, we give them the Loader Script, not the full script.
    if (request.nextUrl.pathname === '/') {
      const loaderScript = `
local username = game:GetService("Players").LocalPlayer.Name
local url = "https://zeneternity.vercel.app/api/authenticate?user=" .. username
local scriptData = game:HttpGet(url, true)

if scriptData:match("Access Denied") then
    game.Players.LocalPlayer:Kick("Eternity: You are not whitelisted.")
    return
end

-- Start Heartbeat Ping Loop
task.spawn(function()
    while true do
        task.wait(30)
        pcall(function()
            game:HttpGet("https://zeneternity.vercel.app/api/ping?user=" .. username)
        end)
    end
end)

-- Execute Premium Script
loadstring(scriptData)()
`;
      return new NextResponse(loaderScript, {
        headers: { 'Content-Type': 'text/plain' },
      });
    }
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
