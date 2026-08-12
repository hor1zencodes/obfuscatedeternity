import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
        return new NextResponse("Missing user", { status: 400 });
    }

    try {
        if (supabase) {
            await supabase.from('live_users').upsert({ username: user, last_ping: new Date().toISOString() });
        }
        return new NextResponse("OK");
    } catch (e) {
        console.error("Ping error:", e);
        return new NextResponse("Error", { status: 500 });
    }
}
