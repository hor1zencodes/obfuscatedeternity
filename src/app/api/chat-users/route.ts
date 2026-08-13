import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        if (supabase) {
            // Fetch live users active within the last 60 seconds
            const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

            const { data: liveUsersData, error } = await supabase
                .from('live_users')
                .select('username')
                .gte('last_ping', oneMinuteAgo);

            if (error) {
                console.error("Supabase error in chat-users:", error);
                return NextResponse.json({ success: false, liveUsers: [] });
            }

            // Map the rows to just an array of usernames
            const liveUsers = liveUsersData.map(row => row.username);

            return NextResponse.json({ success: true, liveUsers });
        } else {
            // For local development without Supabase
            return NextResponse.json({
                success: true,
                liveUsers: []
            });
        }
    } catch (e) {
        console.error("Chat users API error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
