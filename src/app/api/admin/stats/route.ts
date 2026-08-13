import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Authenticate admin session
        const token = request.cookies.get('admin_token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (supabase) {
            const { data: sessionValid } = await supabase
                .from('admin_sessions')
                .select('token')
                .eq('token', token)
                .gte('expires_at', new Date().toISOString())
                .single();
            if (!sessionValid) {
                return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
            }
        }

        let totalExecutions = 1515;
        let chartData: { date: string; executions: number }[] = [];
        let activityFeed: any[] = [];
        let executionTrend = "Stable";
        let executionTrendUp = true;
        let whitelistTrend = "Authorized Users";
        let pieChartData: { name: string; value: number }[] = [];
        let leaderboard: { user: string; count: number }[] = [];
        let locations: { lat: number; lon: number; size: number }[] = [];

        if (supabase) {
            // Get total executions
            const { data: totalData } = await supabase
                .from('stats')
                .select('value')
                .eq('key', 'eternity:stats:total_executions')
                .single();

            if (!totalData) {
                // Initialize to 1515 if it doesn't exist
                await supabase.from('stats').insert({ key: 'eternity:stats:total_executions', value: 1515 });
                totalExecutions = 1515;
            } else {
                totalExecutions = parseInt(totalData.value.toString(), 10);

                // Self-healing: if the tracker started from 0 instead of 1515
                if (totalExecutions < 1515) {
                    totalExecutions += 1515;
                    await supabase.from('stats').upsert({ key: 'eternity:stats:total_executions', value: totalExecutions });
                }
            }

            // Get all needed keys for the last 7 days
            const keysToFetch = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                keysToFetch.push(`eternity:stats:executions:${dateStr}`);
            }

            // Fetch all at once for efficiency
            const { data: dailyStats } = await supabase
                .from('stats')
                .select('key, value')
                .in('key', keysToFetch);

            const statsMap: Record<string, number> = {};
            dailyStats?.forEach(stat => {
                statsMap[stat.key] = stat.value;
            });

            // Get last 7 days of executions for the chart
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);

                const dailyExecs = statsMap[`eternity:stats:executions:${dateStr}`];
                chartData.push({
                    date: dayName,
                    executions: dailyExecs ? parseInt(dailyExecs.toString(), 10) : 0
                });
            }

            // Generate execution trend
            if (chartData.length >= 2) {
                const todayExecs = chartData[6].executions;
                const yesterdayExecs = chartData[5].executions;
                if (yesterdayExecs === 0 && todayExecs > 0) {
                    executionTrend = "▲ 100% increase";
                } else if (yesterdayExecs === 0 && todayExecs === 0) {
                    executionTrend = "Stable";
                } else {
                    const pct = ((todayExecs - yesterdayExecs) / yesterdayExecs) * 100;
                    executionTrendUp = pct >= 0;
                    executionTrend = `${pct >= 0 ? '▲' : '▼'} ${Math.abs(Math.round(pct))}% ${pct >= 0 ? 'increase' : 'decrease'}`;
                }
            }

            // Fetch activity logs
            const { data: logData } = await supabase
                .from('stats')
                .select('key, value')
                .ilike('key', 'eternity:log:%');

            if (logData) {
                const fortyEightHoursAgo = Date.now() - (48 * 60 * 60 * 1000);

                // Identify and wipe expired logs (older than 48 hours)
                const expiredLogs = logData.filter(log => {
                    const timestamp = parseInt(log.key.split(':')[2].split('_')[0], 10) || Date.now();
                    return timestamp < fortyEightHoursAgo;
                });
                if (expiredLogs.length > 0) {
                    const expiredKeys = expiredLogs.map(log => log.key);
                    await supabase.from('stats').delete().in('key', expiredKeys);
                }

                let parsedLogs = logData.filter(log => {
                    const timestamp = parseInt(log.key.split(':')[2].split('_')[0], 10) || Date.now();
                    return timestamp >= fortyEightHoursAgo;
                }).map(log => {
                    const timestamp = parseInt(log.key.split(':')[2].split('_')[0], 10) || Date.now();
                    let content = { text: "System Activity", color: "rgba(255,255,255,0.5)" };
                    try {
                        content = typeof log.value === 'string' ? JSON.parse(log.value) : log.value;
                    } catch (e) { }
                    return { id: log.key, timestamp, ...content };
                });

                const addedThisWeek = parsedLogs.filter(log => log.text.includes("granted access") && (Date.now() - log.timestamp) < 7 * 24 * 60 * 60 * 1000).length;
                whitelistTrend = `+${addedThisWeek} this week`;

                parsedLogs.sort((a, b) => b.timestamp - a.timestamp);

                activityFeed = parsedLogs.slice(0, 20).map(feed => {
                    const diffMs = Date.now() - feed.timestamp;
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMins / 60);
                    const diffDays = Math.floor(diffHours / 24);
                    let timeStr = "just now";
                    if (diffDays > 0) timeStr = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                    else if (diffHours > 0) timeStr = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                    else if (diffMins > 0) timeStr = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;

                    return { ...feed, time: timeStr };
                });
            }

            // Fetch executor market share
            const { data: execData } = await supabase
                .from('stats')
                .select('value')
                .ilike('key', 'eternity:executor:%');
            if (execData) {
                const share: Record<string, number> = {};
                execData.forEach(row => {
                    const exName = typeof row.value === 'string' ? row.value : 'Unknown';
                    share[exName] = (share[exName] || 0) + 1;
                });
                pieChartData = Object.keys(share).map(n => ({ name: n, value: share[n] }));
            }

            // Extract Leaderboard from logs
            if (logData) {
                const userCounts: Record<string, number> = {};
                const parsedLogs = logData.map(log => {
                    try { return typeof log.value === 'string' ? JSON.parse(log.value) : log.value; } catch (e) { return {}; }
                });
                parsedLogs.forEach(log => {
                    const match = log.text?.match(/User '([^']+)' authenticated/);
                    if (match) {
                        const u = match[1];
                        userCounts[u] = (userCounts[u] || 0) + 1;
                    }
                });
                leaderboard = Object.keys(userCounts)
                    .map(u => ({ user: u, count: userCounts[u] }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);
            }

            // Fetch globe locations
            const { data: locationData } = await supabase
                .from('stats')
                .select('value')
                .ilike('key', 'eternity:geo:%');
            if (locationData) {
                locationData.forEach(row => {
                    try {
                        const loc = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
                        if (loc.lat && loc.lon) {
                            locations.push({ lat: loc.lat, lon: loc.lon, size: 0.1 });
                        }
                    } catch (e) { }
                });
            }
        }

        return NextResponse.json({
            success: true,
            totalExecutions,
            chartData,
            activityFeed,
            executionTrend,
            executionTrendUp,
            whitelistTrend,
            pieChartData,
            leaderboard,
            locations
        });
    } catch (e) {
        console.error("Stats fetch error:", e);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
