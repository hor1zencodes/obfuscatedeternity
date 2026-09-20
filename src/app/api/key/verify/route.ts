import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');
    const key = searchParams.get('key');

    if (!user || !key) {
        return new NextResponse('false', { status: 400, headers: corsHeaders });
    }

    try {
        if (!supabase) {
            // Local fallback: accept any key for testing
            return new NextResponse('true', { headers: corsHeaders });
        }

        const now = new Date().toISOString();

        // Occasional background purge: eliminate expired keys without blocking every single request
        if (Math.random() < 0.05) {
            supabase.from('keys').delete().lt('expires_at', now).then(() => {});
        }

        // First check: does this user already have a valid (non-expired) key session?
        const { data: existingSession } = await supabase
            .from('keys')
            .select('*')
            .eq('used_by', user.toLowerCase())
            .gte('expires_at', now)
            .limit(1)
            .maybeSingle();

        if (existingSession) {
            // User already has a valid key session, allow through
            return new NextResponse('true', { headers: corsHeaders });
        }

        // Second check: validate the key itself
        const { data: keyData, error } = await supabase
            .from('keys')
            .select('*')
            .eq('key', key.trim())
            .maybeSingle();

        if (!keyData || error) {
            return new NextResponse('false|invalid_key', { headers: corsHeaders });
        }

        // Check expiry — delete immediately from database if expired
        if (new Date(keyData.expires_at) < new Date()) {
            await supabase.from('keys').delete().eq('id', keyData.id);
            return new NextResponse('false|expired', { headers: corsHeaders });
        }

        // Check if already used by a different user
        if (keyData.used_by && keyData.used_by.toLowerCase() !== user.toLowerCase()) {
            return new NextResponse('false|already_used', { headers: corsHeaders });
        }

        // Key is valid — lock it to this user and activate 24-hour session from redemption
        const redemptionTime = new Date();
        const accessExpiresAt = new Date(redemptionTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours of whitelist access

        await supabase
            .from('keys')
            .update({
                used_by: user.toLowerCase(),
                used_at: redemptionTime.toISOString(),
                expires_at: accessExpiresAt.toISOString(),
            })
            .eq('id', keyData.id);

        // Log key usage
        await supabase.from('stats').upsert({
            key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            value: JSON.stringify({
                text: `Key redeemed by '${user}': ${key.substring(0, 8)}...`,
                color: '#34d399'
            })
        });

        return new NextResponse('true', { headers: corsHeaders });
    } catch (e) {
        console.error('Key verify error:', e);
        return new NextResponse('false', { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
