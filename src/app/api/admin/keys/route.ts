import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Helper to authenticate admin
async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return false;

    if (supabase) {
        const { data, error } = await supabase
            .from('admin_sessions')
            .select('token')
            .eq('token', token)
            .gte('expires_at', new Date().toISOString())
            .single();

        return !!data && !error;
    }
    return true; // Local fallback
}

function generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ETN-';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        result += chars[bytes[i] % chars.length];
    }
    return result;
}

// GET: List all keys for admin
export async function GET(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (!supabase) {
            return NextResponse.json({ success: true, keys: [] });
        }

        const { data, error } = await supabase
            .from('keys')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (error) throw error;

        const now = new Date();
        const keys = (data || []).map((k: { id: string; key: string; created_at: string; expires_at: string; used_by: string | null; used_at: string | null; source: string }) => ({
            id: k.id,
            key: k.key,
            createdAt: k.created_at,
            expiresAt: k.expires_at,
            usedBy: k.used_by,
            usedAt: k.used_at,
            source: k.source,
            status: new Date(k.expires_at) < now ? 'expired' : (k.used_by ? 'used' : 'active'),
        }));

        // Stats
        const totalKeys = keys.length;
        const activeKeys = keys.filter((k: { status: string }) => k.status === 'active').length;
        const usedKeys = keys.filter((k: { status: string }) => k.status === 'used').length;
        const expiredKeys = keys.filter((k: { status: string }) => k.status === 'expired').length;

        return NextResponse.json({
            success: true,
            keys,
            stats: { totalKeys, activeKeys, usedKeys, expiredKeys },
        });
    } catch (e) {
        console.error('Admin keys GET error:', e);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

// POST: Generate a key manually from admin
export async function POST(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const durationHours = body.durationHours || 24;

        const key = generateKey();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

        if (supabase) {
            const { error } = await supabase.from('keys').insert([{
                key,
                created_at: now.toISOString(),
                expires_at: expiresAt.toISOString(),
                source: 'admin',
            }]);

            if (error) {
                console.error('Admin key generation error:', error);
                return NextResponse.json(
                    { success: false, error: 'Failed to generate key' },
                    { status: 500 }
                );
            }

            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({
                    text: `Admin generated key: ${key} (${durationHours}h)`,
                    color: '#a78bfa'
                })
            });
        }

        return NextResponse.json({
            success: true,
            key,
            expiresAt: expiresAt.toISOString(),
            message: `Key generated: ${key}`,
        });
    } catch (e) {
        console.error('Admin key POST error:', e);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}

// DELETE: Revoke/delete a key
export async function DELETE(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { keyId } = await request.json();
        if (!keyId) {
            return NextResponse.json({ success: false, error: 'Key ID required' }, { status: 400 });
        }

        if (supabase) {
            // Get key info before deleting for logging
            const { data: keyData } = await supabase
                .from('keys')
                .select('key')
                .eq('id', keyId)
                .single();

            await supabase.from('keys').delete().eq('id', keyId);

            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({
                    text: `Admin revoked key: ${keyData?.key || keyId}`,
                    color: '#ffbd2e'
                })
            });
        }

        return NextResponse.json({ success: true, message: 'Key revoked' });
    } catch (e) {
        console.error('Admin key DELETE error:', e);
        return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
    }
}
