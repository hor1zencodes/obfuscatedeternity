const fs = require('fs');
const path = require('path');

const files = [
    "src/app/api/verify/route.ts",
    "src/app/api/ping/route.ts",
    "src/app/api/authenticate/route.ts",
    "src/app/api/admin/whitelist/route.ts",
    "src/app/api/admin/seed/route.ts",
    "src/app/api/admin/live-users/route.ts",
    "src/app/api/admin/auth/route.ts"
];

for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace:
    // if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    //     redis = Redis.fromEnv();
    // }
    
    // With:
    // const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    // const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    // if (kvUrl && kvToken) {
    //     redis = new Redis({ url: kvUrl, token: kvToken });
    // }
    
    content = content.replace(
        /if\s*\(\s*process\.env\.UPSTASH_REDIS_REST_URL\s*&&\s*process\.env\.UPSTASH_REDIS_REST_TOKEN\s*\)\s*\{\s*redis\s*=\s*Redis\.fromEnv\(\);\s*\}/g,
        `const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
if (kvUrl && kvToken) {
    redis = new Redis({ url: kvUrl, token: kvToken });
}`
    );
    
    fs.writeFileSync(filePath, content);
}
console.log("Done replacing env variables!");
