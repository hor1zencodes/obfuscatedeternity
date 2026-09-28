import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function cleanGameName(name: string | null | undefined): string | null {
    if (!name || typeof name !== 'string') return null;
    let s = name;

    // 1. Emoji replacements for common UTF-8 byte sequences
    s = s.replace(/F0\s+9F\s+94\s+8A/gi, '🔊');
    s = s.replace(/F0\s+9F\s+9B\s+B9/gi, '🛹');
    s = s.replace(/F0\s+9F\s+87\s+AB\s+F0\s+9F\s+87\s+B7/gi, '🇫🇷');
    s = s.replace(/F0\s+9F\s+8E\s+AF/gi, '🎯');
    s = s.replace(/F0\s+9F\s+92\s+A5/gi, '💥');
    s = s.replace(/F0\s+9F\s+94\s+A5/gi, '🔥');
    s = s.replace(/E2\s+9C\s+A8/gi, '✨');
    s = s.replace(/E2\s+AD\s+90/gi, '⭐');

    // Generic 4-byte UTF-8 emoji matcher (F0 xx xx xx)
    s = s.replace(/\bF0\s+([89A-F][0-9A-F])\s+([89A-F][0-9A-F])\s+([89A-F][0-9A-F])\b/gi, (_, b1, b2, b3) => {
        try {
            const bytes = [0xF0, parseInt(b1, 16), parseInt(b2, 16), parseInt(b3, 16)];
            return Buffer.from(bytes).toString('utf8');
        } catch {
            return _;
        }
    });

    // 2. Bracket and plus replacements
    // 5B18 2B 5D -> [18+]
    s = s.replace(/5B(\d+)\s*2B\s*5D/gi, '[$1+]');
    s = s.replace(/5B([A-Za-z0-9]+)\s*5D/gi, '[$1]');
    s = s.replace(/\b5B\b/gi, '[');
    s = s.replace(/\b5D\b/gi, ']');
    s = s.replace(/(?:^|\s)B(?=\s+[🎯🔊🛹🔥✨⭐\[])/gi, ' [');
    s = s.replace(/\b2B\b/gi, '+');

    // 3. Usernames or IDs
    s = s.replace(/%5F/gi, '_').replace(/(?:^|\s)5F/gi, '_');

    // Clean remaining isolated bracket codes
    s = s.replace(/\b5B/gi, '[').replace(/5D\b/gi, ']');

    return s.replace(/\s{2,}/g, ' ').trim();
}

function cleanUsername(username: string | null | undefined): string {
    if (!username || typeof username !== 'string') return '';
    return username.replace(/(?:\s|^)5F/gi, '_').replace(/%5F/gi, '_').trim();
}

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
                    const activityKeys: string[] = [];
                    const executorKeys: string[] = [];
                    liveUsersData.forEach(r => {
                        const rawLower = r.username.toLowerCase();
                        const cleanLower = cleanUsername(r.username).toLowerCase();
                        activityKeys.push(`eternity:activity:${rawLower}`);
                        if (cleanLower !== rawLower) {
                            activityKeys.push(`eternity:activity:${cleanLower}`);
                        }
                        executorKeys.push(`eternity:executor:${r.username}`);
                        if (cleanLower !== rawLower) {
                            executorKeys.push(`eternity:executor:${cleanUsername(r.username)}`);
                        }
                    });

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
                        const cleanUser = cleanUsername(row.username);
                        const rawLower = row.username.toLowerCase();
                        const cleanLower = cleanUser.toLowerCase();
                        const act = activityMap[cleanLower] || activityMap[rawLower];
                        return {
                            user: cleanUser,
                            timestamp: new Date(row.last_ping).getTime(),
                            isActive: true,
                            executor: act?.executor || executorsMap[cleanLower] || executorsMap[rawLower] || "Unknown",
                            gameName: cleanGameName(act?.gameName) || null,
                            placeId: act?.placeId || null,
                            jobId: (act?.jobId ? String(act.jobId).replace(/(?:\s|^)2D/gi, "-") : ""),
                            isPlaying: !!(act?.placeId)
                        };
                    });

                    // Deduplicate in case a user exists as both raw and clean
                    const dedupedMap = new Map<string, typeof liveUsers[0]>();
                    liveUsers.forEach(u => {
                        const key = u.user.toLowerCase();
                        const existing = dedupedMap.get(key);
                        if (!existing || u.timestamp > existing.timestamp) {
                            dedupedMap.set(key, u);
                        }
                    });
                    const finalUsers = Array.from(dedupedMap.values());

                    return NextResponse.json({ success: true, liveUsers: finalUsers });
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
