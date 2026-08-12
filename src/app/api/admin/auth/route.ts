import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis if env vars exist
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;
        
        const expectedPassword = process.env.ADMIN_SECRET || "eternity2026";
        
        if (password !== expectedPassword) {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
        }
        
        // Generate a simple token
        const token = crypto.randomUUID();
        
        // Store in Redis with 24 hour expiration
        if (redis) {
            await redis.setex(`admin_session:${token}`, 24 * 60 * 60, "valid");
        }
        
        // Set cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60,
            path: '/',
        });
        
        return response;
    } catch (e) {
        console.error("Admin Auth Error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
