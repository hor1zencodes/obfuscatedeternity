import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const placeId = searchParams.get('placeId');
    const jobId = searchParams.get('jobId');
    const gameName = searchParams.get('gameName');

    if (!user) {
        return new NextResponse("Missing user", { status: 400 });
    }

    try {
        if (supabase) {
            await supabase.from('live_users').upsert({ username: user, last_ping: new Date().toISOString() });

            if (placeId) {
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
            }
        }
        return new NextResponse("OK");
    } catch (e) {
        console.error("Ping error:", e);
        return new NextResponse("Error", { status: 500 });
    }
}
