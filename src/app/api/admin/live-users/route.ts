import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Authenticate admin session
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (supabase) {
            const { data: sessionValid } = await supabase
                .from('admin_sessions')
                .select('token')
                .eq('token', token)
                .gte('expires_at', new Date().toISOString())
                .single();

            if (!sessionValid) {
                return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
            }

            // Fetch live users active within the last 120 seconds
            const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();

            const { data: liveUsersData, error } = await supabase
                .from('live_users')
                .select('username, last_ping')
                .gte('last_ping', twoMinutesAgo);

            if (error) {
                console.error(error);
                return NextResponse.json({ success: true, liveUsers: [] });
            }

            // Also fetch executors mapped in stats
            const { data: executorData } = await supabase
                .from('stats')
                .select('key, value')
                .ilike('key', 'eternity:executor:%');

            const executorsMap: Record<string, string> = {};
            if (executorData) {
                executorData.forEach(e => {
                    const usr = e.key.split(':')[2];
                    if (usr) executorsMap[usr.toLowerCase()] = typeof e.value === 'string' ? e.value : (e.value?.toString() || 'Unknown');
                });
            }

            // Also fetch game activities mapped in stats
            const { data: activityData } = await supabase
                .from('stats')
                .select('key, value')
                .ilike('key', 'eternity:activity:%');

            const activityMap: Record<string, any> = {};
            if (activityData) {
                activityData.forEach(item => {
                    const usr = item.key.replace('eternity:activity:', '').toLowerCase();
                    try {
                        activityMap[usr] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                    } catch {
                        // ignore parse error
                    }
                });
            }

            const liveUsers = liveUsersData.map(row => {
                const uLower = row.username.toLowerCase();
                const act = activityMap[uLower];
                return {
                    user: row.username,
                    timestamp: new Date(row.last_ping).getTime(),
                    isActive: true,
                    executor: executorsMap[uLower] || executorsMap[row.username] || "Unknown",
                    gameName: act?.gameName || null,
                    placeId: act?.placeId || null,
                    jobId: act?.jobId || "",
                    isPlaying: !!(act?.placeId)
                };
            });

            return NextResponse.json({ success: true, liveUsers });
        } else {
            // For local development without Supabase
            return NextResponse.json({
                success: true,
                liveUsers: [
                    { 
                        user: "DemoUser1", 
                        timestamp: Date.now(), 
                        isActive: true, 
                        executor: "Wave",
                        gameName: "Blox Fruits",
                        placeId: 2753915549,
                        jobId: "demo-job-123",
                        isPlaying: true
                    }
                ]
            });
        }
    } catch (e) {
        console.error("Live users API error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
