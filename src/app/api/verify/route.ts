import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    // Enable CORS so the Roblox client can read the response
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { searchParams } = new URL(request.url);
    const user = searchParams.get('user');

    if (!user) {
        return new NextResponse("false", { status: 400, headers: corsHeaders });
    }

    try {
        let isWhitelisted = false;

        if (supabase) {
            const { data, error } = await supabase
                .from('whitelist')
                .select('username')
                .ilike('username', user)
                .single();
            isWhitelisted = !!data && !error;
        } else {
            // Fallback for local testing without Supabase
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
            isWhitelisted = defaultWhitelist.some(u => u.toLowerCase() === user.toLowerCase());
        }

        if (isWhitelisted) {
            if (supabase) {
                try {
                    // Update total_executions
                    const { data: totalData } = await supabase
                        .from('stats')
                        .select('value')
                        .eq('key', 'eternity:stats:total_executions')
                        .single();

                    const currentTotal = totalData?.value ? parseInt(totalData.value.toString(), 10) : 1515;
                    const newTotal = currentTotal + 1;
                    await supabase
                        .from('stats')
                        .upsert({ key: 'eternity:stats:total_executions', value: newTotal });

                    // Update daily executions
                    const today = new Date().toISOString().split('T')[0];
                    const dailyKey = `eternity:stats:executions:${today}`;
                    const { data: dailyData } = await supabase
                        .from('stats')
                        .select('value')
                        .eq('key', dailyKey)
                        .single();

                    const currentDaily = dailyData?.value ? parseInt(dailyData.value.toString(), 10) : 0;
                    const newDaily = currentDaily + 1;
                    await supabase
                        .from('stats')
                        .upsert({ key: dailyKey, value: newDaily });
                } catch (e) {
                    console.error("Stats logging failed", e);
                }
            }

            // Return plaintext "true" for the Lua script to easily read
            return new NextResponse("true", { headers: corsHeaders });
        } else {
            // Return plaintext "false"
            return new NextResponse("false", { headers: corsHeaders });
        }
    } catch (e) {
        console.error("Verify error:", e);
        return new NextResponse("false", { status: 500, headers: corsHeaders });
    }
}

// Handle OPTIONS request for CORS preflight
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
