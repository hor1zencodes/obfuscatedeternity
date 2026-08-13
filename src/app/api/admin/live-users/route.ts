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

            // Fetch live users active within the last 60 seconds
            const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

            const { data: liveUsersData, error } = await supabase
                .from('live_users')
                .select('username, last_ping')
                .gte('last_ping', oneMinuteAgo);

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
                    if (usr) executorsMap[usr] = typeof e.value === 'string' ? e.value : (e.value?.toString() || 'Unknown');
                });
            }

            const liveUsers = liveUsersData.map(row => ({
                user: row.username,
                timestamp: new Date(row.last_ping).getTime(),
                isActive: true,
                executor: executorsMap[row.username] || "Unknown"
            }));

            return NextResponse.json({ success: true, liveUsers });
        } else {
            // For local development without Supabase
            return NextResponse.json({
                success: true,
                liveUsers: [
                    { user: "DemoUser1", timestamp: Date.now(), isActive: true }
                ]
            });
        }
    } catch (e) {
        console.error("Live users API error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
