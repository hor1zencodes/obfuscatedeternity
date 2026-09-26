import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to authenticate admin session via admin_token cookie
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
    return true; // Fallback for local dev
}

// GET: Retrieve all active kick orders
export async function GET(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        if (!supabase) {
            return NextResponse.json({ success: true, kickedUsers: [] });
        }

        // Fetch all eternity:kick:* entries from stats table
        const { data, error } = await supabase
            .from('stats')
            .select('key, value')
            .ilike('key', 'eternity:kick:%');

        if (error) {
            console.error("Error fetching kicked users:", error);
            return NextResponse.json({ success: false, error: "Database error" }, { status: 500 });
        }

        const kickedUsers: any[] = [];
        if (data) {
            for (const item of data) {
                try {
                    const parsed = typeof item.value === 'string' ? JSON.parse(item.value) : item.value;
                    const u = item.key.replace('eternity:kick:', '');
                    kickedUsers.push({
                        username: parsed.username || u,
                        reason: parsed.reason || "Kicked by an Eternity Admin.",
                        kickedAt: parsed.kickedAt || Date.now(),
                        kickedBy: parsed.kickedBy || "Admin"
                    });
                } catch {
                    // Ignore parse error
                }
            }
        }

        // Sort latest kicks first
        kickedUsers.sort((a, b) => (b.kickedAt || 0) - (a.kickedAt || 0));

        return NextResponse.json({ success: true, kickedUsers });
    } catch (e: any) {
        console.error("Admin kick GET error:", e);
        return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
    }
}

// POST: Issue a kick command against a user
export async function POST(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, reason, removeWhitelist } = body;

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
        }

        const cleanUsername = username.trim();
        const lowerUser = cleanUsername.toLowerCase();
        const kickReason = (reason && typeof reason === 'string' && reason.trim())
            ? reason.trim()
            : "Kicked by an Eternity Admin.";
        const kickedAt = Date.now();

        if (supabase) {
            // 1. Store kick record in stats table (polled by Lua script)
            await supabase.from('stats').upsert({
                key: `eternity:kick:${lowerUser}`,
                value: JSON.stringify({
                    username: cleanUsername,
                    reason: kickReason,
                    kickedAt,
                    kickedBy: "Admin"
                })
            });

            // 2. Remove user from live_users table immediately
            await supabase.from('live_users').delete().ilike('username', cleanUsername);

            // 3. Clear user's active game status from stats
            await supabase.from('stats').delete().eq('key', `eternity:activity:${lowerUser}`);

            // 4. Log the admin action to the activity feed
            await supabase.from('stats').upsert({
                key: `eternity:log:${kickedAt}_kick_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({
                    text: `Admin kicked '${cleanUsername}' from active game (Reason: ${kickReason})`,
                    color: "#ef4444"
                })
            });

            // 5. Optionally revoke whitelist access if selected
            if (removeWhitelist) {
                await supabase.from('whitelist').delete().ilike('username', lowerUser);
                await supabase.from('stats').upsert({
                    key: `eternity:log:${kickedAt + 1}_wl_revoke_${Math.random().toString(36).substring(2, 7)}`,
                    value: JSON.stringify({
                        text: `Admin revoked whitelist access for '${cleanUsername}'`,
                        color: "#f59e0b"
                    })
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Kick order issued for ${cleanUsername}`,
            kickData: {
                username: cleanUsername,
                reason: kickReason,
                kickedAt
            }
        });
    } catch (e: any) {
        console.error("Admin kick POST error:", e);
        return NextResponse.json({ success: false, error: e.message || "Server Error" }, { status: 500 });
    }
}

// DELETE: Revoke/pardon a kick order so the user can use the script again
export async function DELETE(request: NextRequest) {
    if (!(await authenticateAdmin(request))) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        let username = searchParams.get('username');

        if (!username) {
            const body = await request.json().catch(() => ({}));
            username = body.username;
        }

        if (!username || typeof username !== 'string' || !username.trim()) {
            return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 });
        }

        const cleanUsername = username.trim();
        const lowerUser = cleanUsername.toLowerCase();

        if (supabase) {
            // Delete kick key from stats
            await supabase.from('stats').delete().eq('key', `eternity:kick:${lowerUser}`);

            // Log pardon
            await supabase.from('stats').upsert({
                key: `eternity:log:${Date.now()}_pardon_${Math.random().toString(36).substring(2, 7)}`,
                value: JSON.stringify({
                    text: `Admin pardoned / revoked kick for '${cleanUsername}'`,
                    color: "#3b82f6"
                })
            });
        }

        return NextResponse.json({
            success: true,
            message: `Kick revoked for ${cleanUsername}`
        });
    } catch (e: any) {
        console.error("Admin kick DELETE error:", e);
        return NextResponse.json({ success: false, error: e.message || "Server Error" }, { status: 500 });
    }
}
