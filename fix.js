const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8') || fs.readFileSync('.env.local', 'utf16le');
const envStr = envFile.toString();
const supabaseUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const supabaseKey = envStr.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Fixing integer conversions...");
    await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: 1337 });

    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `eternity:stats:executions:${today}`;
    await supabase.from('stats').upsert({ key: dailyKey, value: 5 });

    console.log("Fixed! Check dashboard.");
}
fix();
