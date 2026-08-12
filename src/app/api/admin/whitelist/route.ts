import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

let redis: Redis | null = null;
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (kvUrl && kvToken) {
    redis = new Redis({ url: kvUrl, token: kvToken });
}

// Helper to authenticate admin
async function authenticateAdmin(request: NextRequest) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) return false;
    if (redis) {
        const sessionValid = await redis.get(`admin_session:${token}`);
        return !!sessionValid;
    }
    return true; // Local fallback
}

export async function GET(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        if (redis) {
            const whitelist = await redis.smembers("whitelist");
            return NextResponse.json({ success: true, whitelist: whitelist || [] });
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
        
        if (redis) {
            await redis.sadd("whitelist", username.toLowerCase());
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
        
        if (redis) {
            await redis.srem("whitelist", username.toLowerCase());
        }
        
        return NextResponse.json({ success: true, message: `Removed ${username} from whitelist` });
    } catch (e) {
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}
