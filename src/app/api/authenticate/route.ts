import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        userAgent.includes('swift');

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
        let isWhitelisted = false;

        // 1. Verify Whitelist sequentially (since it blocks whether they get the script or not)
        if (supabase) {
            const { data, error } = await supabase
                .from('whitelist')
                .select('username')
                .ilike('username', user)
                .single();
            isWhitelisted = !!data && !error;
        } else {
            // Fallback for local testing
            isWhitelisted = user.toLowerCase() === "hor1zxn" || user.toLowerCase() === "testuser";
        }

        if (isWhitelisted) {
            // 2. Fetch the premium script in parallel (cached for 60 seconds)
            const scriptUrl = 'https://raw.githubusercontent.com/hor1zencodes/patanahi/main/heybro.lua';
            const scriptFetchPromise = fetch(scriptUrl, { next: { revalidate: 60 } }).then(res => res.text());

            // 3. Process telemetry in parallel to speed up execution
            if (supabase) {
                // Bugfix applied here: using any[] to prevent strict typescript Promise<any>[] error on deployment
                const promises: any[] = [
                    supabase.from('live_users').upsert({ username: user, last_ping: new Date().toISOString() }),
                    supabase.from('stats').upsert({
                        key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        value: JSON.stringify({ text: `User '${user}' authenticated from script executor`, color: "#27c93f" })
                    }),
                    supabase.from('stats').upsert({
                        key: `eternity:executor:${user}`,
                        value: executor
                    })
                ];

                // Extract GeoIP instantly from Vercel headers instead of using slow ip-api.com
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

                // Handle sequential stats execution inside the parallel worker
                const telemetryPromise = Promise.allSettled(promises).then(async () => {
                    if (!supabase) return;
                    try {
                        const { data: totalData } = await supabase.from('stats').select('value').eq('key', 'eternity:stats:total_executions').single();
                        const currentTotal = totalData?.value ? parseInt(totalData.value.toString(), 10) : 1515;
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
                
                // Await both the script fetching AND telemetry, massively reducing bottleneck
                const [scriptText] = await Promise.all([scriptFetchPromise, telemetryPromise]);
                
                return new NextResponse(scriptText, {
                    headers: { 'Content-Type': 'text/plain' },
                });
            } else {
                const scriptText = await scriptFetchPromise;
                return new NextResponse(scriptText, {
                    headers: { 'Content-Type': 'text/plain' },
                });
            }
        } else {
            if (supabase) {
                await supabase.from('stats').upsert({
                    key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    value: JSON.stringify({ text: `Failed authentication attempt for '${user}' (Verification failed)`, color: "#ff5f56" })
                });
            }
            return new NextResponse("print('Access Denied: Not Whitelisted')", { status: 403 });
        }
    } catch (e) {
        console.error("Auth error:", e);
        return new NextResponse("print('Access Denied: Server Error')", { status: 500 });
    }
}
