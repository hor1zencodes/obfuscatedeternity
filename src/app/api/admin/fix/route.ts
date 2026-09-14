import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        if (!supabase) return NextResponse.json({ error: "No Supabase client available" });

        const { data: sessionValid } = await supabase
            .from('admin_sessions')
            .select('token')
            .eq('token', token)
            .gte('expires_at', new Date().toISOString())
            .single();
        if (!sessionValid) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Dynamically compute cumulative total from recorded daily executions + baseline
        const { data: dailyStats } = await supabase
            .from('stats')
            .select('value')
            .like('key', 'eternity:stats:executions:%');

        let sum = 1515;
        if (dailyStats) {
            for (const item of dailyStats) {
                const val = parseInt(item.value?.toString() || '0', 10);
                if (!isNaN(val)) sum += val;
            }
        }

        await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: sum });

        return NextResponse.json({ success: true, message: `Execution counter synchronized to ${sum}.` });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
