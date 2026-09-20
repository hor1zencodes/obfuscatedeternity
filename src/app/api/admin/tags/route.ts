import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_TAGS: Record<string, any> = {
    "horize1n": {
        "customName": "ZEN | ADMIN",
        "type": "assetid",
        "backgroundId": "94569112529077",
        "strokeColor": "#a855f7"
    },
    "MrJackson253": {
        "customName": "CTL",
        "type": "assetid",
        "backgroundId": "77591385584235",
        "strokeColor": "#3b82f6"
    },
    "Blaze_xzxy": {
        "customName": "Blaze",
        "type": "assetid",
        "backgroundId": "112857141267478",
        "strokeColor": "#f97316"
    },
    "sukiie_09": {
        "customName": "Xeo",
        "type": "assetid",
        "backgroundId": "87250326383766",
        "strokeColor": "#ec4899"
    },
    "toxic_player78906": {
        "customName": "Cursed",
        "type": "assetid",
        "backgroundId": "120302010822897",
        "strokeColor": "#ef4444"
    }
};

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
    return true;
}

async function getStoredTags(): Promise<Record<string, any>> {
    if (!supabase) return { ...DEFAULT_TAGS };

    const { data } = await supabase
        .from('stats')
        .select('value')
        .eq('key', 'eternity:custom_tags')
        .maybeSingle();

    if (data && data.value) {
        try {
            return typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        } catch (e) {
            console.error('JSON parse error in getStoredTags:', e);
        }
    }

    // Seed defaults if empty
    await supabase.from('stats').upsert({
        key: 'eternity:custom_tags',
        value: JSON.stringify(DEFAULT_TAGS)
    });

    return { ...DEFAULT_TAGS };
}

async function saveStoredTags(tags: Record<string, any>): Promise<boolean> {
    if (!supabase) return true;

    const { error } = await supabase.from('stats').upsert({
        key: 'eternity:custom_tags',
        value: JSON.stringify(tags)
    });

    return !error;
}

// GET /api/admin/tags -> Fetch all overhead tags
export async function GET(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const tags = await getStoredTags();
        return NextResponse.json({ success: true, tags });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || "Failed to load tags" }, { status: 500 });
    }
}

// POST /api/admin/tags -> Add or Update a tag
export async function POST(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, customName, type, backgroundId, imageUrl, gifConfig, strokeColor, textAnimation } = body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
        }

        const cleanUsername = username.trim();
        const currentTags = await getStoredTags();

        currentTags[cleanUsername] = {
            customName: customName ? customName.trim() : cleanUsername,
            type: type || 'assetid',
            backgroundId: backgroundId ? backgroundId.trim() : undefined,
            imageUrl: imageUrl ? imageUrl.trim() : undefined,
            gifConfig: gifConfig || undefined,
            strokeColor: strokeColor || '#a855f7',
            textAnimation: textAnimation || 'none',
            updatedAt: new Date().toISOString()
        };

        const saved = await saveStoredTags(currentTags);
        if (!saved) {
            return NextResponse.json({ success: false, error: "Failed to save to database" }, { status: 500 });
        }

        return NextResponse.json({ success: true, tags: currentTags, message: `Tag for '${cleanUsername}' updated!` });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || "Failed to update tag" }, { status: 500 });
    }
}

// DELETE /api/admin/tags -> Delete a tag
export async function DELETE(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ success: false, error: "Username query parameter is required" }, { status: 400 });
        }

        const currentTags = await getStoredTags();
        const targetKey = Object.keys(currentTags).find(k => k.toLowerCase() === username.toLowerCase());

        if (targetKey) {
            delete currentTags[targetKey];
            await saveStoredTags(currentTags);
            return NextResponse.json({ success: true, tags: currentTags, message: `Tag for '${username}' removed!` });
        } else {
            return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || "Failed to delete tag" }, { status: 500 });
    }
}
