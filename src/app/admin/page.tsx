"use client";

import { useState, useEffect } from "react";
import { Lock, Users, Activity, Shield, UserPlus, Trash2, Database, Search, Cpu, LayoutDashboard, LogOut } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GLSLHills } from "@/components/GLSLHills";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [liveUsers, setLiveUsers] = useState<{user: string, timestamp: number, isActive: boolean}[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "whitelist">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [totalExecutions, setTotalExecutions] = useState(1337);
  const [chartData, setChartData] = useState<{date: string, executions: number}[]>([]);

  useEffect(() => {
    fetchData(true);
  }, []);

  const fetchData = async (initialCheck = false) => {
    try {
      const resLive = await fetch("/api/admin/live-users");
      if (resLive.status === 401) {
        if (!initialCheck) setError("Session expired. Please log in again.");
        setIsAuthenticated(false);
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
        }
      }
    } catch (e) {
      console.error(e);
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

  const filteredWhitelist = whitelist.filter(user => 
    user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="saas-layout flex items-center justify-center min-h-screen p-4">
        <GLSLHills />
        <div className="hero-terminal-wrapper-mono" style={{ maxWidth: '400px', width: '100%' }}>
          <div className="hero-terminal-mono">
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans text-white bg-black">
      <GLSLHills />
      
      {/* Sidebar */}
      <aside className="w-16 md:w-64 bg-black/40 backdrop-blur-md border-r border-white/10 flex flex-col z-20 flex-shrink-0 transition-all duration-300">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/10 shrink-0">
          <Shield className="text-white md:mr-3 shrink-0" size={24} />
          <span className="hidden md:block hero-word-accent font-bold text-xl tracking-wider">ETERNITY</span>
        </div>
        
        <nav className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto">
          <button 
            onClick={() => setActiveTab("overview")}
            className={`flex items-center justify-center md:justify-start gap-3 px-0 md:px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'}`}
            title="Overview"
          >
            <LayoutDashboard size={20} className="shrink-0" />
            <span className="hidden md:block text-sm font-semibold tracking-wide whitespace-nowrap">Overview</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("sessions")}
            className={`flex items-center justify-center md:justify-start gap-3 px-0 md:px-4 py-3 rounded-xl transition-all ${activeTab === 'sessions' ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'}`}
            title="Active Sessions"
          >
            <Activity size={20} className="shrink-0" />
            <span className="hidden md:block text-sm font-semibold tracking-wide whitespace-nowrap">Active Sessions</span>
          </button>

          <button 
            onClick={() => setActiveTab("whitelist")}
            className={`flex items-center justify-center md:justify-start gap-3 px-0 md:px-4 py-3 rounded-xl transition-all ${activeTab === 'whitelist' ? 'bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-white/50 hover:bg-white/5 hover:text-white border border-transparent'}`}
            title="Whitelist Management"
          >
            <Database size={20} className="shrink-0" />
            <span className="hidden md:block text-sm font-semibold tracking-wide whitespace-nowrap">Access Control</span>
          </button>
        </nav>
        
        <div className="p-3 border-t border-white/10 shrink-0">
          <button onClick={() => { setIsAuthenticated(false); }} className="w-full flex items-center justify-center md:justify-start gap-3 px-0 md:px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20" title="Logout">
            <LogOut size={20} className="shrink-0" />
            <span className="hidden md:block text-sm font-semibold whitespace-nowrap">Terminate</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto z-10 relative">
        <header className="h-20 flex items-center justify-between px-6 md:px-10 border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-30 shrink-0">
          <div>
            <h1 className="text-lg md:text-2xl font-bold tracking-wide text-white uppercase">{
              activeTab === 'overview' ? 'Dashboard Overview' : 
              activeTab === 'sessions' ? 'Live Telemetry' : 'Access Management'
            }</h1>
            <p className="text-white/40 text-xs md:text-sm mt-1 tracking-wider hidden sm:block">Eternity Command Center</p>
          </div>
          <button className="terminal-copy-btn-mono" onClick={() => fetchData()}>
            <Activity size={16} /> <span className="hidden sm:inline">REFRESH DATA</span>
          </button>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-10 max-w-[1400px] w-full mx-auto pb-20">
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div className="hero-terminal-mono p-6 border-t-[3px] !border-t-[#27c93f]">
                  <div className="flex items-center gap-3 mb-4">
                    <Users size={22} color="#27c93f" />
                    <span className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-semibold">Live Users</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold font-[var(--font-fira-code)]">{liveUsers.length}</div>
                </div>
                
                <div className="hero-terminal-mono p-6 border-t-[3px] !border-t-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Database size={22} color="#fff" />
                    <span className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-semibold">Whitelisted</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold font-[var(--font-fira-code)]">{whitelist.length}</div>
                </div>

                <div className="hero-terminal-mono p-6 border-t-[3px] !border-t-[#ffbd2e]">
                  <div className="flex items-center gap-3 mb-4">
                    <Cpu size={22} color="#ffbd2e" />
                    <span className="text-white/50 text-xs md:text-sm uppercase tracking-widest font-semibold">Total Executions</span>
                  </div>
                  <div className="text-4xl md:text-5xl font-bold font-[var(--font-fira-code)]">{totalExecutions}</div>
                </div>
              </div>

              {/* Execution Graph */}
              <div className="hero-terminal-wrapper-mono w-full mt-2">
                <div className="hero-terminal-mono">
                  <div className="terminal-header-mono">
                    <div className="terminal-dots-mono">
                      <div className="dot-mono dot-mono-r"></div>
                      <div className="dot-mono dot-mono-y"></div>
                      <div className="dot-mono dot-mono-g"></div>
                    </div>
                    <div className="terminal-title">execution_telemetry.chart</div>
                    <div style={{ flex: 1 }}></div>
                  </div>
                  <div className="p-4 md:p-6 h-[300px] md:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
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
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="hero-terminal-wrapper-mono w-full !mt-0">
                <div className="hero-terminal-mono">
                  <div className="terminal-header-mono">
                    <div className="terminal-dots-mono">
                      <div className="dot-mono dot-mono-r"></div>
                      <div className="dot-mono dot-mono-y"></div>
                      <div className="dot-mono dot-mono-g"></div>
                    </div>
                    <div className="terminal-title">live_executions.sys</div>
                    <div style={{ flex: 1 }}></div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left min-w-[500px]">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                          <th className="p-4 md:p-5 text-xs text-white/50 uppercase tracking-widest font-medium">Identifier</th>
                          <th className="p-4 md:p-5 text-xs text-white/50 uppercase tracking-widest font-medium">Status</th>
                          <th className="p-4 md:p-5 text-xs text-white/50 uppercase tracking-widest font-medium">Last Ping</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveUsers.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="p-10 text-center text-white/30 italic">
                              NO ACTIVE EXECUTIONS DETECTED
                            </td>
                          </tr>
                        ) : (
                          liveUsers.map((user, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 md:p-5 font-[var(--font-fira-code)] font-medium text-white">{user.user}</td>
                              <td className="p-4 md:p-5">
                                <div className="inline-flex items-center gap-2 bg-[#27c93f]/10 border border-[#27c93f]/30 px-3 py-1.5 rounded-full text-xs text-[#27c93f] font-semibold tracking-wider">
                                  <div className="pulse-dot-green w-1.5 h-1.5"></div>
                                  ONLINE
                                </div>
                              </td>
                              <td className="p-4 md:p-5 text-white/50 text-sm">
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
            </div>
          )}

          {activeTab === "whitelist" && (
            <div className="flex flex-col lg:flex-row gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Add User Form */}
              <div className="hero-terminal-wrapper-mono !mt-0 lg:w-[350px] shrink-0">
                <div className="hero-terminal-mono h-full flex flex-col">
                  <div className="terminal-header-mono shrink-0">
                    <div className="terminal-dots-mono">
                      <div className="dot-mono dot-mono-r"></div>
                      <div className="dot-mono dot-mono-y"></div>
                      <div className="dot-mono dot-mono-g"></div>
                    </div>
                    <div className="terminal-title">grant_access.exe</div>
                    <div style={{ flex: 1 }}></div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <form onSubmit={handleAddWhitelist} className="w-full flex flex-col gap-5">
                      <div>
                        <label className="block text-white/50 text-xs uppercase tracking-widest mb-3 font-semibold">Roblox Username</label>
                        <input 
                          type="text" 
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="e.g. user123"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white font-[var(--font-fira-code)] outline-none focus:border-white/30 focus:bg-black/60 transition-all text-sm"
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={!newUsername.trim()}
                        className="terminal-copy-btn-mono w-full justify-center !bg-white/10 hover:!bg-white/20 !py-3.5 !rounded-xl"
                      >
                        <UserPlus size={18} /> ADD TO WHITELIST
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Whitelist Table */}
              <div className="hero-terminal-wrapper-mono !mt-0 flex-1 h-[500px] lg:h-[600px]">
                <div className="hero-terminal-mono h-full flex flex-col">
                  <div className="terminal-header-mono shrink-0">
                    <div className="terminal-dots-mono">
                      <div className="dot-mono dot-mono-r"></div>
                      <div className="dot-mono dot-mono-y"></div>
                      <div className="dot-mono dot-mono-g"></div>
                    </div>
                    <div className="terminal-title">authorized_users.db</div>
                    <div style={{ flex: 1 }}></div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="p-4 border-b border-white/10 shrink-0 bg-black/20">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search whitelist..."
                        className="w-full bg-black/40 border border-white/5 rounded-lg py-2.5 px-4 pl-11 text-white outline-none text-sm focus:border-white/20 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <table className="w-full border-collapse text-left relative">
                      <thead className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md">
                        <tr className="bg-white/[0.02] border-b border-white/10 shadow-sm">
                          <th className="p-4 md:p-5 text-xs text-white/50 uppercase tracking-widest font-medium">Identifier</th>
                          <th className="p-4 md:p-5 text-xs text-white/50 uppercase tracking-widest font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {whitelist.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-10 text-center text-white/30 italic">
                              DATABASE EMPTY
                            </td>
                          </tr>
                        ) : filteredWhitelist.length === 0 ? (
                          <tr>
                            <td colSpan={2} className="p-10 text-center text-white/30 italic">
                              NO MATCHES FOUND
                            </td>
                          </tr>
                        ) : (
                          filteredWhitelist.map((user, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                              <td className="p-4 md:p-5 font-[var(--font-fira-code)] font-medium text-white/90">{user}</td>
                              <td className="p-4 md:p-5 text-right">
                                <button 
                                  onClick={() => handleRemoveWhitelist(user)}
                                  className="text-red-400/70 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-50 group-hover:opacity-100"
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
