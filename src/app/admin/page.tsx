"use client";

import { useState, useEffect } from "react";
import { Lock, Users, Activity, Shield, UserPlus, Trash2, Database, Search, Cpu } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"live" | "whitelist">("live");
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
          // Set chart data (it is already ordered oldest to newest by the API)
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

  // Filter whitelist based on search
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
    <div className="saas-layout min-h-screen flex flex-col items-center py-10 px-4 sm:py-16 sm:px-6">
      <GLSLHills />
      
      {/* Top Navigation / Branding */}
      <div className="w-full max-w-[1000px] flex flex-col sm:flex-row justify-between items-center mb-10 gap-6 sm:gap-0">
        <div className="text-center sm:text-left">
          <h1 className="hero-word-accent" style={{ fontSize: '32px', letterSpacing: '1px' }}>ETERNITY DASHBOARD</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginTop: '5px' }}>Command Center</p>
        </div>
        <button className="terminal-copy-btn-mono" onClick={() => fetchData()}>
          <Activity size={16} /> REFRESH DATA
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ maxWidth: '1000px', width: '100%', display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="hero-terminal-mono" style={{ flex: '1 1 200px', padding: '20px', borderTop: '2px solid #27c93f' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Users size={20} color="#27c93f" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Users</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)' }}>{liveUsers.length}</div>
        </div>
        
        <div className="hero-terminal-mono" style={{ flex: '1 1 200px', padding: '20px', borderTop: '2px solid #fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Database size={20} color="#fff" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Whitelisted</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)' }}>{whitelist.length}</div>
        </div>

        <div className="hero-terminal-mono" style={{ flex: '1 1 200px', padding: '20px', borderTop: '2px solid #ffbd2e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Cpu size={20} color="#ffbd2e" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Executions</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)' }}>{totalExecutions}</div>
        </div>
      </div>

      {/* Execution Graph */}
      <div className="hero-terminal-wrapper-mono" style={{ maxWidth: '1000px', width: '100%', marginTop: '0', marginBottom: '40px' }}>
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
          <div style={{ padding: '20px', height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="none" tick={{ fill: '#a0a0a0', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-fira-code)' }} tickMargin={10} />
                <YAxis stroke="none" tick={false} domain={['dataMin', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontFamily: 'var(--font-fira-code)' }}
                  itemStyle={{ color: '#ffffff' }}
                />
                <Area type="monotone" dataKey="executions" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorExecutions)" activeDot={{ r: 6, fill: '#ffffff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-[1000px] flex flex-wrap gap-2 sm:gap-5 mb-5 border-b border-white/10">
        <button 
          onClick={() => setActiveTab("live")}
          style={{ 
            background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
            color: activeTab === "live" ? '#fff' : 'rgba(255,255,255,0.4)',
            borderBottom: activeTab === "live" ? '2px solid #27c93f' : '2px solid transparent',
            textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Active Sessions
        </button>
        <button 
          onClick={() => setActiveTab("whitelist")}
          style={{ 
            background: 'none', border: 'none', padding: '10px 20px', cursor: 'pointer',
            color: activeTab === "whitelist" ? '#fff' : 'rgba(255,255,255,0.4)',
            borderBottom: activeTab === "whitelist" ? '2px solid #fff' : '2px solid transparent',
            textTransform: 'uppercase', letterSpacing: '1px', fontSize: '13px', fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Access Control
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {activeTab === "live" ? (
          <div className="hero-terminal-wrapper-mono" style={{ width: '100%', marginTop: '0' }}>
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
              <div style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '15px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal' }}>Identifier</th>
                      <th style={{ padding: '15px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal' }}>Status</th>
                      <th style={{ padding: '15px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal' }}>Last Ping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveUsers.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                          NO ACTIVE EXECUTIONS DETECTED
                        </td>
                      </tr>
                    ) : (
                      liveUsers.map((user, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '15px 20px', fontFamily: 'var(--font-fira-code)' }}>{user.user}</td>
                          <td style={{ padding: '15px 20px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(39, 201, 63, 0.1)', border: '1px solid rgba(39, 201, 63, 0.3)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: '#27c93f' }}>
                              <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }}></div>
                              ONLINE
                            </div>
                          </td>
                          <td style={{ padding: '15px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
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
        ) : (
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* Add User */}
            <div className="hero-terminal-wrapper-mono" style={{ flex: '1 1 300px', marginTop: '0' }}>
              <div className="hero-terminal-mono" style={{ height: '100%' }}>
                <div className="terminal-header-mono">
                  <div className="terminal-dots-mono">
                    <div className="dot-mono dot-mono-r"></div>
                    <div className="dot-mono dot-mono-y"></div>
                    <div className="dot-mono dot-mono-g"></div>
                  </div>
                  <div className="terminal-title">grant_access.exe</div>
                  <div style={{ flex: 1 }}></div>
                </div>
                <div className="terminal-body" style={{ flexDirection: 'column', padding: '30px 20px' }}>
                  <form onSubmit={handleAddWhitelist} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Roblox Username</label>
                      <input 
                        type="text" 
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="e.g. user123"
                        style={{
                          width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                          padding: '12px 15px', color: '#fff', fontFamily: 'var(--font-fira-code)', outline: 'none', fontSize: '14px'
                        }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!newUsername.trim()}
                      className="terminal-copy-btn-mono"
                      style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}
                    >
                      <UserPlus size={16} /> ADD TO WHITELIST
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Whitelist Table */}
            <div className="hero-terminal-wrapper-mono" style={{ flex: '2 1 500px', marginTop: '0', height: '500px' }}>
              <div className="hero-terminal-mono" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="terminal-header-mono" style={{ flexShrink: 0 }}>
                  <div className="terminal-dots-mono">
                    <div className="dot-mono dot-mono-r"></div>
                    <div className="dot-mono dot-mono-y"></div>
                    <div className="dot-mono dot-mono-g"></div>
                  </div>
                  <div className="terminal-title">authorized_users.db</div>
                  <div style={{ flex: 1 }}></div>
                </div>
                
                {/* Search Bar */}
                <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', color: 'rgba(255,255,255,0.3)' }} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search whitelist..."
                      style={{
                        width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px',
                        padding: '10px 15px 10px 40px', color: '#fff', outline: 'none', fontSize: '13px'
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: '0', flex: 1, minHeight: 0, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(5px)' }}>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '15px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal' }}>Identifier</th>
                        <th style={{ padding: '15px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'normal', textAlign: 'right' }}>Action</th>
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
                            <td style={{ padding: '15px 20px', fontFamily: 'var(--font-fira-code)' }}>{user}</td>
                            <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                              <button 
                                onClick={() => handleRemoveWhitelist(user)}
                                style={{ background: 'none', border: 'none', color: '#ff5f56', cursor: 'pointer', padding: '5px', opacity: 0.8 }}
                                title="Revoke Access"
                              >
                                <Trash2 size={16} />
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
    </div>
  );
}
