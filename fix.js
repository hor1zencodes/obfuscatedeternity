const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8') || fs.readFileSync('.env.local', 'utf16le');
const envStr = envFile.toString();
const supabaseUrl = envStr.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim().replace(/['"]/g, '');
const supabaseKey = envStr.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim().replace(/['"]/g, '');

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Fixing integer conversions...");
    const { data: d1, error: e1 } = await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: 1337 }).select();
    console.log("Total executions reset:", { d1, e1 });

    const today = new Date().toISOString().split('T')[0];
    const dailyKey = `eternity:stats:executions:${today}`;
    const { data: d2, error: e2 } = await supabase.from('stats').upsert({ key: dailyKey, value: 5 }).select();
    console.log("Daily executions reset:", { d2, e2 });

    console.log("Done.");
}
fix();
