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
        }

        // --- Fetch live users directly from Supabase (no worker/KV dependency) ---
        if (supabase) {
            try {
                const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
                const { data: liveUsersData } = await supabase
                    .from('live_users')
                    .select('username, last_ping')
                    .gte('last_ping', twoMinutesAgo);

                if (liveUsersData && liveUsersData.length > 0) {
                    // Build targeted key lists for only the live users (avoids Supabase 1000-row default limit)
                    const activityKeys = liveUsersData.map(r => `eternity:activity:${r.username.toLowerCase()}`);
                    const executorKeys = liveUsersData.map(r => `eternity:executor:${r.username}`);

                    // Fetch activity data only for live users
                    const { data: activityData } = await supabase
                        .from('stats')
                        .select('key, value')
                        .in('key', activityKeys);

                    const activityMap: Record<string, any> = {};
                    if (activityData) {
                        activityData.forEach(item => {
                            const usr = item.key.replace('eternity:activity:', '').toLowerCase();
                            try {
                                activityMap[usr] = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                            } catch {}
                        });
                    }

                    // Fetch executor data only for live users
                    const { data: executorData } = await supabase
                        .from('stats')
                        .select('key, value')
                        .in('key', executorKeys);

                    const executorsMap: Record<string, string> = {};
                    if (executorData) {
                        executorData.forEach(e => {
                            const usr = e.key.split(':')[2];
                            if (usr) executorsMap[usr.toLowerCase()] = typeof e.value === 'string' ? e.value : (e.value?.toString() || 'Unknown');
                        });
                    }

                    const liveUsers = liveUsersData.map(row => {
                        const uLower = row.username.toLowerCase();
                        const act = activityMap[uLower];
                        return {
                            user: row.username,
                            timestamp: new Date(row.last_ping).getTime(),
                            isActive: true,
                            executor: act?.executor || executorsMap[uLower] || "Unknown",
                            gameName: act?.gameName || null,
                            placeId: act?.placeId || null,
                            jobId: act?.jobId || "",
                            isPlaying: !!(act?.placeId)
                        };
                    });

                    return NextResponse.json({ success: true, liveUsers });
                }
            } catch (sbErr) {
                console.error("Supabase fetch failed:", sbErr);
            }
        }

        return NextResponse.json({ success: true, liveUsers: [] });

    } catch (e) {
        console.error("Live users API error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

// DELETE: Purge idle users (clears Supabase legacy table)
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
