import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const username = request.nextUrl.searchParams.get('username');
    const fallbackImage = 'https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/AvatarHeadshot/Png';

    if (!username) return NextResponse.redirect(fallbackImage, { status: 302 });

    try {
        const userRes = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernames: [username], excludeBannedUsers: false })
        });
        const userData = await userRes.json();

        if (userData.data && userData.data.length > 0) {
            const userId = userData.data[0].id;
            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
            const thumbData = await thumbRes.json();

            if (thumbData.data && thumbData.data.length > 0 && thumbData.data[0].imageUrl) {
                return NextResponse.redirect(thumbData.data[0].imageUrl, { status: 302 });
            }
        }
    } catch (e) {
        console.error("Avatar proxy error:", e);
    }

    return NextResponse.redirect(fallbackImage, { status: 302 });
}
