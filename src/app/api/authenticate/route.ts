import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { premiumScript } from '@/lib/premiumScript';

export async function GET(request: NextRequest) {
    // SECURITY PATCH: Block random browser/Postman access by checking User-Agent
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
    const isRobloxExecutor = 
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
        userAgent.includes('xeno');

    if (!isRobloxExecutor) {
        return new NextResponse("print('Access Denied: Invalid Client')", { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const executor = searchParams.get('executor') || 'Unknown';

    if (!user) {
        return new NextResponse("print('Access Denied: No User Provided')", { status: 400 });
    }

    try {
        // Fetch the premium script (which contains the built-in Key System & Whitelist verification)
        const scriptText = premiumScript;

        // Process telemetry in parallel to speed up execution
        if (supabase) {
            const promises: any[] = [
                supabase.from('live_users').upsert({ username: user, last_ping: new Date().toISOString() }),
                supabase.from('stats').upsert({
                    key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    value: JSON.stringify({ text: `User '${user}' loaded Eternity from ${executor}`, color: "#27c93f" })
                }),
                supabase.from('stats').upsert({
                    key: `eternity:executor:${user}`,
                    value: executor
                })
            ];

            // Extract GeoIP instantly from Vercel headers
            const country = request.headers.get('x-vercel-ip-country');
            const lat = request.headers.get('x-vercel-ip-latitude');
            const lon = request.headers.get('x-vercel-ip-longitude');
            if (lat && lon) {
                promises.push(
                    supabase.from('stats').upsert({
                        key: `eternity:geo:${user}`,
                        value: JSON.stringify({ lat: parseFloat(lat), lon: parseFloat(lon), country: country || "Unknown" })
                    })
                );
            }

            // Handle sequential stats execution in background
            Promise.allSettled(promises).then(async () => {
                if (!supabase) return;
                try {
                    const { data: totalData } = await supabase.from('stats').select('value').eq('key', 'eternity:stats:total_executions').single();
                    const currentTotal = totalData?.value ? parseInt(totalData.value.toString(), 10) : 6000;
                    await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: currentTotal + 1 });

                    const today = new Date().toISOString().split('T')[0];
                    const dailyKey = `eternity:stats:executions:${today}`;
                    const { data: dailyData } = await supabase.from('stats').select('value').eq('key', dailyKey).single();
                    const currentDaily = dailyData?.value ? parseInt(dailyData.value.toString(), 10) : 0;
                    await supabase.from('stats').upsert({ key: dailyKey, value: currentDaily + 1 });
                } catch(e) {
                    console.error("Stats logging failed", e);
                }
            });
        }

        return new NextResponse(scriptText, {
            headers: {
                'Content-Type': 'text/plain',
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
            },
        });
    } catch (e) {
        console.error("Auth error:", e);
        return new NextResponse("print('Eternity Error: Failed to load script')", { status: 500 });
    }
}
