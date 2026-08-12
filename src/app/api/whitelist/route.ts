import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    try {
        if (supabase) {
            const { data, error } = await supabase.from('whitelist').select('username');
            if (error) throw error;
            const whitelist = data.map(row => row.username);
            return NextResponse.json(whitelist || [], { headers: corsHeaders });
        } else {
            const defaultWhitelist = [
                "MrJackson253", "vqzx1i", "horize1n", "shahnu2004", "SKY_SOHAM29",
                "Alt_laryyy", "rndyboy_zehrilalund", "rndyboy_zamasu", "J4xznnalt",
                "subhxrafia", "whitewalimonster", "lowtierrrrz", "l0wtierrrr",
                "SHIVRAJ937", "adrxqqq2099", "FIliekYdavwd", "possesive87",
                "samayrapcodwali", "l0wtierr", "jx0ShadowRocket", "timebomb585",
                "arch1zq", "haunteqdolls", "ifwtravisz", "lscortisolalt",
                "sukiie_09", "traumatizedsensee", "idekanymore0374", "sahib_jatt9",
                "Blaze_xzxy", "phoneunknow", "karanax056", "Gora_chut",
                "ExMoscoLA", "Chutkakiller", "34vk_IceRavenPlays", "Tokiyobaji2",
                "rajtohpagalh", "RAJ_SBKA", "frisemann", "agstaimoor1235", "sad",
                "hor1zxn", "testuser"
            ];
            return NextResponse.json(defaultWhitelist, { headers: corsHeaders });
        }
    } catch (e) {
        return NextResponse.json([], { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
