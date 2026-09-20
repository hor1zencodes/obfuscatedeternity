"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Users, Activity, Shield, UserPlus, Trash2, Database, Search, Cpu, LayoutDashboard, LogOut, RefreshCw, Menu, Clock, Gamepad2, ExternalLink, Copy, Check, KeyRound, Plus, Sparkles, Tag, Film, Edit3, X, Image as ImageIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { ThreeJsBackground } from "@/components/ThreeJsBackground";
import { Globe } from "@/components/Globe";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [liveUsers, setLiveUsers] = useState<{
    user: string;
    timestamp: number;
    isActive: boolean;
    executor?: string;
    gameName?: string | null;
    placeId?: number | string | null;
    jobId?: string;
    isPlaying?: boolean;
  }[]>([]);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "whitelist" | "keys" | "tags">("overview");
  // Overhead Tags state
  const [tags, setTags] = useState<Record<string, {
    customName: string;
    type: 'assetid' | 'image' | 'gif';
    backgroundId?: string;
    imageUrl?: string;
    gifConfig?: { rows: number; cols: number; frames: number; fps: number };
    strokeColor?: string;
    textAnimation?: 'none' | 'shimmer' | 'pulse' | 'glitch';
    titleColor?: string;
    titleColor2?: string;
    updatedAt?: string;
  }>>({});
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTagUser, setEditingTagUser] = useState<string | null>(null);
  const [tagForm, setTagForm] = useState({
    username: "",
    customName: "",
    type: "gif" as "assetid" | "image" | "gif",
    backgroundId: "",
    imageUrl: "",
    rows: 4,
    cols: 4,
    frames: 16,
    fps: 20,
    strokeColor: "#a855f7",
    textAnimation: "none" as "none" | "shimmer" | "pulse" | "glitch",
    titleColor: "#ffffff",
    titleColor2: "#c084fc"
  });
  const [tagSaving, setTagSaving] = useState(false);


  // Keys management state
  const [keys, setKeys] = useState<{
    id: string;
    key: string;
    createdAt: string;
    expiresAt: string;
    usedBy: string | null;
    usedAt: string | null;
    source: string;
    status: string;
  }[]>([]);
  const [keyStats, setKeyStats] = useState({ totalKeys: 0, activeKeys: 0, usedKeys: 0, expiredKeys: 0 });
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keySearchQuery, setKeySearchQuery] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "auth" | "whitelist" | "alerts">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null);

  const [totalExecutions, setTotalExecutions] = useState(6000);
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
    const pollInterval = setInterval(() => {
      fetchData(false);
    }, 15000);
    return () => clearInterval(pollInterval);
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedJobId(id);
      setTimeout(() => setCopiedJobId(null), 2000);
    }
  };

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

      // Fetch keys data
      const resKeys = await fetch("/api/admin/keys");
      if (resKeys.ok) {
        const dataKeys = await resKeys.json();
        if (dataKeys.success) {
          setKeys(dataKeys.keys);
          if (dataKeys.stats) setKeyStats(dataKeys.stats);
        }
      }

      // Fetch overhead tags data
      const resTags = await fetch("/api/admin/tags");
      if (resTags.ok) {
        const dataTags = await resTags.json();
        if (dataTags.success) {
          setTags(dataTags.tags);
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

  const filteredKeys = keys.filter(k =>
    k.key.toLowerCase().includes(keySearchQuery.toLowerCase()) ||
    (k.usedBy && k.usedBy.toLowerCase().includes(keySearchQuery.toLowerCase())) ||
    k.source.toLowerCase().includes(keySearchQuery.toLowerCase())
  );

  const handleGenerateKey = async () => {
    if (isGeneratingKey) return;
    setIsGeneratingKey(true);
    setGeneratedKey(null);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationHours: 24 })
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedKey(data.key);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this key?')) return;
    
    // Optimistic UI update: remove key immediately from the table
    setKeys(prev => prev.filter(k => k.id !== keyId && k.key !== keyId));
    
    try {
      const res = await fetch("/api/admin/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId })
      });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to delete key: " + (data.error || "Server error"));
        fetchData();
      } else {
        fetchData();
      }
    } catch (e: any) {
      alert("Error deleting key: " + (e?.message || "Network error"));
      fetchData();
    }
  };

  const handleOpenNewTag = () => {
    setEditingTagUser(null);
    setTagForm({
      username: "",
      customName: "",
      type: "gif",
      backgroundId: "",
      imageUrl: "",
      rows: 4,
      cols: 4,
      frames: 16,
      fps: 20,
      strokeColor: "#a855f7",
      textAnimation: "none",
      titleColor: "#ffffff",
      titleColor2: "#c084fc"
    });
    setIsTagModalOpen(true);
  };

  const handleEditTag = (user: string, data: any) => {
    setEditingTagUser(user);
    setTagForm({
      username: user,
      customName: data.customName || user,
      type: data.type || "assetid",
      backgroundId: data.backgroundId || "",
      imageUrl: data.imageUrl || "",
      rows: data.gifConfig?.rows || data.rows || 4,
      cols: data.gifConfig?.cols || data.cols || 4,
      frames: data.gifConfig?.frames || data.frames || 16,
      fps: data.gifConfig?.fps || data.fps || 20,
      strokeColor: data.strokeColor || "#a855f7",
      textAnimation: data.textAnimation || "none",
      titleColor: data.titleColor || "#ffffff",
      titleColor2: data.titleColor2 || "#c084fc"
    });
    setIsTagModalOpen(true);
  };

  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagForm.username.trim()) return;
    setTagSaving(true);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: tagForm.username,
          customName: tagForm.customName || tagForm.username,
          type: tagForm.type,
          backgroundId: tagForm.backgroundId,
          imageUrl: tagForm.imageUrl,
          gifConfig: tagForm.type === 'gif' ? {
            rows: Number(tagForm.rows) || 4,
            cols: Number(tagForm.cols) || 4,
            frames: Number(tagForm.frames) || 16,
            fps: Number(tagForm.fps) || 20,
          } : undefined,
          strokeColor: tagForm.strokeColor,
          textAnimation: tagForm.textAnimation || 'none',
          titleColor: tagForm.titleColor || '#ffffff',
          titleColor2: tagForm.titleColor2 || '#c084fc'
        })
      });
      const data = await res.json();
      if (data.success) {
        setTags(data.tags);
        setIsTagModalOpen(false);
        setEditingTagUser(null);
      } else {
        alert(data.error || "Failed to save tag");
      }
    } catch (err) {
      console.error("Failed to save tag:", err);
    } finally {
      setTagSaving(false);
    }
  };

  const handleDeleteTag = async (username: string) => {
    if (!confirm(`Are you sure you want to remove the overhead tag for '${username}'?`)) return;
    try {
      const res = await fetch(`/api/admin/tags?username=${encodeURIComponent(username)}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setTags(data.tags);
      } else {
        alert(data.error || "Failed to delete tag");
      }
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };


  const copyKeyToClipboard = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

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

          <button
            className="dashboard-nav-item"
            onClick={() => { setActiveTab("keys"); setIsSidebarOpen(false); }}
            style={{
              backgroundColor: activeTab === 'keys' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'keys' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'keys' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            }}
          >
            <KeyRound size={20} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Key System</span>
          </button>

          <button
            className="dashboard-nav-item"
            onClick={() => { setActiveTab("tags"); setIsSidebarOpen(false); }}
            style={{
              backgroundColor: activeTab === 'tags' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === 'tags' ? '#fff' : 'rgba(255,255,255,0.5)',
              border: activeTab === 'tags' ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
            }}
          >
            <Sparkles size={20} color={activeTab === 'tags' ? '#a855f7' : 'currentColor'} />
            <span className="dashboard-sidebar-text" style={{ fontSize: '14px', fontWeight: 600 }}>Overhead Tags</span>
            {Object.keys(tags).length > 0 && (
              <span style={{
                marginLeft: 'auto', fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.25)'
              }}>
                {Object.keys(tags).length}
              </span>
            )}
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div style={{ color: '#27c93f', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="pulse-dot-green" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f', display: 'inline-block' }}></span> Active now
                          </div>
                          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontFamily: 'var(--font-fira-code)' }}>
                            {liveUsers.filter(u => u.isPlaying).length} in game
                          </div>
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
                style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {/* Search and Summary Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ position: 'relative', minWidth: '280px', maxWidth: '400px', flex: 1 }}>
                    <Search size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Search user, game, or executor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '13px',
                        fontFamily: 'var(--font-fira-code)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.2)', borderRadius: '8px', fontSize: '12px', color: '#27c93f', fontWeight: 600 }}>
                      <Gamepad2 size={14} />
                      <span>{liveUsers.filter(u => u.isPlaying).length} Playing</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                      <span>{liveUsers.filter(u => !u.isPlaying).length} Idle</span>
                    </div>
                    <button
                      onClick={() => fetchData(false)}
                      disabled={isRefreshing}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        fontFamily: 'var(--font-fira-code)',
                        cursor: 'pointer'
                      }}
                      title="Refresh live activity"
                    >
                      <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                <div className="hero-terminal-wrapper-mono" style={{ width: '100%', maxWidth: 'none', margin: 0 }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">live_user_activity.sys</div>
                      <div style={{ flex: 1 }}></div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'var(--font-fira-code)' }}>
                        Online: {liveUsers.length}
                      </div>
                    </div>
                    <div style={{ overflowX: 'auto', padding: '0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '18px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Identifier</th>
                            <th style={{ padding: '18px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Current Game & Server</th>
                            <th style={{ padding: '18px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Executor</th>
                            <th style={{ padding: '18px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '18px 20px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Last Ping</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const filteredUsers = liveUsers.filter(u => {
                              if (!searchQuery.trim()) return true;
                              const q = searchQuery.toLowerCase();
                              return (
                                u.user.toLowerCase().includes(q) ||
                                (u.gameName && u.gameName.toLowerCase().includes(q)) ||
                                (u.executor && u.executor.toLowerCase().includes(q)) ||
                                (u.placeId && String(u.placeId).includes(q))
                              );
                            });

                            if (filteredUsers.length === 0) {
                              return (
                                <tr>
                                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                    {searchQuery ? "NO MATCHING USERS OR GAMES FOUND" : "NO ACTIVE EXECUTIONS DETECTED"}
                                  </td>
                                </tr>
                              );
                            }

                            return filteredUsers.map((user, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {/* User Identifier */}
                                <td style={{ padding: '18px 20px', fontFamily: 'var(--font-fira-code)', fontWeight: 500, color: '#fff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <img src={`/api/admin/avatar?username=${user.user}`} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', objectFit: 'cover' }} />
                                    <span>{user.user}</span>
                                  </div>
                                </td>

                                {/* Current Game & Server */}
                                <td style={{ padding: '18px 20px' }}>
                                  {user.isPlaying && user.placeId ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Gamepad2 size={16} color="#27c93f" />
                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>
                                          {user.gameName || "In Game"}
                                        </span>
                                        <a
                                          href={`https://www.roblox.com/games/${user.placeId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          title="Open game on Roblox"
                                          style={{ display: 'inline-flex', alignItems: 'center', color: '#60a5fa', transition: 'opacity 0.2s' }}
                                        >
                                          <ExternalLink size={13} />
                                        </a>
                                      </div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-fira-code)' }}>
                                          Place ID: {user.placeId}
                                        </span>
                                        {user.jobId && (
                                          <button
                                            type="button"
                                            onClick={() => copyToClipboard(user.jobId!, `job-${i}`)}
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              backgroundColor: 'rgba(255,255,255,0.06)',
                                              border: '1px solid rgba(255,255,255,0.1)',
                                              borderRadius: '4px',
                                              padding: '2px 6px',
                                              color: copiedJobId === `job-${i}` ? '#27c93f' : 'rgba(255,255,255,0.6)',
                                              fontSize: '10px',
                                              fontFamily: 'var(--font-fira-code)',
                                              cursor: 'pointer'
                                            }}
                                            title="Click to copy server instance JobId"
                                          >
                                            {copiedJobId === `job-${i}` ? <Check size={10} color="#27c93f" /> : <Copy size={10} />}
                                            <span>{copiedJobId === `job-${i}` ? 'Copied' : `Job: ${user.jobId.slice(0, 8)}...`}</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontStyle: 'italic' }}>
                                      <span>• Idle / No Game Data</span>
                                    </div>
                                  )}
                                </td>

                                {/* Executor */}
                                <td style={{ padding: '18px 20px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500 }}>
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {user.executor || "Unknown"}
                                  </div>
                                </td>

                                {/* Status */}
                                <td style={{ padding: '18px 20px' }}>
                                  {user.isPlaying ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(39,201,63,0.1)', border: '1px solid rgba(39,201,63,0.3)', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', color: '#27c93f', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                                      <div className="pulse-dot-green" style={{ width: '6px', height: '6px' }}></div>
                                      IN GAME
                                    </div>
                                  ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: '999px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em' }}>
                                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.4)' }}></div>
                                      ONLINE
                                    </div>
                                  )}
                                </td>

                                {/* Last Ping */}
                                <td style={{ padding: '18px 20px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontFamily: 'var(--font-fira-code)' }}>
                                  {new Date(user.timestamp).toLocaleTimeString()}
                                </td>
                              </tr>
                            ));
                          })()}
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

            {/* TAB 4: KEYS MANAGEMENT */}
            {activeTab === "keys" && (
              <motion.div
                key="keys"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}
              >
                {/* Key Stats */}
                <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                  <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #a78bfa', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <KeyRound size={18} color="#a78bfa" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Total Keys</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#fff' }}>{keyStats.totalKeys}</div>
                  </div>
                  <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #27c93f', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Activity size={18} color="#27c93f" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Active</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#27c93f' }}>{keyStats.activeKeys}</div>
                  </div>
                  <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #ffbd2e', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Users size={18} color="#ffbd2e" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Used</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#ffbd2e' }}>{keyStats.usedKeys}</div>
                  </div>
                  <div className="hero-terminal-mono terminal-grid-bg terminal-card-body" style={{ borderTop: '3px solid #ff5f56', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Clock size={18} color="#ff5f56" />
                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Expired</span>
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-fira-code)', color: '#ff5f56' }}>{keyStats.expiredKeys}</div>
                  </div>
                </div>

                {/* Generate Key Card */}
                <div className="hero-terminal-wrapper-mono" style={{ margin: 0, maxWidth: 'none' }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">generate_key.exe</div>
                      <div style={{ flex: 1 }}></div>
                    </div>
                    <div style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={handleGenerateKey}
                          disabled={isGeneratingKey}
                          className="terminal-copy-btn-mono"
                          style={{
                            justifyContent: 'center',
                            backgroundColor: 'rgba(167, 139, 250, 0.15)',
                            border: '1px solid rgba(167, 139, 250, 0.3)',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            opacity: isGeneratingKey ? 0.6 : 1,
                            color: '#a78bfa',
                          }}
                        >
                          <Plus size={18} /> {isGeneratingKey ? 'Generating...' : 'Generate New Key (24h)'}
                        </button>
                      </div>
                      {generatedKey && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          background: 'rgba(39, 201, 63, 0.08)',
                          border: '1px solid rgba(39, 201, 63, 0.2)',
                          borderRadius: '10px',
                          padding: '14px 18px'
                        }}>
                          <span style={{ fontFamily: 'var(--font-fira-code)', color: '#27c93f', fontSize: '16px', fontWeight: 700, letterSpacing: '1px', flex: 1 }}>
                            {generatedKey}
                          </span>
                          <button
                            onClick={() => copyKeyToClipboard(generatedKey)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedKey === generatedKey ? '#27c93f' : 'rgba(255,255,255,0.5)', padding: '4px' }}
                          >
                            {copiedKey === generatedKey ? <Check size={18} /> : <Copy size={18} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Keys Table */}
                <div className="hero-terminal-wrapper-mono" style={{ margin: 0, maxWidth: 'none' }}>
                  <div className="hero-terminal-mono" style={{ borderRadius: '12px', height: '500px', display: 'flex', flexDirection: 'column' }}>
                    <div className="terminal-header-mono" style={{ padding: '16px 20px', backgroundColor: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="terminal-dots-mono">
                        <div className="dot-mono dot-mono-r"></div>
                        <div className="dot-mono dot-mono-y"></div>
                        <div className="dot-mono dot-mono-g"></div>
                      </div>
                      <div className="terminal-title">keys_database.db</div>
                      <div style={{ flex: 1 }}></div>
                    </div>

                    <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                      <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)' }} />
                        <input
                          type="text"
                          value={keySearchQuery}
                          onChange={(e) => setKeySearchQuery(e.target.value)}
                          placeholder="Search keys..."
                          style={{
                            width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '8px', padding: '12px 16px 12px 44px', color: '#fff', outline: 'none', fontSize: '14px'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'rgba(10,10,10,0.95)', zIndex: 10 }}>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Key</th>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Status</th>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Used By</th>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Source</th>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Expires</th>
                            <th style={{ padding: '14px 18px', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, textAlign: 'right' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredKeys.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                NO KEYS FOUND
                              </td>
                            </tr>
                          ) : (
                            filteredKeys.map((k) => (
                              <tr key={k.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '14px 18px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'var(--font-fira-code)', fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: '13px' }}>{k.key}</span>
                                    <button
                                      onClick={() => copyKeyToClipboard(k.key)}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copiedKey === k.key ? '#27c93f' : 'rgba(255,255,255,0.3)', padding: '2px' }}
                                    >
                                      {copiedKey === k.key ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                  </div>
                                </td>
                                <td style={{ padding: '14px 18px' }}>
                                  <span style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    background: k.status === 'active' ? 'rgba(39, 201, 63, 0.12)' : k.status === 'used' ? 'rgba(255, 189, 46, 0.12)' : 'rgba(255, 95, 86, 0.12)',
                                    color: k.status === 'active' ? '#27c93f' : k.status === 'used' ? '#ffbd2e' : '#ff5f56',
                                    border: `1px solid ${k.status === 'active' ? 'rgba(39, 201, 63, 0.25)' : k.status === 'used' ? 'rgba(255, 189, 46, 0.25)' : 'rgba(255, 95, 86, 0.25)'}`,
                                  }}>
                                    {k.status}
                                  </span>
                                </td>
                                <td style={{ padding: '14px 18px', fontFamily: 'var(--font-fira-code)', color: k.usedBy ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
                                  {k.usedBy || '—'}
                                </td>
                                <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,0.5)', fontSize: '12px', textTransform: 'capitalize' }}>
                                  {k.source}
                                </td>
                                <td style={{ padding: '14px 18px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontFamily: 'var(--font-fira-code)' }}>
                                  {new Date(k.expiresAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                                </td>
                                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                  <button
                                    onClick={() => handleDeleteKey(k.id)}
                                    style={{
                                      color: 'rgba(255,95,86,0.7)', background: 'transparent', border: 'none', cursor: 'pointer',
                                      padding: '8px', borderRadius: '8px', transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => { e.currentTarget.style.color = '#ff5f56'; e.currentTarget.style.backgroundColor = 'rgba(255,95,86,0.1)'; }}
                                    onMouseOut={(e) => { e.currentTarget.style.color = 'rgba(255,95,86,0.7)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    title="Revoke Key"
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
              </motion.div>
            )}

            {activeTab === "tags" && (

              <motion.div
                key="tags"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
              >
                {/* Header Card */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Sparkles size={22} color="#a855f7" /> Overhead Tags & Badges
                    </h2>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                      Assign custom titles, web images, and animated GIFs to players. Served instantly via Cloudflare Edge.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenNewTag}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 18px', borderRadius: '12px',
                      backgroundColor: '#a855f7', color: '#fff',
                      border: 'none', fontWeight: 600, fontSize: '13px',
                      cursor: 'pointer', boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <Plus size={16} /> Add Overhead Tag
                  </button>
                </div>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div className="glass-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Total Custom Tags</div>
                    <div style={{ fontSize: '26px', fontWeight: 700, color: '#fff', marginTop: '6px' }}>{Object.keys(tags).length}</div>
                  </div>
                  <div className="glass-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Film size={14} color="#c084fc" /> Animated GIFs
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 700, color: '#c084fc', marginTop: '6px' }}>
                      {Object.values(tags).filter((t: any) => t.type === 'gif').length}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ImageIcon size={14} color="#38bdf8" /> Web Images
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 700, color: '#38bdf8', marginTop: '6px' }}>
                      {Object.values(tags).filter((t: any) => t.type === 'image').length}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '18px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag size={14} color="#f59e0b" /> Roblox Assets
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 700, color: '#f59e0b', marginTop: '6px' }}>
                      {Object.values(tags).filter((t: any) => t.type === 'assetid').length}
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                  <input
                    type="text"
                    value={tagSearchQuery}
                    onChange={(e) => setTagSearchQuery(e.target.value)}
                    placeholder="Search tags by player username or title..."
                    style={{
                      width: '100%', padding: '12px 16px 12px 46px',
                      borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#fff', fontSize: '14px', outline: 'none'
                    }}
                  />
                </div>

                {/* Tags Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {Object.entries(tags)
                    .filter(([user, data]: any) => {
                      const q = tagSearchQuery.toLowerCase();
                      return user.toLowerCase().includes(q) || (data.customName && data.customName.toLowerCase().includes(q));
                    })
                    .map(([user, data]: any) => {
                      const stroke = data.strokeColor || '#a855f7';
                      return (
                        <div
                          key={user}
                          className="glass-card"
                          style={{
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid rgba(255,255,255,0.08)`
                          }}
                        >
                          {/* Top row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>@{user}</div>
                              <span style={{
                                fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '8px',
                                display: 'inline-block', marginTop: '4px',
                                backgroundColor: data.type === 'gif' ? 'rgba(168, 85, 247, 0.15)' : data.type === 'image' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                color: data.type === 'gif' ? '#c084fc' : data.type === 'image' ? '#38bdf8' : '#fbbf24',
                                border: `1px solid ${data.type === 'gif' ? 'rgba(168, 85, 247, 0.3)' : data.type === 'image' ? 'rgba(56, 189, 248, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                              }}>
                                {data.type === 'gif' ? '✨ GIF Animated' : data.type === 'image' ? '🖼️ Web Image' : '🆔 Asset ID'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleEditTag(user, data)}
                                style={{
                                  padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)',
                                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer'
                                }}
                                title="Edit Tag"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteTag(user)}
                                style={{
                                  padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', cursor: 'pointer'
                                }}
                                title="Delete Tag"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* In-Game Roblox Overhead Card Simulation */}
                          <div style={{
                            background: '#0a0a0a',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            position: 'relative'
                          }}>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                              IN-GAME OVERHEAD PREVIEW
                            </span>
                            
                            {/* The Simulated Billboard Card */}
                            <div style={{
                              width: '180px',
                              height: '76px',
                              backgroundColor: 'rgba(15, 15, 15, 0.88)',
                              borderRadius: '16px',
                              border: `3px solid ${stroke}`,
                              boxShadow: `0 0 16px ${stroke}44`,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              {/* Background Image / Sprite */}
                              {data.imageUrl && (
                                <img
                                  src={data.imageUrl}
                                  alt="tag bg"
                                  style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    opacity: 0.35,
                                    zIndex: 1
                                  }}
                                />
                              )}
                              {/* Title Text */}
                              <div
                                className={
                                  data.textAnimation === 'shimmer' ? 'title-anim-shimmer' :
                                  data.textAnimation === 'pulse' ? 'title-anim-pulse' :
                                  data.textAnimation === 'glitch' ? 'title-anim-glitch' : ''
                                }
                                style={{
                                  display: 'inline-block',
                                  maxWidth: '100%',
                                  fontSize: '13px',
                                  fontWeight: 800,
                                  backgroundImage: data.textAnimation === 'shimmer' ? `linear-gradient(90deg, ${data.titleColor || '#ffffff'} 0%, ${data.titleColor2 || '#c084fc'} 50%, ${data.titleColor || '#ffffff'} 100%)` : undefined,
                                  backgroundSize: data.textAnimation === 'shimmer' ? '200% auto' : undefined,
                                  WebkitBackgroundClip: data.textAnimation === 'shimmer' ? 'text' : undefined,
                                  backgroundClip: data.textAnimation === 'shimmer' ? 'text' : undefined,
                                  WebkitTextFillColor: data.textAnimation === 'shimmer' ? 'transparent' : undefined,
                                  color: data.textAnimation === 'shimmer' ? 'transparent' : (data.titleColor || '#ffffff'),
                                  textShadow: data.textAnimation === 'shimmer' ? undefined : '0 0 8px rgba(0,0,0,0.9), 0 2px 4px #000',
                                  zIndex: 2,
                                  textAlign: 'center',
                                  letterSpacing: '0.5px'
                                }}
                              >
                                {data.customName || 'VIP'}
                              </div>
                              {/* Username Text */}
                              <div style={{
                                fontSize: '11px',
                                fontWeight: 500,
                                color: 'rgba(255,255,255,0.75)',
                                textShadow: '0 1px 3px #000',
                                zIndex: 2,
                                marginTop: '2px'
                              }}>
                                @{user}
                              </div>
                            </div>
                          </div>

                          {/* Info Footer */}
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Title: <strong>{data.customName}</strong></span>
                            {data.type === 'gif' && data.gifConfig && (
                              <span>{data.gifConfig.frames || 16} frames @ {data.gifConfig.fps || 20}fps</span>
                            )}
                            {data.type === 'assetid' && (
                              <span>ID: {data.backgroundId}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* CREATE / EDIT TAG MODAL */}
            {isTagModalOpen && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 100,
                backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
              }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-card"
                  style={{
                    width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto',
                    backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '20px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="#a855f7" /> {editingTagUser ? `Edit Tag for @${editingTagUser}` : "Create New Overhead Tag"}
                    </h3>
                    <button
                      onClick={() => setIsTagModalOpen(false)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTag} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Username */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                        Roblox Username
                      </label>
                      <input
                        type="text"
                        required
                        disabled={!!editingTagUser}
                        value={tagForm.username}
                        onChange={(e) => setTagForm({ ...tagForm, username: e.target.value })}
                        placeholder="e.g. horize1n"
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '10px',
                          backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff', fontSize: '14px', outline: 'none'
                        }}
                      />
                    </div>

                    {/* Display Title */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                        Overhead Title
                      </label>
                      <input
                        type="text"
                        required
                        value={tagForm.customName}
                        onChange={(e) => setTagForm({ ...tagForm, customName: e.target.value })}
                        placeholder="e.g. ZEN | ADMIN or VIP"
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: '10px',
                          backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff', fontSize: '14px', outline: 'none'
                        }}
                      />
                    </div>

                    {/* Tag Type Selector */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                        Tag Type
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {(['gif', 'image', 'assetid'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTagForm({ ...tagForm, type: t })}
                            style={{
                              padding: '10px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: tagForm.type === t ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.04)',
                              color: tagForm.type === t ? '#c084fc' : 'rgba(255,255,255,0.6)',
                              border: tagForm.type === t ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)'
                            }}
                          >
                            {t === 'gif' ? '✨ Animated GIF' : t === 'image' ? '🖼️ Web Image' : '🆔 Asset ID'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* GIF Configuration */}
                    {tagForm.type === 'gif' && (
                      <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.06)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#c084fc', display: 'block', marginBottom: '4px' }}>
                            GIF Spritesheet URL
                          </label>
                          <input
                            type="url"
                            required
                            value={tagForm.imageUrl}
                            onChange={(e) => setTagForm({ ...tagForm, imageUrl: e.target.value })}
                            placeholder="https://i.imgur.com/example_sprite.png"
                            style={{
                              width: '100%', padding: '10px 12px', borderRadius: '8px',
                              backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(168, 85, 247, 0.3)',
                              color: '#fff', fontSize: '13px', outline: 'none'
                            }}
                          />
                          <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
                            Tip: Convert your GIF at <a href="https://ezgif.com/gif-to-sprite" target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'underline' }}>ezgif.com/gif-to-sprite</a> into a PNG spritesheet grid, upload the PNG (Imgur/ImgBB/Discord), and paste the link here.
                          </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Cols</span>
                            <input
                              type="number"
                              min="1"
                              max="16"
                              value={tagForm.cols}
                              onChange={(e) => setTagForm({ ...tagForm, cols: parseInt(e.target.value) || 4 })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Rows</span>
                            <input
                              type="number"
                              min="1"
                              max="16"
                              value={tagForm.rows}
                              onChange={(e) => setTagForm({ ...tagForm, rows: parseInt(e.target.value) || 4 })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Frames</span>
                            <input
                              type="number"
                              min="1"
                              max="256"
                              value={tagForm.frames}
                              onChange={(e) => setTagForm({ ...tagForm, frames: parseInt(e.target.value) || 16 })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>FPS</span>
                            <input
                              type="number"
                              min="5"
                              max="60"
                              value={tagForm.fps}
                              onChange={(e) => setTagForm({ ...tagForm, fps: parseInt(e.target.value) || 20 })}
                              style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Web Image URL */}
                    {tagForm.type === 'image' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', display: 'block', marginBottom: '6px' }}>
                          Direct Image URL (PNG, JPG, WebP)
                        </label>
                        <input
                          type="url"
                          required
                          value={tagForm.imageUrl}
                          onChange={(e) => setTagForm({ ...tagForm, imageUrl: e.target.value })}
                          placeholder="https://i.imgur.com/example.png"
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(56, 189, 248, 0.3)',
                            color: '#fff', fontSize: '14px', outline: 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Roblox Asset ID */}
                    {tagForm.type === 'assetid' && (
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', display: 'block', marginBottom: '6px' }}>
                          Roblox Asset / Decal ID
                        </label>
                        <input
                          type="text"
                          required
                          value={tagForm.backgroundId}
                          onChange={(e) => setTagForm({ ...tagForm, backgroundId: e.target.value })}
                          placeholder="e.g. 94569112529077"
                          style={{
                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                            backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#fff', fontSize: '14px', outline: 'none'
                          }}
                        />
                      </div>
                    )}

                    {/* Border & Glow Color */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                        Accent & Glow Color
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {['#a855f7', '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#ec4899', '#06b6d4'].map((col) => (
                          <div
                            key={col}
                            onClick={() => setTagForm({ ...tagForm, strokeColor: col })}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: col, cursor: 'pointer',
                              border: tagForm.strokeColor === col ? '2px solid #fff' : '2px solid transparent',
                              boxShadow: tagForm.strokeColor === col ? `0 0 10px ${col}` : 'none'
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={tagForm.strokeColor}
                          onChange={(e) => setTagForm({ ...tagForm, strokeColor: e.target.value })}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                        />
                      </div>
                    </div>

                    {/* Title Text Animation */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '8px' }}>
                        Title Text Animation
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                        {[
                          { id: 'none', label: 'None (Static)' },
                          { id: 'shimmer', label: '✨ Shimmer' },
                          { id: 'pulse', label: '⚡ Pulse' },
                          { id: 'glitch', label: '👾 Glitch' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTagForm({ ...tagForm, textAnimation: item.id as any })}
                            style={{
                              padding: '8px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 600,
                              cursor: 'pointer', transition: 'all 0.2s',
                              backgroundColor: tagForm.textAnimation === item.id ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.04)',
                              color: tagForm.textAnimation === item.id ? '#c084fc' : 'rgba(255,255,255,0.6)',
                              border: tagForm.textAnimation === item.id ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)'
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title Base Color */}
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                        Title Base Color {tagForm.textAnimation === 'shimmer' && '(Gradient Start & End)'}
                      </label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {['#ffffff', '#f59e0b', '#c084fc', '#38bdf8', '#22c55e', '#ef4444', '#ec4899'].map((col) => (
                          <div
                            key={col}
                            onClick={() => setTagForm({ ...tagForm, titleColor: col })}
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: col, cursor: 'pointer',
                              border: tagForm.titleColor === col ? '2px solid #fff' : '2px solid transparent',
                              boxShadow: tagForm.titleColor === col ? `0 0 10px ${col}` : 'none'
                            }}
                          />
                        ))}
                        <input
                          type="color"
                          value={tagForm.titleColor || '#ffffff'}
                          onChange={(e) => setTagForm({ ...tagForm, titleColor: e.target.value })}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                        />
                      </div>
                    </div>

                    {/* Secondary / Shimmer Beam Color */}
                    {tagForm.textAnimation !== 'none' && (
                      <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#c084fc', display: 'block', marginBottom: '6px' }}>
                          {tagForm.textAnimation === 'shimmer' ? '✨ Shimmer Beam Color (Gradient Center)' :
                           tagForm.textAnimation === 'pulse' ? '⚡ Pulse Glow Target Color' :
                           '👾 Glitch Accent Flash Color'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {['#ffffff', '#eab308', '#06b6d4', '#ec4899', '#a855f7', '#84cc16', '#f97316'].map((col) => (
                            <div
                              key={col}
                              onClick={() => setTagForm({ ...tagForm, titleColor2: col })}
                              style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                backgroundColor: col, cursor: 'pointer',
                                border: tagForm.titleColor2 === col ? '2px solid #fff' : '2px solid transparent',
                                boxShadow: tagForm.titleColor2 === col ? `0 0 10px ${col}` : 'none'
                              }}
                            />
                          ))}
                          <input
                            type="color"
                            value={tagForm.titleColor2 || '#c084fc'}
                            onChange={(e) => setTagForm({ ...tagForm, titleColor2: e.target.value })}
                            style={{ width: '32px', height: '32px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: 'transparent' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Live Preview Box in Modal */}
                    <div style={{
                      backgroundColor: '#0a0a0a', borderRadius: '12px', padding: '16px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      border: '1px dashed rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>
                        LIVE IN-GAME PREVIEW
                      </span>
                      <div style={{
                        width: '180px', height: '76px',
                        backgroundColor: 'rgba(15, 15, 15, 0.88)',
                        borderRadius: '16px',
                        border: `3px solid ${tagForm.strokeColor || '#a855f7'}`,
                        boxShadow: `0 0 16px ${tagForm.strokeColor || '#a855f7'}44`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        position: 'relative', overflow: 'hidden'
                      }}>
                        {tagForm.imageUrl && (
                          <img
                            src={tagForm.imageUrl}
                            alt="preview"
                            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, zIndex: 1 }}
                          />
                        )}
                        <div
                          className={
                            tagForm.textAnimation === 'shimmer' ? 'title-anim-shimmer' :
                            tagForm.textAnimation === 'pulse' ? 'title-anim-pulse' :
                            tagForm.textAnimation === 'glitch' ? 'title-anim-glitch' : ''
                          }
                          style={{
                            display: 'inline-block',
                            maxWidth: '100%',
                            fontSize: '13px',
                            fontWeight: 800,
                            backgroundImage: tagForm.textAnimation === 'shimmer' ? `linear-gradient(90deg, ${tagForm.titleColor || '#ffffff'} 0%, ${tagForm.titleColor2 || '#c084fc'} 50%, ${tagForm.titleColor || '#ffffff'} 100%)` : undefined,
                            backgroundSize: tagForm.textAnimation === 'shimmer' ? '200% auto' : undefined,
                            WebkitBackgroundClip: tagForm.textAnimation === 'shimmer' ? 'text' : undefined,
                            backgroundClip: tagForm.textAnimation === 'shimmer' ? 'text' : undefined,
                            WebkitTextFillColor: tagForm.textAnimation === 'shimmer' ? 'transparent' : undefined,
                            color: tagForm.textAnimation === 'shimmer' ? 'transparent' : (tagForm.titleColor || '#fff'),
                            textShadow: tagForm.textAnimation === 'shimmer' ? undefined : '0 0 8px rgba(0,0,0,0.9), 0 2px 4px #000',
                            zIndex: 2,
                            letterSpacing: '0.5px'
                          }}
                        >
                          {tagForm.customName || 'TITLE'}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.75)', textShadow: '0 1px 3px #000', zIndex: 2, marginTop: '2px' }}>
                          @{tagForm.username || 'username'}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setIsTagModalOpen(false)}
                        style={{
                          padding: '10px 16px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff', fontSize: '13px', cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={tagSaving}
                        style={{
                          padding: '10px 20px', borderRadius: '10px',
                          backgroundColor: '#a855f7', color: '#fff',
                          border: 'none', fontWeight: 600, fontSize: '13px',
                          cursor: 'pointer', opacity: tagSaving ? 0.6 : 1
                        }}
                      >
                        {tagSaving ? "Saving..." : editingTagUser ? "Update Tag" : "Create Tag"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
