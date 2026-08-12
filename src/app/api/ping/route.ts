import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis if env vars exist
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
        return new NextResponse("Missing user", { status: 400 });
    }

    try {
        if (redis) {
            await redis.hset("live_users", { [user]: Date.now() });
        }
        return new NextResponse("OK");
    } catch (e) {
        console.error("Ping error:", e);
        return new NextResponse("Error", { status: 500 });
    }
}
