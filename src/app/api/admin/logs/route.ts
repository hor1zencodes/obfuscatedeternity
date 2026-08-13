import { NextResponse, NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
    try {
        if (!supabase) return NextResponse.json({ error: "No Supabase client available" });

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // We wipe ALL keys that start with eternity:log:
        const { error } = await supabase
            .from('stats')
            .delete()
            .ilike('key', 'eternity:log:%');

        if (error) throw error;

        return NextResponse.json({ success: true, message: "Activity logs flushed successfully." });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
