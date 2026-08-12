import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis if env vars exist
let redis: Redis | null = null;
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (kvUrl && kvToken) {
    redis = new Redis({ url: kvUrl, token: kvToken });
}

export async function GET(request: NextRequest) {
    try {
        // Authenticate admin session
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        
        if (redis) {
            const sessionValid = await redis.get(`admin_session:${token}`);
            if (!sessionValid) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }
        let totalExecutions = 1337;
        let chartData: { date: string; executions: number }[] = [];

        if (redis) {
            // Get total executions
            const totalStr = await redis.get<string | number>('eternity:stats:total_executions');
            if (!totalStr) {
                // Initialize to 1337 if it doesn't exist
                await redis.set('eternity:stats:total_executions', 1337);
            } else {
                totalExecutions = parseInt(totalStr.toString(), 10);
            }

            // Get last 7 days of executions for the chart
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
                
                const dailyExecs = await redis.get<string | number>(`eternity:stats:executions:${dateStr}`);
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
