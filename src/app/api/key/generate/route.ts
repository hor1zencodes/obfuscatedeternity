import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { verifyCheckpointSession } from '@/lib/checkpointToken';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ETN-';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const source = body.source || 'linkvertise';

        // Anti-bypass verification: verify that both checkpoints were completed
        let token = request.cookies.get('etn_checkpoint_token')?.value || null;
        if (!token) {
            const authHeader = request.headers.get('authorization');
            if (authHeader?.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token && body.token) {
            token = body.token;
        }

        const session = token ? verifyCheckpointSession(token) : null;
        const isEligible = session?.eligible || (session?.cp1Completed && session?.cp2Completed);

        // Reject if checkpoints were skipped or forged
        if (!isEligible) {
            return NextResponse.json(
                { success: false, error: 'Checkpoint verification required. Please complete Checkpoint 1 and Checkpoint 2 in order.' },
                { status: 403, headers: corsHeaders }
            );
        }

        const key = generateKey();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes to claim/redeem in Roblox

        if (supabase) {
            const { error } = await supabase.from('keys').insert([{
                key,
                created_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                source,
            }]);

            if (error) {
                console.error('Key generation error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to generate key' },
                    { status: 500, headers: corsHeaders }
                );
            }

            // Log key generation
            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({
                    text: `Key generated via ${source}: ${key.substring(0, 8)}...`,
                    color: '#a78bfa'
                })
            });
        }

        const response = NextResponse.json(
            { success: true, key, expiresAt: expiresAt.toISOString() },
            { headers: corsHeaders }
        );
        response.cookies.delete('etn_checkpoint_token');
        return response;
    } catch (e) {
        console.error('Key generation error:', e);
        return NextResponse.json(
            { success: false, error: 'Server error' },
            { status: 500, headers: corsHeaders }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
