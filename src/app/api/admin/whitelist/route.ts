import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

export async function GET(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (supabase) {
            const { data, error } = await supabase.from('whitelist').select('username');
            if (error) throw error;
            const whitelist = data.map(row => row.username);
            return NextResponse.json({ success: true, whitelist });
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
                "rajtohpagalh", "RAJ_SBKA", "frisemann", "agstaimoor1235", "sad"
            ];
            return NextResponse.json({ success: true, whitelist: defaultWhitelist });
        }
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { username } = await request.json();
        if (!username) {
            return NextResponse.json({ success: false, error: "Username required" }, { status: 400 });
        }

        if (supabase) {
            await supabase.from('whitelist').insert([{ username: username.toLowerCase() }]);
            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({ text: `Admin granted access to '${username}'`, color: "#fff" })
            });
        }

        return NextResponse.json({ success: true, message: `Added ${username} to whitelist` });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { username } = await request.json();
        if (!username) {
            return NextResponse.json({ success: false, error: "Username required" }, { status: 400 });
        }

        if (supabase) {
            await supabase.from('whitelist').delete().eq('username', username.toLowerCase());
            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({ text: `Admin revoked access for '${username}'`, color: "#ffbd2e" })
            });
        }

        return NextResponse.json({ success: true, message: `Removed ${username} from whitelist` });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
