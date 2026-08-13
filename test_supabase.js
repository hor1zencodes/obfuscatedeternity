const fs = require('fs');
const raw = fs.readFileSync('.env.local', 'utf16le') || fs.readFileSync('.env.local', 'utf8');
console.log("RAW EXTRACT: ", raw.substring(0, 150));


if (!supabaseUrl || !supabaseKey) {
    console.log("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // Test upserting a log
    console.log("Upserting test log...");
    const { data: upsertData, error: upsertError } = await supabase.from('stats').upsert({
        key: `eternity:log:11111_test`,
        value: JSON.stringify({ text: "Test log", color: "#fff" })
    }).select();

    console.log("Upsert Error:", upsertError);
    console.log("Upsert Data:", upsertData);

    // Test selecting
    const { data: selectData, error: selectError } = await supabase
        .from('stats')
        .select('key, value')
        .ilike('key', 'eternity:log:%');

    console.log("Select Error:", selectError);
    console.log("Select Data:", selectData);
}

test();
