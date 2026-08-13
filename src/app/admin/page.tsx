"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Users, Activity, Shield, UserPlus, Trash2, Database, Search, Cpu, LayoutDashboard, LogOut, RefreshCw, Menu, Clock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ThreeJsBackground } from "@/components/ThreeJsBackground";
import { Globe } from "@/components/Globe";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [liveUsers, setLiveUsers] = useState<{ user: string, timestamp: number, isActive: boolean, executor?: string }[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "whitelist">("overview");
  const [logFilter, setLogFilter] = useState<"all" | "auth" | "whitelist" | "alerts">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [totalExecutions, setTotalExecutions] = useState(1337);
  const [chartData, setChartData] = useState<{ date: string, executions: number }[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [executionTrend, setExecutionTrend] = useState("Stable");
  const [executionTrendUp, setExecutionTrendUp] = useState(true);
  const [whitelistTrend, setWhitelistTrend] = useState("+0 this week");
  const [pieChartData, setPieChartData] = useState<{ name: string, value: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<{ user: string, count: number }[]>([]);
  const [locations, setLocations] = useState<{ lat: number, lon: number, size: number }[]>([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      setCurrentTime(now.toLocaleTimeString('en-IN', options));
      const istHourStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false });
      const istHour = parseInt(istHourStr.split(':')[0]);
      if (istHour >= 5 && istHour < 12) setGreeting('Good morning');
      else if (istHour >= 12 && istHour < 17) setGreeting('Good afternoon');
      else if (istHour >= 17 && istHour < 22) setGreeting('Good evening');
      else setGreeting('Good night');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData(true);
  }, []);

  const fetchData = async (initialCheck = false) => {
    setIsRefreshing(true);
    try {
      const resLive = await fetch("/api/admin/live-users");
      if (resLive.status === 401) {
        if (!initialCheck) setError("Session expired. Please log in again.");
        setIsAuthenticated(false);
        setIsRefreshing(false);
        return;
      }

      const dataLive = await resLive.json();
      if (dataLive.success) {
        setIsAuthenticated(true);
        setLiveUsers(dataLive.liveUsers);
      }

      const resWhite = await fetch("/api/admin/whitelist");
      const dataWhite = await resWhite.json();
      if (dataWhite.success) {
        setWhitelist(dataWhite.whitelist);
      }

      const resStats = await fetch("/api/admin/stats");
      if (resStats.ok) {
        const dataStats = await resStats.json();
        if (dataStats.success) {
          setTotalExecutions(dataStats.totalExecutions);
          setChartData(dataStats.chartData);
          if (dataStats.activityFeed) setActivityFeed(dataStats.activityFeed);
          if (dataStats.executionTrend) setExecutionTrend(dataStats.executionTrend);
          if (dataStats.executionTrendUp !== undefined) setExecutionTrendUp(dataStats.executionTrendUp);
          if (dataStats.whitelistTrend) setWhitelistTrend(dataStats.whitelistTrend);
          if (dataStats.pieChartData) setPieChartData(dataStats.pieChartData);
          if (dataStats.leaderboard) setLeaderboard(dataStats.leaderboard);
          if (dataStats.locations) setLocations(dataStats.locations);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setError(data.error || "Login failed");
      }
    } catch (e) {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNewUsername("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveWhitelist = async (username: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${username}?`)) return;
    try {
      const res = await fetch("/api/admin/whitelist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearLogs = async () => {
    if (!confirm('Are you sure you want to permanently clear all activity logs?')) return;
    try {
      const res = await fetch("/api/admin/logs", {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setActivityFeed([]);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredWhitelist = whitelist.filter(user =>
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '16px', position: 'relative' }}>
        <ThreeJsBackground />
        <motion.div
          className="hero-terminal-wrapper-mono"
          style={{ maxWidth: '400px', width: '100%', zIndex: 10 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="hero-terminal-mono terminal-grid-bg">
            <div className="terminal-header-mono">
              <div className="terminal-dots-mono">
                <div className="dot-mono dot-mono-r"></div>
                <div className="dot-mono dot-mono-y"></div>
                <div className="dot-mono dot-mono-g"></div>
              </div>
              <div className="terminal-title">admin_auth.exe</div>
              <div style={{ flex: 1 }}></div>
            </div>
            <div className="terminal-body" style={{ flexDirection: 'column', gap: '20px', padding: '40px 30px' }}>
              <div style={{ textAlign: 'center', width: '100%' }}>
                <Shield style={{ color: '#fff', width: '40px', height: '40px', margin: '0 auto 15px auto', opacity: 0.8 }} />
                <h1 className="hero-word-accent" style={{ fontSize: '24px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '5px' }}>Eternity Admin</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Restricted Access Area</p>
              </div>

              <form onSubmit={handleLogin} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', width: '18px', color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passphrase"
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      padding: '12px 15px 12px 45px',
                      color: '#fff',
                      fontFamily: 'var(--font-fira-code)',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>
                {error && <p style={{ color: '#ff5f56', fontSize: '12px', margin: '0' }}>{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="terminal-copy-btn-mono"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                >
                  {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout-container">
      <ThreeJsBackground />

      {/* Mobile Sidebar Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="dashboard-sidebar-header" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/eternity.png" alt="Eternity Logo" style={{ width: '26px', height: '26px', objectFit: 'contain', flexShrink: 0 }} />
          <span className="hero-word-accent dashboard-sidebar-text" style={{ fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.1em', marginLeft: '12px' }}>Admin</span>
        </div>

        <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>

          <div className="dashboard-sidebar-text" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '8px', marginLeft: '8px' }}>MAIN MENU</div>

          <button
            className="dashboard-nav-item"
            onClick={() => { setActiveTab("overview"); setIsSidebarOpen(false); }}
            style={{
              backgroundColor: activeTab === 'overview' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'overview' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'overview' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            }}
          >
            <LayoutDashboard size={20} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Overview</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() => { setActiveTab("sessions"); setIsSidebarOpen(false); }}
            style={{
              backgroundColor: activeTab === 'sessions' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'sessions' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'sessions' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            }}
          >
            <Activity size={20} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Active Sessions</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() => { setActiveTab("whitelist"); setIsSidebarOpen(false); }}
            style={{
              backgroundColor: activeTab === 'whitelist' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'whitelist' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'whitelist' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            }}
          >
            <Database size={20} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Access Control</span>
          </button>
        </nav>

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="dashboard-nav-item"
            onClick={() => fetchData()}
            style={{ color: '#fff', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} style={{ transition: 'transform 0.5s', transform: isRefreshing ? 'rotate(180deg)' : 'none' }} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Refresh</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() => { setIsAuthenticated(false); }}
            style={{ color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)' }}
          >
            <LogOut size={20} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Terminate</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main data-lenis-prevent="true" className="dashboard-main-content" style={{ paddingTop: 0 }}>
        <header className="dashboard-header" style={{ display: 'flex', alignItems: 'center', padding: '24px' }}>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open Menu"
            style={{ marginRight: '16px' }}
          >
            <Menu size={28} />
          </button>

          <div style={{ padding: '0 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h1 className="hero-word-accent" style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '0.02em', lineHeight: 1.2 }}>{greeting}, Horizen.</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0, fontWeight: 600, letterSpacing: '0.05em', display: 'flex', alignItems: 'center' }}>
              <Clock size={14} style={{ marginRight: '6px' }} /> Local Time: {currentTime} (IST)
            </p>
          </div>
        </header>

        <div className="dashboard-content-wrapper" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
          <AnimatePresence mode="wait">
            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, staggerChildren: 0.1 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}
              >
                <div className="dashboard-stats-grid">
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #27c93f', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Users size={24} color="#27c93f" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Live Users</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#fff', lineHeight: 1 }}>{liveUsers.length}</div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
                        {liveUsers.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                            {liveUsers.slice(0, 5).map((u, i) => (
                              <img key={u.user} src={`/api/admin/avatar?username=${u.user}`} title={u.user} alt={u.user} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #000', marginLeft: '-12px', zIndex: i, backgroundColor: 'rgba(255,255,255,0.1)', objectFit: 'cover' }} />
                            ))}
                          </div>
                        )}
                        <div style={{ color: '#27c93f', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="pulse-dot-green" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }}></span> Active now
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #fff', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Database size={24} color="#fff" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Whitelisted Users</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#fff', lineHeight: 1 }}>{whitelist.length}</div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        {whitelistTrend}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #ffbd2e', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <Cpu size={24} color="#ffbd2e" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Total Executions</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#fff', lineHeight: 1 }}>{totalExecutions}</div>
                      <div style={{ color: executionTrendUp ? '#27c93f' : '#ff5f56', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                        {executionTrend}
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Graphical Area & Feed */}
                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                  {/* Execution Graph */}
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="hero-terminal-wrapper-mono" style={{ flex: '2 1 600px', margin: 0, maxWidth: 'none' }}>
                    <div className="hero-terminal-mono terminal-grid-bg" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%' }}>
                      <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="terminal-dots-mono">
                          <div className="dot-mono dot-mono-r"></div>
                          <div className="dot-mono dot-mono-y"></div>
                          <div className="dot-mono dot-mono-g"></div>
                        </div>
                        <div className="terminal-title">execution_telemetry.chart</div>
                        <div style={{ flex: 1 }}></div>
                      </div>
                      <div className="terminal-card-body chart-container" style={{ width: '100%', position: 'relative', zIndex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.15)" vertical={true} />
                            <XAxis dataKey="date" stroke="none" tick={{ fill: '#a0a0a0', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-fira-code)' }} tickMargin={15} />
                            <YAxis stroke="none" tick={false} domain={['dataMin', 'auto']} />
                            <Tooltip
                              contentStyle={{ backgroundColor: 'rgba(10,10,10,0.95)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', fontFamily: 'var(--font-fira-code)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: '#ffffff' }}
                            />
                            <Area type="monotone" dataKey="executions" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorExecutions)" activeDot={{ r: 6, fill: '#ffffff', stroke: '#000', strokeWidth: 2 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recent Activity Feed */}
                  <div className="hero-terminal-wrapper-mono" style={{ flex: '1 1 300px', margin: 0, maxWidth: 'none' }}>
                    <div className="hero-terminal-mono" style={{ borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="terminal-title" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            activity.log
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {['all', 'auth', 'whitelist', 'alerts'].map((f) => (
                                <button
                                  key={f}
                                  onClick={() => setLogFilter(f as any)}
                                  style={{
                                    background: logFilter === f ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: logFilter === f ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: logFilter === f ? '#fff' : 'rgba(255,255,255,0.4)',
                                    fontSize: '9px',
                                    textTransform: 'uppercase',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    lineHeight: 1,
                                    transition: 'all 0.2s'
                                  }}>
                                  {f}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button onClick={clearLogs} style={{ fontSize: '10px', color: '#ff5f56', background: 'rgba(255, 95, 86, 0.1)', border: '1px solid rgba(255, 95, 86, 0.2)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                            Clear
                          </button>
                        </div>
                      </div>
                      <div className="terminal-card-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px' }}>
                        {activityFeed.filter(log => {
                          if (logFilter === 'all') return true;
                          if (logFilter === 'auth' && log.text.toLowerCase().includes('authenticated')) return true;
                          if (logFilter === 'whitelist' && (log.text.toLowerCase().includes('admin granted') || log.text.toLowerCase().includes('admin revoked'))) return true;
                          if (logFilter === 'alerts' && (log.text.toLowerCase().includes('unauthorized') || log.text.toLowerCase().includes('failed'))) return true;
                          return false;
                        }).length === 0 ? (
                          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '13px' }}>
                            NO RECENT SYSTEM ACTIVITY
                          </div>
                        ) : activityFeed.filter(log => {
                          if (logFilter === 'all') return true;
                          if (logFilter === 'auth' && log.text.toLowerCase().includes('authenticated')) return true;
                          if (logFilter === 'whitelist' && (log.text.toLowerCase().includes('admin granted') || log.text.toLowerCase().includes('admin revoked'))) return true;
                          if (logFilter === 'alerts' && (log.text.toLowerCase().includes('unauthorized') || log.text.toLowerCase().includes('failed'))) return true;
                          return false;
                        }).map((event) => (
                          <div key={event.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                            <div style={{ marginTop: '5px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: event.color, flexShrink: 0, boxShadow: `0 0 10px ${event.color}` }}></div>
                            <div>
                              <div style={{ color: '#fff', fontSize: '13px', lineHeight: 1.5, fontFamily: 'var(--font-fira-code)' }}>{event.text}</div>
                              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>{event.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginTop: '32px' }}>

                  {/* Left: Interactive World Globe */}
                  <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderRadius: '12px', minHeight: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', width: '100%', marginBottom: '16px', fontWeight: 700 }}>GLOBAL GEO-MATRIX</h2>
                    <Globe locations={locations} />
                  </div>

                  {/* Right: Pie Chart & Leaderboard Stack */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Executor Market Share */}
                    <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 700 }}>EXECUTOR METRICS</h2>
                      <div style={{ height: '200px', width: '100%' }}>
                        {pieChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                {pieChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#27c93f', '#ff5f56', '#ffbd2e', '#3b82f6', '#a855f7'][index % 5]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>AWAITING METRICS</div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '12px', justifyContent: 'center' }}>
                        {pieChartData.map((d, i) => (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ['#27c93f', '#ff5f56', '#ffbd2e', '#3b82f6', '#a855f7'][i % 5] }} />
                            <span style={{ fontSize: '12px', color: '#fff' }}>{d.name.substring(0, 8)} ({d.value})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Leaderboard */}
                    <div className="hero-terminal-mono terminal-card-body" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', flex: 1 }}>
                      <h2 style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', marginBottom: '16px', fontWeight: 700 }}>TOP EXECUTORS</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {leaderboard.length > 0 ? leaderboard.map((usr, i) => (
                          <div key={usr.user} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', borderLeft: i === 0 ? '3px solid #ffbd2e' : i === 1 ? '3px solid #e2e8f0' : i === 2 ? '3px solid #b45309' : '3px solid transparent' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <img src={`/api/admin/avatar?username=${usr.user}`} alt="Avatar" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                              <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{usr.user}</span>
                            </div>
                            <span style={{ fontSize: '12px', color: '#27c93f', fontWeight: 'bold' }}>{usr.count} <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 'normal' }}>EXEC</span></span>
                          </div>
                        )) : <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '12px', padding: '20px' }}>NO DATA FOUND</div>}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: ACTIVE SESSIONS */}
            {activeTab === "sessions" && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <div className="hero-terminal-wrapper-mono" style={{ width: '100%', maxWidth: 'none' }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">live_executions.sys</div>
                      <div style={{ flex: 1 }}></div>
                    </div>
                    <div style={{ overflowX: 'auto', padding: '0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '20px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Identifier</th>
                            <th style={{ padding: '20px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Executor</th>
                            <th style={{ padding: '20px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '20px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Last Ping</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveUsers.length === 0 ? (
                            <tr>
                              <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                NO ACTIVE EXECUTIONS DETECTED
                              </td>
                            </tr>
                          ) : (
                            liveUsers.map((user, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '20px 24px', fontFamily: 'var(--font-fira-code)', fontWeight: 500, color: '#fff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={`/api/admin/avatar?username=${user.user}`} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', objectFit: 'cover' }} />
                                    {user.user}
                                  </div>
                                </td>
                                <td style={{ padding: '20px 24px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: 500 }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {user.executor || "Unknown"}
                                  </div>
                                </td>
                                <td style={{ padding: '20px 24px' }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', color: '#27c93f', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                                    <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }}></div>
                                    ONLINE
                                  </div>
                                </td>
                                <td style={{ padding: '20px 24px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                                  {new Date(user.timestamp).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: WHITELIST */}
            {activeTab === "whitelist" && (
              <motion.div
                key="whitelist"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="dashboard-whitelist-grid"
              >

                {/* Add User Form */}
                <div className="hero-terminal-wrapper-mono" style={{ margin: 0, maxWidth: 'none' }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">grant_access.exe</div>
                      <div style={{ flex: 1 }}></div>
                    </div>
                    <div style={{ padding: '30px' }}>
                      <form onSubmit={handleAddWhitelist} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                          <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 600 }}>Roblox Username</label>
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="e.g. user123"
                            style={{
                              width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '12px', padding: '14px 16px', color: '#fff', fontFamily: 'var(--font-fira-code)',
                              outline: 'none', fontSize: '14px', transition: 'all 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!newUsername.trim()}
                          className="terminal-copy-btn-mono"
                          style={{ width: '100%', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '14px', borderRadius: '12px', opacity: !newUsername.trim() ? 0.5 : 1 }}
                        >
                          <UserPlus size={18} /> ADD TO WHITELIST
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                {/* Whitelist Table */}
                <div className="hero-terminal-wrapper-mono" style={{ margin: 0, maxWidth: 'none' }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px', height: '600px', display: 'flex', flexDirection: 'column' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">authorized_users.db</div>
                      <div style={{ flex: 1 }}></div>
                    </div>

                    {/* Search Bar */}
                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search whitelist..."
                          style={{
                            width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px', padding: '12px 16px 12px 44px', color: '#fff', outline: 'none', fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '350px' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(10,10,10,0.95)', zIndex: 10 }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '16px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Identifier</th>
                            <th style={{ padding: '16px 24px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {whitelist.length === 0 ? (
                            <tr>
                              <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                DATABASE EMPTY
                              </td>
                            </tr>
                          ) : filteredWhitelist.length === 0 ? (
                            <tr>
                              <td colSpan={2} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                NO MATCHES FOUND
                              </td>
                            </tr>
                          ) : (
                            filteredWhitelist.map((user, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '16px 24px', fontFamily: 'var(--font-fira-code)', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{user}</td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleRemoveWhitelist(user)}
                                    style={{
                                      color: 'rgba(255,95,86,0.7)', background: 'transparent', border: 'none', cursor: 'pointer',
                                      padding: '8px', borderRadius: '8px', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#ff5f56'; e.currentTarget.style.backgroundColor = 'rgba(255,95,86,0.1)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,95,86,0.7)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    title="Revoke Access"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
