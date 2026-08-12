import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        if (!supabase) {
            return NextResponse.json({ success: false, error: "Supabase is not configured. Cannot seed." }, { status: 400 });
        }
        
        // Fetch the old whitelist from GitHub
        const githubUrl = "https://raw.githubusercontent.com/hor1zencodes/patanahi/main/whitelist.json";
        const res = await fetch(githubUrl);
        
        if (!res.ok) {
            return NextResponse.json({ success: false, error: "Failed to fetch from GitHub" }, { status: 500 });
        }
        
        let rawText = await res.text();
        
        // Fix trailing comma or broken JSON if any (as seen in the current file ending with "sad\n\n)
        if (!rawText.trim().endsWith("]")) {
            // Very naive cleanup: just regex extract all quotes words
            const matches = rawText.match(/"([^"]+)"/g);
            if (matches) {
                const names = matches.map(m => m.replace(/"/g, ''));
                
                // Add all to Supabase
                const insertData = names.map(name => ({ username: name.toLowerCase() }));
                await supabase.from("whitelist").upsert(insertData, { onConflict: 'username' });
                
                return NextResponse.json({ 
                    success: true, 
                    message: `Successfully seeded ${names.length} users into the Supabase database!`,
                    users: names
                });
            }
        }
        
        // If it's valid JSON
        const whitelist: string[] = JSON.parse(rawText);
        let count = 0;
        
        const validNames = whitelist.filter(u => u && u.trim()).map(u => ({ username: u.trim().toLowerCase() }));
        if (validNames.length > 0) {
            await supabase.from("whitelist").upsert(validNames, { onConflict: 'username' });
            count = validNames.length;
        }
        
        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${count} users into the Supabase database!` 
        });
        
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message || "Server Error" }, { status: 500 });
    }
}
