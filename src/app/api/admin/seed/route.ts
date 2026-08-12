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
        if (!redis) {
            return NextResponse.json({ success: false, error: "Redis is not configured. Cannot seed." }, { status: 400 });
        }
        
        // Fetch the old whitelist from GitHub
        const githubUrl = "https://raw.githubusercontent.com/hor1zencodes/patanahi/main/whitelist.json";
        const res = await fetch(githubUrl);
        
        if (!res.ok) {
            return NextResponse.json({ success: false, error: "Failed to fetch from GitHub" }, { status: 500 });
        }
        
        let rawText = await res.text();
        
        // Fix trailing comma or broken JSON if any (as seen in the current file ending with "sad\n\n)
        if (!rawText.trim().endsWith("]")) {
            // Very naive cleanup: just regex extract all quotes words
            const matches = rawText.match(/"([^"]+)"/g);
            if (matches) {
                const names = matches.map(m => m.replace(/"/g, ''));
                
                // Add all to Redis
                for (const name of names) {
                    await redis.sadd("whitelist", name.toLowerCase());
                }
                return NextResponse.json({ 
                    success: true, 
                    message: `Successfully seeded ${names.length} users into the Redis database!`,
                    users: names
                });
            }
        }
        
        // If it's valid JSON
        const whitelist: string[] = JSON.parse(rawText);
        let count = 0;
        
        for (const user of whitelist) {
            if (user && user.trim()) {
                await redis.sadd("whitelist", user.trim().toLowerCase());
                count++;
            }
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${count} users into the Redis database!` 
        });
        
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || "Server Error" }, { status: 500 });
    }
}
