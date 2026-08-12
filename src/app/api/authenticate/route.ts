import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

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

                // Increment execution telemetry
                try {
                    // Update total_executions
                    const { data: totalData } = await supabase
                        .from('stats')
                        .select('value')
                        .eq('key', 'eternity:stats:total_executions')
                        .single();
                    
                    const newTotal = (totalData?.value || 1337) + 1;
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
                        
                    const newDaily = (dailyData?.value || 0) + 1;
                    await supabase
                        .from('stats')
                        .upsert({ key: dailyKey, value: newDaily });
                } catch(e) {
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
            return new NextResponse("print('Access Denied: Not Whitelisted')", { status: 403 });
        }
    } catch (e) {
        console.error("Auth error:", e);
        return new NextResponse("print('Access Denied: Server Error')", { status: 500 });
    }
}
