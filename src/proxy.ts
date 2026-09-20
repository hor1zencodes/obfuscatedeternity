import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Cache the lowercase user-agent and accept header
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  const accept = (request.headers.get('accept') || '').toLowerCase();
  const secFetchDest = (request.headers.get('sec-fetch-dest') || '').toLowerCase();

  // 2. Check if the request is from a Roblox executor or Lua HttpGet
  const isRoblox =
    userAgent.includes('roblox') ||
    userAgent.includes('synapse') ||
    userAgent.includes('krnl') ||
    userAgent.includes('fluxus') ||
    userAgent.includes('wave') ||
    userAgent.includes('macsploit') ||
    userAgent.includes('swift') ||
    userAgent.includes('real') ||
    userAgent.includes('delta') ||
    userAgent.includes('arceus') ||
    userAgent.includes('codex') ||
    userAgent.includes('solara') ||
    userAgent.includes('celery') ||
    userAgent.includes('hydrogen') ||
    userAgent.includes('appleware') ||
    userAgent.includes('vega') ||
    userAgent.includes('xeno') ||
    userAgent.includes('wininet');

  const isBrowser = accept.includes('text/html') && (secFetchDest === 'document' || (userAgent.includes('mozilla') && !isRoblox));

  // 3. HARD BLOCK DEPRECATED LOADER:
  // If they hit the old Vercel root URL from Roblox, hard-block execution,
  // notify them, copy the new domain loadstring to clipboard, and cache at CDN edge.
  if (request.nextUrl.pathname === '/' && (isRoblox || !isBrowser)) {
    const blockScript = `
pcall(function()
    game:GetService("StarterGui"):SetCore("SendNotification", {
        Title = "Eternity: Discontinued URL",
        Text = "This loadstring is disabled. Use https://zeternity.online (Copied to clipboard!)",
        Duration = 15
    })
    if setclipboard then
        setclipboard('loadstring(game:HttpGet("https://zeternity.online", true))()')
    end
end)
warn("[Eternity] This loadstring is permanently discontinued. Switched to: https://zeternity.online")
error("[Eternity] Please execute the new loadstring: loadstring(game:HttpGet('https://zeternity.online', true))()")
`;
    return new NextResponse(blockScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  }

  // 4. If it's a normal web browser, proceed to render the React page
  return NextResponse.next();
}

// 5. CPU OPTIMIZATION: Only run proxy on PAGE routes, NOT on /api/* routes.
// API routes don't need Roblox detection — saves ~30-50% of middleware CPU.
// Also skip all static assets.
export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg|lua)$).*)',
  ],
};
