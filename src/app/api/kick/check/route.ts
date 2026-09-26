import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/kick/check?user=Username
// Ultra-lightweight endpoint for Lua script heartbeats to check if admin kicked the current player
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user || typeof user !== 'string' || !user.trim()) {
        return NextResponse.json(
            { kicked: false },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                }
            }
        );
    }

    try {
        if (!supabase) {
            return NextResponse.json(
                { kicked: false },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                    }
                }
            );
        }

        const lowerUser = user.trim().toLowerCase();

        // Check stats for eternity:kick:<username>
        const { data, error } = await supabase
            .from('stats')
            .select('value')
            .eq('key', `eternity:kick:${lowerUser}`)
            .maybeSingle();

        if (error || !data || !data.value) {
            return NextResponse.json(
                { kicked: false },
                {
                    headers: {
                        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                        'Pragma': 'no-cache',
                    }
                }
            );
        }

        let parsed: any = null;
        try {
            parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        } catch {
            parsed = { reason: "Kicked by an Eternity Admin." };
        }

        return NextResponse.json(
            {
                kicked: true,
                reason: parsed?.reason || "Kicked by an Eternity Admin.",
                kickedAt: parsed?.kickedAt || Date.now(),
                kickedBy: parsed?.kickedBy || "Admin"
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                }
            }
        );
    } catch (e) {
        console.error("Kick check error:", e);
        return NextResponse.json(
            { kicked: false },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                }
            }
        );
    }
}
