import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Music, CircleDot, Copy, Check } from 'lucide-react';

interface LanyardData {
    discord_user: {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
        global_name: string | null;
        public_flags?: number;
        avatar_decoration_data?: {
            asset: string;
            sku_id: string;
        } | null;
    };
    discord_status: 'online' | 'idle' | 'dnd' | 'offline';
    activities: {
        id: string;
        name: string;
        type: number;
        state?: string;
        details?: string;
        application_id?: string;
        timestamps?: { start?: number; end?: number };
        assets?: { large_image?: string; large_text?: string; small_image?: string; small_text?: string };
        emoji?: { name: string; id?: string; animated?: boolean };
    }[];
    listening_to_spotify: boolean;
    spotify: {
        album: string;
        artist: string;
        song: string;
        album_art_url: string;
        timestamps: { start: number; end: number };
    } | null;
}

const SpotifyProgress = ({ start, end }: { start: number, end: number }) => {
    const [progress, setProgress] = useState(0);
    const [timeStr, setTimeStr] = useState({ current: '0:00', total: '0:00' });

    useEffect(() => {
        let frame: number;
        const totalDuration = end - start;

        const update = () => {
            const now = Date.now();
            let current = now - start;
            if (current > totalDuration) current = totalDuration;

            setProgress(Math.max(0, Math.min(100, (current / totalDuration) * 100)));

            const formatTime = (ms: number) => {
                const totalSeconds = Math.floor(ms / 1000);
                const m = Math.floor(totalSeconds / 60);
                const s = totalSeconds % 60;
                return `${m}:${s.toString().padStart(2, '0')}`;
            };

            setTimeStr({
                current: formatTime(current),
                total: formatTime(totalDuration)
            });

            if (current < totalDuration) {
                frame = requestAnimationFrame(update);
            }
        };

        update();
        return () => cancelAnimationFrame(frame);
    }, [start, end]);

    return (
        <div style={{ marginTop: '12px' }}>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: '#1ed760', borderRadius: '2px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-fira-code)', fontWeight: 500 }}>
                <span>{timeStr.current}</span>
                <span>{timeStr.total}</span>
            </div>
        </div>
    );
};

const GameTimer = ({ start }: { start: number }) => {
    const [elapsed, setElapsed] = useState('00:00 elapsed');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.max(0, now - start);
            const totalSeconds = Math.floor(diff / 1000);
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;

            if (h > 0) {
                setElapsed(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} elapsed`);
            } else {
                setElapsed(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} elapsed`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [start]);

    return <span style={{ fontFamily: 'var(--font-fira-code)', marginLeft: '4px' }}>{elapsed}</span>;
};

export function DiscordProfile({ userId }: { userId: string }) {
    const [data, setData] = useState<LanyardData | null>(null);
    const [copied, setCopied] = useState(false);
    const [realBadges, setRealBadges] = useState<any[]>([]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card hover triggering or bubbling
        if (data?.discord_user.username) {
            navigator.clipboard.writeText(data.discord_user.username);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        let ws: WebSocket;
        let heartbeatInterval: NodeJS.Timeout;

        // Fetch authentic live account badges (Premium + Public) via proxy
        fetch(`https://dcdn.dstn.to/profile/${userId}`)
            .then(res => res.json())
            .then(profileData => {
                if (profileData.badges) {
                    setRealBadges(profileData.badges);
                }
            })
            .catch(err => console.error("Could not fetch badges", err));

        const connect = () => {
            ws = new WebSocket('wss://api.lanyard.rest/socket');

            ws.onopen = () => {
                console.log('Connected to Lanyard');
            };

            ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);

                if (msg.op === 1) {
                    // Hello event, start heartbeat and subscribe
                    heartbeatInterval = setInterval(() => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(JSON.stringify({ op: 3 }));
                        }
                    }, msg.d.heartbeat_interval);

                    ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: userId }
                    }));
                } else if (msg.op === 0) {
                    if (msg.t === 'INIT_STATE' || msg.t === 'PRESENCE_UPDATE') {
                        setData(msg.d);
                    }
                }
            };

            ws.onclose = () => {
                clearInterval(heartbeatInterval);
                setTimeout(connect, 5000); // Reconnect after 5s
            };
        };

        connect();

        return () => {
            clearInterval(heartbeatInterval);
            if (ws) ws.close();
        };
    }, [userId]);

    if (!data) return <div style={{ margin: '60px auto 0', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>Connecting to Lanyard API...</div>;
    if (!data.discord_user) return <div style={{ maxWidth: '400px', margin: '60px auto 0', padding: '20px', color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)', border: '1px solid rgba(255, 95, 86, 0.2)', borderRadius: '12px', textAlign: 'center' }}>To enable live presence, your Discord account must be in the Lanyard Discord server (<strong>discord.gg/lanyard</strong>)</div>;

    const statusColors = {
        online: '#23a559',
        idle: '#f0b132',
        dnd: '#f23f42',
        offline: '#80848e'
    };

    const statusColor = statusColors[data.discord_status];
    const avatarUrl = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.${data.discord_user.avatar?.startsWith('a_') ? 'gif' : 'png'}?size=512`;

    // Process Avatar Decoration
    const avatarDecorationUrl = data.discord_user.avatar_decoration_data ?
        `https://cdn.discordapp.com/avatar-decoration-presets/${data.discord_user.avatar_decoration_data.asset}.png?size=96&passthrough=true` : null;

    // Process Full Account Badges via DSTN (bypassing bitmasks)
    const renderBadges = () => {
        return realBadges.map((b, i) => (
            <img
                key={i}
                src={`https://cdn.discordapp.com/badge-icons/${b.icon}.png`}
                alt={b.description}
                title={b.description}
                onError={(e) => (e.currentTarget.style.display = 'none')}
                style={{ width: '18px', height: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
            />
        ));
    };

    const customStatus = data.activities.find(a => a.type === 4);
    const playingGame = data.activities.find(a => a.type === 0 && a.id !== "custom");

    // Fetch Rich Presence Image via Discord CDN
    const getGameImage = (game: any) => {
        if (!game.assets?.large_image) return null;
        if (game.assets.large_image.startsWith('mp:external/')) {
            return `https://media.discordapp.net/external/${game.assets.large_image.replace('mp:external/', '')}`;
        }
        if (game.application_id) {
            return `https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`;
        }
        return null;
    };

    const gameImage = playingGame ? getGameImage(playingGame) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, filter: `drop-shadow(0 0 30px rgba(255,255,255,0.05))` }}
            viewport={{ once: false, margin: "-10%" }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="discord-profile-card discord-terminal-wrapper"
            style={{
                borderRadius: '16px',
                padding: '52px 28px 28px 28px',
                maxWidth: '420px',
                width: '100%',
                margin: '0 auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                position: 'relative',
                cursor: 'pointer'
            }}
        >

            {/* Solid Card Background Core */}
            <div style={{ position: 'absolute', inset: '1px', background: 'rgba(8, 8, 12, 0.98)', borderRadius: '15px', backdropFilter: 'blur(30px) saturate(150%)', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.02)' }} />

            {/* MacOS Terminal Header */}
            <div style={{ position: 'absolute', top: '1px', left: '1px', right: '1px', height: '36px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)', zIndex: 10, borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', border: '1px solid rgba(0,0,0,0.2)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '1px solid rgba(0,0,0,0.2)' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '1px solid rgba(0,0,0,0.2)' }} />
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-fira-code)', fontWeight: 500, letterSpacing: '0.02em' }}>
                    developer@eternity:~
                </div>
            </div>

            <div style={{ position: 'absolute', top: '36px', left: 0, right: 0, height: '120px', background: `linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)`, opacity: 0.8 }} />

            <div style={{ display: 'flex', gap: '22px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                    <img
                        src={avatarUrl}
                        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: `2px solid rgba(255,255,255,0.06)`, boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}
                        alt="Discord Avatar"
                    />
                    {avatarDecorationUrl && (
                        <img
                            src={avatarDecorationUrl}
                            style={{ position: 'absolute', top: '-15%', left: '-15%', width: '130%', height: '130%', pointerEvents: 'none', zIndex: 10 }}
                            alt=""
                        />
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                        border: '4px solid #08080c',
                        boxShadow: `0 2px 4px rgba(0,0,0,0.5)`,
                        zIndex: 11
                    }} />
                </div>

                <div style={{ flex: 1, zIndex: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            {data.discord_user.global_name || data.discord_user.username}
                        </h3>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            {renderBadges()}
                        </div>
                    </div>
                    <p
                        onClick={handleCopy}
                        style={{ margin: '2px 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-fira-code)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content', transition: 'all 0.2s', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
                        title="Copy Username"
                    >
                        @{data.discord_user.username}
                        {copied ? <Check size={14} color="#23a559" /> : <Copy size={12} />}
                    </p>
                    {customStatus?.state && (
                        <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {customStatus.emoji?.id ? (
                                <img src={`https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'png'}`} style={{ width: '18px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                            ) : customStatus.emoji?.name ? (
                                <span style={{ fontSize: '18px' }}>{customStatus.emoji.name}</span>
                            ) : null}
                            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                                {customStatus.state}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {data.listening_to_spotify && data.spotify && (
                    <motion.div
                        key="spotify-card"
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        style={{ marginTop: '24px', background: 'linear-gradient(135deg, rgba(30, 215, 96, 0.15) 0%, rgba(30, 215, 96, 0.05) 100%)', border: '1px solid rgba(30, 215, 96, 0.3)', padding: '16px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', position: 'relative', zIndex: 2, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    >
                        <img src={data.spotify.album_art_url} style={{ width: '64px', height: '64px', borderRadius: '10px', boxShadow: '0 8px 16px rgba(0,0,0,0.4)', objectFit: 'cover' }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1ed760', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                <Music size={12} /> Listening to Spotify
                            </div>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{data.spotify.song}</p>
                            <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>by {data.spotify.artist}</p>

                            {data.spotify.timestamps?.start && data.spotify.timestamps?.end && (
                                <SpotifyProgress start={data.spotify.timestamps.start} end={data.spotify.timestamps.end} />
                            )}
                        </div>
                    </motion.div>
                )}

                {playingGame && (
                    <motion.div
                        key="game-card"
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        style={{ marginTop: '24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}
                    >
                        <div style={{ position: 'relative', width: '64px', height: '64px', minWidth: '64px' }}>
                            {gameImage ? (
                                <img src={gameImage} style={{ width: '100%', height: '100%', borderRadius: '14px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '14px', background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Monitor size={28} color="rgba(255,255,255,0.4)" />
                                </div>
                            )}

                            {playingGame.assets?.small_image && playingGame.application_id && !playingGame.assets.small_image.startsWith('mp:external/') && (
                                <img
                                    src={`https://cdn.discordapp.com/app-assets/${playingGame.application_id}/${playingGame.assets.small_image}.png`}
                                    style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #0d0d12' }}
                                />
                            )}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                                <CircleDot size={12} /> PLAYING A GAME
                            </div>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{playingGame.name}</p>
                            {playingGame.details && <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{playingGame.details}</p>}
                            {playingGame.state && <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{playingGame.state}</p>}
                            {playingGame.timestamps?.start && <p style={{ margin: '2px 0 0', color: '#23a559', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}><GameTimer start={playingGame.timestamps.start} /></p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
