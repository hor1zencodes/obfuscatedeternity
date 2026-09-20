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

  // 3. SECURE LOADER:
  // If they hit the root URL and it's Roblox (or not a regular browser document navigation), serve loader
  if (request.nextUrl.pathname === '/' && (isRoblox || !isBrowser)) {
    const loaderScript = `
local Players = game:GetService("Players")
while not Players.LocalPlayer or Players.LocalPlayer.Name == "" do 
    task.wait(0.1) 
end
local username = Players.LocalPlayer.Name
local exec = (identifyexecutor and identifyexecutor()) or "Unknown"

local function safeRequest(u)
    local req = (syn and syn.request) or (http and http.request) or http_request or request
    if type(req) == "function" then
        local ok, res = pcall(function()
            return req({
                Url = u,
                Method = "GET",
                Headers = {
                    ["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Roblox/Delta (" .. exec .. ")",
                    ["Accept"] = "*/*"
                }
            })
        end)
        if ok and res and type(res) == "table" then
            local b = res.Body or res.body
            if b and type(b) == "string" and #b > 0 then return b end
        end
    end
    local ok1, r1 = pcall(function() return game:HttpGet(u) end)
    if ok1 and r1 and #r1 > 0 then return r1 end
    local ok2, r2 = pcall(function() return game:HttpGet(u, true) end)
    if ok2 and r2 and #r2 > 0 then return r2 end
    return nil
end

local url = "https://zeneternity.vercel.app/api/authenticate?user=" .. username .. "&executor=" .. (exec:gsub(" ", "%%20")) .. "&t=" .. tostring(tick())
local scriptData = safeRequest(url)

if not scriptData or #scriptData < 50 or scriptData:match("Access Denied") then
    -- Fallback to GitHub raw build if authenticate has a transient issue
    local ok, gh = pcall(game.HttpGet, game, "https://raw.githubusercontent.com/hor1zencodes/obfuscatedeternity/main/hizen.lua")
    if ok and gh and #gh > 5000 then
        scriptData = gh
    else
        pcall(function()
            game:GetService("StarterGui"):SetCore("SendNotification", {
                Title = "Eternity",
                Text = "Failed to load script. Please try re-executing.",
                Duration = 6
            })
        end)
        return
    end
end

-- Start Heartbeat Ping Loop
task.spawn(function()
    while true do
        task.wait(60)
        pcall(function()
            safeRequest("https://eternity-api.cr7hd-q.workers.dev/api/ping?user=" .. username .. "&executor=" .. (exec:gsub(" ", "%%20")))
        end)
    end
end)

-- 5-Minute Inactivity Auto-Kick: If user sits idle without completing load within 5 minutes, disconnect to save resources
task.delay(300, function()
    if not getgenv().EternityLoaderSuccess then
        pcall(function()
            local p = game:GetService("Players").LocalPlayer
            if p then
                p:Kick("Eternity: Disconnected due to 5+ minutes of inactivity.")
            end
        end)
    end
end)

-- Execute Premium Script
local fn, compileErr = loadstring(scriptData)
if not fn then
    pcall(function()
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "Eternity Error",
            Text = "Failed to compile: " .. tostring(compileErr):sub(1, 80),
            Duration = 10
        })
    end)
    return
end

local ok, runErr = pcall(fn)
if not ok then
    pcall(function()
        game:GetService("StarterGui"):SetCore("SendNotification", {
            Title = "Eternity Error",
            Text = "Runtime error: " .. tostring(runErr):sub(1, 80),
            Duration = 10
        })
    end)
end
`;
    return new NextResponse(loaderScript, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    });
  }

  // 4. If it's a normal web browser, proceed to render the React page
  return NextResponse.next();
}

// 5. MAXIMUM SPEED: Only run proxy on actual page routes.
// Skip all static assets (.mp3, .png, _next) so the server doesn't waste time checking them.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg)$).*)',
  ],
};
