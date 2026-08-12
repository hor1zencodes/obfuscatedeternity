import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
        
        // Store in Supabase with 24 hour expiration
        if (supabase) {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            await supabase.from('admin_sessions').insert([{ token, expires_at: expiresAt }]);
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
