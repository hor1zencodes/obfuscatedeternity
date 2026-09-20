import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const placeId = searchParams.get('placeId');
    const jobId = searchParams.get('jobId');
    const gameName = searchParams.get('gameName');
    const executor = searchParams.get('executor');

    try {
        if (!supabase) {
            return NextResponse.json({ success: true, users: [] });
        }

        // If user is reporting their activity / presence:
        if (user && placeId) {
            const now = new Date().toISOString();
            
            // 1. Update live_users ping
            await supabase.from('live_users').upsert({
                username: user,
                last_ping: now
            });

            // 2. Update stats key for this user's current game
            const activityPayload = {
                user,
                placeId: Number(placeId) || placeId,
                jobId: jobId || "",
                gameName: gameName || "In Game",
                last_ping: Date.now()
            };

            await supabase.from('stats').upsert({
                key: `eternity:activity:${user.toLowerCase()}`,
                value: JSON.stringify(activityPayload)
            });

            // 3. Update executor if provided
            if (executor) {
                await supabase.from('stats').upsert({
                    key: `eternity:executor:${user}`,
                    value: executor
                });
            }

            return NextResponse.json(
                { success: true, message: "Activity updated" },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                    }
                }
            );
        }

        // Otherwise, fetch all live users' activity within the last 300 seconds (5 minutes)
        const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();

        const { data: liveUsersData, error: liveError } = await supabase
            .from('live_users')
            .select('username, last_ping')
            .gte('last_ping', fiveMinutesAgo);

        if (liveError) {
            console.error("Supabase error fetching live_users:", liveError);
            return NextResponse.json({ success: false, users: [] });
        }

        if (!liveUsersData || liveUsersData.length === 0) {
            return NextResponse.json({ success: true, users: [] });
        }

        // Fetch activity keys from stats
        const { data: activityData } = await supabase
            .from('stats')
            .select('key, value')
            .ilike('key', 'eternity:activity:%');

        const activityMap: Record<string, any> = {};
        if (activityData) {
            activityData.forEach(item => {
                const u = item.key.replace('eternity:activity:', '').toLowerCase();
                try {
                    const parsed = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                    activityMap[u] = parsed;
                } catch {
                    // Ignore parse error
                }
            });
        }

        // Map live users to their game activity
        const users = liveUsersData.map(row => {
            const uLower = row.username.toLowerCase();
            const act = activityMap[uLower];
            return {
                username: row.username,
                lastPing: new Date(row.last_ping).getTime(),
                placeId: act?.placeId || null,
                jobId: act?.jobId || "",
                gameName: act?.gameName || "In Game",
                isPlaying: !!(act?.placeId)
            };
        });

        return NextResponse.json(
            { success: true, users },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40',
                }
            }
        );
    } catch (e) {
        console.error("Users Activity API error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
