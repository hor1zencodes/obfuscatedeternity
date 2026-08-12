import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Authenticate admin session
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        
        if (supabase) {
            const { data: sessionValid } = await supabase
                .from('admin_sessions')
                .select('token')
                .eq('token', token)
                .gte('expires_at', new Date().toISOString())
                .single();
            if (!sessionValid) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }
        
        let totalExecutions = 1337;
        let chartData: { date: string; executions: number }[] = [];

        if (supabase) {
            // Get total executions
            const { data: totalData } = await supabase
                .from('stats')
                .select('value')
                .eq('key', 'eternity:stats:total_executions')
                .single();
                
            if (!totalData) {
                // Initialize to 1337 if it doesn't exist
                await supabase.from('stats').insert({ key: 'eternity:stats:total_executions', value: 1337 });
                totalExecutions = 1337;
            } else {
                totalExecutions = parseInt(totalData.value.toString(), 10);
                
                // Self-healing: if the tracker started from 0 instead of 1337
                if (totalExecutions < 1337) {
                    totalExecutions += 1337;
                    await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: totalExecutions });
                }
            }

            // Get all needed keys for the last 7 days
            const keysToFetch = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                keysToFetch.push(`eternity:stats:executions:${dateStr}`);
            }
            
            // Fetch all at once for efficiency
            const { data: dailyStats } = await supabase
                .from('stats')
                .select('key, value')
                .in('key', keysToFetch);
                
            const statsMap: Record<string, number> = {};
            dailyStats?.forEach(stat => {
                statsMap[stat.key] = stat.value;
            });

            // Get last 7 days of executions for the chart
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                
                const dailyExecs = statsMap[`eternity:stats:executions:${dateStr}`];
                chartData.push({
                    date: dayName,
                    executions: dailyExecs ? parseInt(dailyExecs.toString(), 10) : 0
                });
            }
        }

        return NextResponse.json({
            success: true,
            totalExecutions,
            chartData
        });
    } catch (e) {
        console.error("Stats fetch error:", e);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
