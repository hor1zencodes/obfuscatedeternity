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

            // Fetch live users active within the last 120 seconds (2 minutes)
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

            // Auto-clean: Purge any user who has had no game data for more than 2 minutes
            const activeUsers = liveUsers.filter(u => {
                if (!u.placeId) {
                    const isIdleTooLong = (Date.now() - u.timestamp) > 120000;
                    if (isIdleTooLong && supabase) {
                        supabase.from('live_users').delete().eq('username', u.user).then(() => {});
                        return false;
                    }
                }
                return true;
            });

            return NextResponse.json({ success: true, liveUsers: activeUsers });
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

// DELETE: Purge idle users immediately
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        if (!supabase) {
            return NextResponse.json({ success: true, purged: 0 });
        }

        const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
        
        // Delete users whose last ping is older than 2 minutes
        const { error } = await supabase
            .from('live_users')
            .delete()
            .lt('last_ping', twoMinutesAgo);

        if (error) {
            console.error("Error purging idle users:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Idle users purged successfully" });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
