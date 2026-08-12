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
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
        return new NextResponse("print('Access Denied: No User Provided')", { status: 400 });
    }

    try {
        let isWhitelisted = false;
        
        if (redis) {
            // Check Redis database for the username (case-insensitive by storing all names in lowercase)
            const result = await redis.sismember("whitelist", user.toLowerCase());
            isWhitelisted = result === 1;
        } else {
            // Fallback for local testing without Redis
            isWhitelisted = user.toLowerCase() === "hor1zxn" || user.toLowerCase() === "testuser";
        }

        if (isWhitelisted) {
            // Update live users in Redis if available
            if (redis) {
                await redis.hset("live_users", { [user]: Date.now() });
            }

            // Fetch the premium script
            const scriptUrl = 'https://raw.githubusercontent.com/hor1zencodes/patanahi/main/heybro.lua';
            const scriptRes = await fetch(scriptUrl);
            const scriptText = await scriptRes.text();

            return new NextResponse(scriptText, {
                headers: { 'Content-Type': 'text/plain' },
            });
        } else {
            return new NextResponse("print('Access Denied: Not Whitelisted')", { status: 403 });
        }
    } catch (e) {
        console.error("Auth error:", e);
        return new NextResponse("print('Access Denied: Server Error')", { status: 500 });
    }
}
