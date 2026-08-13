import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        if (!supabase) return NextResponse.json({ error: "No Supabase client available" });

        // Wipe the string concatenations and replace with pure integers native to Postgres.
        await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: 1515 });

        const today = new Date().toISOString().split('T')[0];
        const dailyKey = `eternity:stats:executions:${today}`;
        await supabase.from('stats').upsert({ key: dailyKey, value: 169 });

        return NextResponse.json({ success: true, message: "Production Execution Counters successfully reset to Integers." });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
