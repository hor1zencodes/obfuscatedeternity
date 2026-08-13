const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8') || fs.readFileSync('.env.local', 'utf16le');
const envStr = envFile.toString();
const supabaseUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envStr.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding Database...");
    const Users = ["GhostOpe", "NullSec", "ExoTracker", "Dark_Web", "AlphaTest"];
    const Executors = ["Wave", "Solara", "Solara", "Xeno", "MacSploit"];
    const Geo = [
        { lat: 35.6895, lon: 139.6917, country: "Japan" },
        { lat: 50.1109, lon: 8.6821, country: "Germany" },
        { lat: 48.8566, lon: 2.3522, country: "France" },
        { lat: 45.5231, lon: -122.6765, country: "US" },
        { lat: 51.5072, lon: -0.1276, country: "UK" }
    ];

    for (let i = 0; i < Users.length; i++) {
        let u = Users[i];

        // Log Mock Execution
        await supabase.from('stats').upsert({
            key: `eternity:log:${Date.now() - i * 1000}_${Math.random().toString(36).substring(2, 7)}`,
            value: JSON.stringify({ text: `User '${u}' authenticated from script executor`, color: "#27c93f" })
        });

        // Executor Mapping
        await supabase.from('stats').upsert({
            key: `eternity:executor:${u}`,
            value: Executors[i]
        });

        // Geo Mapping
        await supabase.from('stats').upsert({
            key: `eternity:geo:${u}`,
            value: JSON.stringify(Geo[i])
        });

        // Add to Live Users
        await supabase.from('live_users').upsert({
            username: u,
            last_ping: new Date().toISOString()
        });

        console.log(`Inserted -> User: ${u}`);
    }
    console.log("Finished. Please refresh your Dashboard.");
}

seed();
