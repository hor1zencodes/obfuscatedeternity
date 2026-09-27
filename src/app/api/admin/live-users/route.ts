import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const WORKER_URL = "https://zeternity.online";

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

        // --- Fetch live users from Cloudflare Worker (KV-backed, not Supabase) ---
        // This fixes the 0-users bug after KV migration
        let kvUsers: any[] = [];
        try {
            const res = await fetch(`${WORKER_URL}/api/users-activity`, {
                headers: { "Accept": "application/json" },
                next: { revalidate: 0 }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.users)) {
                    kvUsers = data.users;
                }
            }
        } catch (e) {
            console.error("KV worker fetch failed:", e);
        }

        // --- Also fetch executor info from Supabase (rare, not per-ping) ---
        const executorsMap: Record<string, string> = {};
        if (supabase) {
            try {
                const { data: executorData } = await supabase
                    .from('stats')
                    .select('key, value')
                    .ilike('key', 'eternity:executor:%');

                if (executorData) {
                    executorData.forEach(e => {
                        const usr = e.key.split(':')[2];
                        if (usr) executorsMap[usr.toLowerCase()] = typeof e.value === 'string' ? e.value : (e.value?.toString() || 'Unknown');
                    });
                }
            } catch {}
        }

        // If Worker KV returned users, map and return them
        if (kvUsers.length > 0) {
            const liveUsers = kvUsers.map((u: any) => ({
                user: u.username,
                timestamp: u.lastPing || Date.now(),
                isActive: true,
                executor: u.executor || executorsMap[u.username?.toLowerCase()] || "Unknown",
                gameName: u.gameName || null,
                placeId: u.placeId || null,
                jobId: u.jobId || "",
                isPlaying: !!(u.placeId)
            }));
            return NextResponse.json({ success: true, liveUsers });
        }

        // --- Fallback: If KV returned 0 users or KV quota reached, fetch directly from Supabase ---
        if (supabase) {
            try {
                const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
                const { data: liveUsersData } = await supabase
                    .from('live_users')
                    .select('username, last_ping')
                    .gte('last_ping', twoMinutesAgo);

                if (liveUsersData && liveUsersData.length > 0) {
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
                            } catch {}
                        });
                    }

                    const sbLiveUsers = liveUsersData.map(row => {
                        const uLower = row.username.toLowerCase();
                        const act = activityMap[uLower];
                        return {
                            user: row.username,
                            timestamp: new Date(row.last_ping).getTime(),
                            isActive: true,
                            executor: act?.executor || executorsMap[uLower] || executorsMap[row.username] || "Unknown",
                            gameName: act?.gameName || null,
                            placeId: act?.placeId || null,
                            jobId: act?.jobId || "",
                            isPlaying: !!(act?.placeId)
                        };
                    });

                    return NextResponse.json({ success: true, liveUsers: sbLiveUsers });
                }
            } catch (sbErr) {
                console.error("Supabase fallback fetch failed:", sbErr);
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
