import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
};

const DEFAULT_TAGS: Record<string, any> = {
    "horize1n": {
        "customName": "ZEN | ADMIN",
        "type": "assetid",
        "backgroundId": "94569112529077"
    },
    "MrJackson253": {
        "customName": "CTL",
        "type": "assetid",
        "backgroundId": "77591385584235"
    },
    "Blaze_xzxy": {
        "customName": "Blaze",
        "type": "assetid",
        "backgroundId": "112857141267478"
    },
    "sukiie_09": {
        "customName": "Xeo",
        "type": "assetid",
        "backgroundId": "87250326383766"
    },
    "toxic_player78906": {
        "customName": "Cursed",
        "type": "assetid",
        "backgroundId": "120302010822897"
    }
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('stats')
                .select('value')
                .eq('key', 'eternity:custom_tags')
                .maybeSingle();

            if (data && data.value) {
                try {
                    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
                    return NextResponse.json(parsed, { headers: corsHeaders });
                } catch (e) {
                    console.error('Error parsing custom tags:', e);
                }
            } else {
                // Pre-seed into Supabase so it's initialized
                await supabase.from('stats').upsert({
                    key: 'eternity:custom_tags',
                    value: JSON.stringify(DEFAULT_TAGS)
                });
            }
        }

        return NextResponse.json(DEFAULT_TAGS, { headers: corsHeaders });
    } catch (e) {
        console.error('Failed to fetch tags:', e);
        return NextResponse.json(DEFAULT_TAGS, { headers: corsHeaders });
    }
}
