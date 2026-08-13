import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const executor = searchParams.get('executor') || 'Unknown';

    if (!user) {
        return new NextResponse("print('Access Denied: No User Provided')", { status: 400 });
    }

    try {
        let isWhitelisted = false;

        if (supabase) {
            const { data, error } = await supabase
                .from('whitelist')
                .select('username')
                .ilike('username', user)
                .single();
            isWhitelisted = !!data && !error;
        } else {
            // Fallback for local testing without Supabase
            isWhitelisted = user.toLowerCase() === "hor1zxn" || user.toLowerCase() === "testuser";
        }

        if (isWhitelisted) {
            // Update live users in Supabase if available
            if (supabase) {
                await supabase.from('live_users').upsert({ username: user, last_ping: new Date().toISOString() });

                // Log authentication to feed
                await supabase.from('stats').upsert({
                    key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                    value: JSON.stringify({ text: `User '${user}' authenticated from script executor`, color: "#27c93f" })
                });

                // Store executor mapping
                await supabase.from('stats').upsert({
                    key: `eternity:executor:${user}`,
                    value: executor
                });

                // Capture Geo Location of the Roblox Server
                const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
                if (ip) {
                    try {
                        const geoRes = await fetch(`http://ip-api.com/json/${ip.split(',')[0].trim()}`);
                        if (geoRes.ok) {
                            const geoData = await geoRes.json();
                            if (geoData.lat && geoData.lon) {
                                await supabase.from('stats').upsert({
                                    key: `eternity:geo:${user}`,
                                    value: JSON.stringify({ lat: geoData.lat, lon: geoData.lon, country: geoData.country })
                                });
                            }
                        }
                    } catch (e) {
                        console.error("GeoIP Fetch Error:", e);
                    }
                }

                // Increment execution telemetry
                try {
                    // Update total_executions
                    const { data: totalData } = await supabase
                        .from('stats')
                        .select('value')
                        .eq('key', 'eternity:stats:total_executions')
                        .single();

                    const currentTotal = totalData?.value ? parseInt(totalData.value.toString(), 10) : 1337;
                    const newTotal = currentTotal + 1;
                    await supabase
                        .from('stats')
                        .upsert({ key: 'eternity:stats:total_executions', value: newTotal });

                    // Update daily executions
                    const today = new Date().toISOString().split('T')[0];
                    const dailyKey = `eternity:stats:executions:${today}`;
                    const { data: dailyData } = await supabase
                        .from('stats')
                        .select('value')
                        .eq('key', dailyKey)
                        .single();

                    const currentDaily = dailyData?.value ? parseInt(dailyData.value.toString(), 10) : 0;
                    const newDaily = currentDaily + 1;
                    await supabase
                        .from('stats')
                        .upsert({ key: dailyKey, value: newDaily });
                } catch (e) {
                    console.error("Stats logging failed", e);
                }
            }

            // Fetch the premium script
            const scriptUrl = 'https://raw.githubusercontent.com/hor1zencodes/patanahi/main/heybro.lua';
            const scriptRes = await fetch(scriptUrl);
            const scriptText = await scriptRes.text();

            return new NextResponse(scriptText, {
                headers: { 'Content-Type': 'text/plain' },
            });
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
