import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

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
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        
        if (redis) {
            const sessionValid = await redis.get(`admin_session:${token}`);
            if (!sessionValid) {
                return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
            }
            
            // Fetch live users
            const allUsers = await redis.hgetall("live_users") as Record<string, number> | null;
            
            if (!allUsers) {
                return NextResponse.json({ success: true, liveUsers: [] });
            }
            
            const now = Date.now();
            const liveUsers = Object.entries(allUsers)
                .map(([user, timestamp]) => ({
                    user,
                    timestamp,
                    isActive: now - timestamp < 60000 // 60 seconds threshold
                }))
                .filter(u => u.isActive);
                
            return NextResponse.json({ success: true, liveUsers });
        } else {
            // For local development without Redis
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
