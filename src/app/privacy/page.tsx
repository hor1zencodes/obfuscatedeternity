"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Cpu, 
  Clock, 
  Trash2, 
  UserX, 
  Terminal, 
  Copy, 
  Check, 
  Zap, 
  Database, 
  Server, 
  EyeOff, 
  Radio, 
  Layers, 
  ArrowRight,
  Sparkles,
  MessageSquare,
  ExternalLink,
  Globe
} from "lucide-react";
import { ThreeJsBackground } from "@/components/ThreeJsBackground";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { AmbientSound } from "@/components/AmbientSound";
import { LiquidMetalButton } from "@/components/ui/LiquidMetalButton";
import { TrueFocus } from "@/components/TrueFocus";

const DEV_DISCORD_TAG = "hor1zxn.";

export default function PrivacyPolicyPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const lastUpdated = "October 2026";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyTag = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(DEV_DISCORD_TAG);
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2200);
    }
  };

  return (
    <div className="eb-clean-wrapper" style={{ position: "relative", minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", overflowX: "hidden" }}>
      {/* 1. Dynamic 3D Particle & Starfield Background */}
      <ThreeJsBackground />

      {/* 2. Pure Monochrome Ambient Glow */}
      <div 
        className="eb-ambient-glow" 
        aria-hidden="true" 
        style={{
          position: "fixed",
          top: "15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "550px",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.045) 0%, transparent 70%)",
          filter: "blur(110px)",
          pointerEvents: "none",
          zIndex: 0
        }} 
      />

      {/* 3. Official Floating Glass Navbar */}
      <header>
        <nav className={`saas-navbar ${isScrolled ? "scrolled" : ""}`}>
          <div className="nav-content">
            <div className="nav-logo">
              <Link href="/" id="btn-nav-logo" aria-label="Eternity Home">
                <img src="/eternity.png" alt="Eternity" />
              </Link>
            </div>

            <div className="nav-links">
              <div className="nav-page-links">
                <Link href="/" id="btn-nav-home">
                  <RandomLetterSwap
                    label="Home"
                    staggerDuration={0.025}
                    transition={{ duration: 0.6, type: "spring" }}
                  />
                </Link>
                <Link href="/#features" id="btn-nav-features">
                  <RandomLetterSwap
                    label="Features"
                    staggerDuration={0.025}
                    transition={{ duration: 0.6, type: "spring" }}
                  />
                </Link>
                <Link href="/#pricing" id="btn-nav-pricing">
                  <RandomLetterSwap
                    label="Pricing"
                    staggerDuration={0.025}
                    transition={{ duration: 0.6, type: "spring" }}
                  />
                </Link>
                <Link
                  href="/privacy"
                  id="btn-nav-privacy-active"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span style={{ color: "#ffffff", fontWeight: 600 }}>Privacy</span>
                  <span className="eb-nav-badge" style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    padding: "1px 6px",
                    borderRadius: "999px",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#ffffff",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    textTransform: "uppercase"
                  }}>Policy</span>
                </Link>
              </div>

              <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <AmbientSound />
                <button
                  type="button"
                  onClick={handleCopyTag}
                  id="btn-nav-discord-dm"
                  aria-label="DM Lead Developer on Discord"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer"
                  }}
                >
                  <LiquidMetalButton label={copiedTag ? "Tag Copied!" : "DM Dev"} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 4. Main Hero & Transparency Content */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: "1120px", margin: "0 auto", padding: "140px 24px 60px 24px" }}>
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          style={{ textAlign: "center", marginBottom: "48px", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Cinematic TrueFocus Title */}
          <div className="hero-title-wrapper" style={{ margin: "0 0 16px 0", justifyContent: "center" }}>
            <TrueFocus
              sentence="Straightforward Privacy Policy"
              manualMode={false}
              blurAmount={4}
              borderColor="#ffffff"
              glowColor="rgba(255, 255, 255, 0.7)"
              animationDuration={0.65}
              pauseBetweenAnimations={1.6}
              wordClassName={(index) => index === 1 ? "hero-word-accent" : ""}
            />
          </div>

          <p style={{
            fontSize: "clamp(14.5px, 1.8vw, 16.5px)",
            color: "rgba(255, 255, 255, 0.68)",
            maxWidth: "720px",
            lineHeight: 1.65,
            margin: "0",
            fontFamily: "var(--font-montserrat)"
          }}>
            No corporate legal jargon. No deceptive tracking. Exactly what Eternity processes to run the script, what is never touched, and how your data remains safe.
          </p>
        </motion.div>

        {/* 5. The 3 Sleek Overview Cards (Hero Glass Vibe) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "46px"
        }}>
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 26, 0.75) 0%, rgba(10, 10, 14, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)"
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <UserX size={22} color="#ffffff" />
              </div>
              <span style={{
                fontFamily: "var(--font-fira-code)",
                fontSize: "11px",
                color: "#ffffff",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.18)"
              }}>
                [NO_IP_LOGS]
              </span>
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Zero IP Address Logging
            </h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.62)", lineHeight: 1.6, margin: 0 }}>
              Neither our Cloudflare Worker nor our Supabase database stores your IP address. Requests are validated at the edge in volatile memory and instantly discarded. Location metrics for our 3D globe use only detached, anonymous coordinate pins.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 26, 0.75) 0%, rgba(10, 10, 14, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)"
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Clock size={22} color="#10b981" />
              </div>
              <span style={{
                fontFamily: "var(--font-fira-code)",
                fontSize: "11px",
                color: "#10b981",
                background: "rgba(16, 185, 129, 0.08)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(16, 185, 129, 0.25)"
              }}>
                [24H_AUTO_PURGE]
              </span>
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Automatic 24-Hour Expiration
            </h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.62)", lineHeight: 1.6, margin: 0 }}>
              Generated keys and temporary session checkpoints expire automatically. After 24 hours, expired records are permanently deleted by automated database triggers.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 26, 0.75) 0%, rgba(10, 10, 14, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: "15%",
              right: "15%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent)"
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <ShieldCheck size={22} color="#ffffff" />
              </div>
              <span style={{
                fontFamily: "var(--font-fira-code)",
                fontSize: "11px",
                color: "#ffffff",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "3px 8px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.18)"
              }}>
                [MEMORY_SANDBOX]
              </span>
            </div>

            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Strict Client Isolation
            </h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.62)", lineHeight: 1.6, margin: 0 }}>
              The script executes purely inside Roblox memory. It never touches your local filesystem, never reads other applications, and never performs hardware fingerprinting.
            </p>
          </motion.div>
        </div>

        {/* 6. Straight to the Point: What We Do vs What We NEVER Do */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "24px",
          marginBottom: "46px"
        }}>
          {/* Box 1: What We Ingest (Straight to the point) */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 24, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "30px 26px",
            overflow: "hidden"
          }}>
            {/* Terminal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SPEC // OPERATIONAL_DATA_PROCESSED
              </span>
            </div>

            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px 0" }}>
              1. What We Actually Collect & Process
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, margin: "0 0 18px 0" }}>
              Only strictly necessary operational data required to deliver script features and authenticate your session:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <KeyRound size={17} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>Roblox Username</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    Sent to verify if your account is whitelisted for premium perks and to render custom overhead GIF tags in-game.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Clock size={17} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>24-Hour Temporary Key Token</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    Generated during the 2-step checkpoint. Holds an HMAC-signed expiration timestamp that permits 24h uninterrupted script access.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Cpu size={17} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>Executor Signature (User-Agent)</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    Passed by your executor (Delta, Wave, Codex, etc.) so our Cloudflare Worker can return compatible bytecode.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Radio size={17} color="#10b981" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>Live Presence Heartbeat</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    An ephemeral ping containing username and timestamp to update the live online users counter on our website dashboard.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Globe size={17} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>Anonymous 3D Globe Telemetry</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    Cloudflare edge headers supply approximate coordinates (<code style={{ color: "#10b981", fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>cf.latitude</code>, <code style={{ color: "#10b981", fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>cf.longitude</code>, <code style={{ color: "#10b981", fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>cf.country</code>) which are stored under an anonymous randomized key (<code style={{ color: "rgba(255,255,255,0.85)", fontSize: "11px", background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>eternity:geo:anon_&lt;timestamp&gt;_&lt;random&gt;</code>) completely detached from your username, Roblox account, or IP address.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: What We Explicitly NEVER Do (Strict Guarantee) */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 24, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "20px",
            padding: "30px 26px",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SPEC // ABSOLUTE_ZERO_COLLECTION
              </span>
            </div>

            <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px 0" }}>
              2. What We Explicitly NEVER Touch
            </h2>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, margin: "0 0 18px 0" }}>
              We believe in complete transparency. Eternity has zero tolerance for invasive behavior:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Lock size={17} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>No Account Passwords or .ROBLOSECURITY</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    We never read, touch, or transmit your authentication cookies, passwords, or personal account credentials.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <UserX size={17} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>No Database IP Logging</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    Your IP address is never stored alongside your username or key tokens in our database.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <EyeOff size={17} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>No Hardware ID (HWID) or MAC Fingerprinting</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    We do not harvest motherboard serials, MAC addresses, or disk GUIDs. Your hardware remains untracked.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <XCircle size={17} color="#ef4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#ffffff", fontSize: "13.5px" }}>No Local Filesystem or Process Scraping</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                    The script cannot and does not inspect external programs, browser histories, or files on your computer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Infrastructure Architecture Stack */}
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, rgba(16, 17, 24, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "30px 28px",
          marginBottom: "46px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
            <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
              SPEC // INFRASTRUCTURE_&_SECURITY_HARDENING
            </span>
          </div>

          <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px 0" }}>
            3. Where Data is Processed
          </h2>
          <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.6, margin: "0 0 20px 0" }}>
            Eternity utilizes industry-standard edge infrastructure to isolate traffic and prevent data leaks:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Server size={16} color="#ffffff" />
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff", fontSize: "12.5px", fontWeight: 700 }}>CLOUDFLARE EDGE GATEWAY</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                Serves as primary entrypoint (`zeternity.online`). Validates executor traffic in volatile memory, supplies detached anonymous globe pins (<code style={{ color: "#10b981", fontSize: "11px" }}>cf.latitude/lon</code>), and never logs IP addresses.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Zap size={16} color="#ffffff" />
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff", fontSize: "12.5px", fontWeight: 700 }}>VERCEL SERVERLESS</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                Hosts our web application and checkpoint validator with global edge distribution and zero server maintenance.
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <Database size={16} color="#10b981" />
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#10b981", fontSize: "12.5px", fontWeight: 700 }}>SUPABASE (RLS-LOCKED)</span>
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>
                Encrypted PostgreSQL storage. Row Level Security strictly enforces read-only access for whitelist and rejects unauthorized writes.
              </p>
            </div>
          </div>
        </div>

        {/* 8. Architecture & Code-Level Privacy Verification */}
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, rgba(16, 17, 24, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "20px",
          padding: "30px 28px",
          marginBottom: "46px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
            <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
              SPEC // ARCHITECTURAL_CODE_AUDIT
            </span>
          </div>

          <h2 style={{ fontSize: "19px", fontWeight: 700, color: "#ffffff", margin: "0 0 10px 0" }}>
            4. Architecture & Code-Level Privacy Audit
          </h2>
          <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.6, margin: "0 0 22px 0", maxWidth: "800px" }}>
            Real technical proof directly from our codebase, edge serverless functions, and database schemas:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px" }}>
            {/* Audit 1: Cloudflare Worker */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Server size={16} color="#ffffff" />
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>1. Cloudflare Worker Gateway</span>
                </div>
                <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "10.5px", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                  zeternity.online
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>
                  <strong style={{ color: "#ffffff" }}>Zero IP Header Access:</strong> Neither <code style={{ color: "#ef4444", fontSize: "11px" }}>cf-connecting-ip</code> nor <code style={{ color: "#ef4444", fontSize: "11px" }}>x-forwarded-for</code> is ever captured or logged.
                </li>
                <li>
                  <strong style={{ color: "#ffffff" }}>Anonymous 3D Globe Telemetry:</strong> In lines 2389–2393, edge coordinates (<code style={{ color: "#10b981", fontSize: "11px" }}>cf.latitude</code>, <code style={{ color: "#10b981", fontSize: "11px" }}>cf.longitude</code>, <code style={{ color: "#10b981", fontSize: "11px" }}>cf.country</code>) are stored under an anonymous randomized key (<code style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>eternity:geo:anon_*</code>) completely detached from usernames or IPs.
                </li>
              </ul>
            </div>

            {/* Audit 2: Next.js Web App */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Zap size={16} color="#ffffff" />
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>2. Next.js Web App & API Routes</span>
                </div>
                <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "10.5px", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                  obfuscatedeternity
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>
                  In <code style={{ color: "#10b981", fontSize: "11px" }}>/api/authenticate/route.ts</code>, only edge city/country coordinates (<code style={{ color: "#10b981", fontSize: "11px" }}>x-vercel-ip-country</code>, <code style={{ color: "#10b981", fontSize: "11px" }}>x-vercel-ip-latitude</code>, <code style={{ color: "#10b981", fontSize: "11px" }}>x-vercel-ip-longitude</code>) are read for the globe animation. The client&apos;s IP is never read or stored.
                </li>
                <li>
                  None of the admin routes (<code style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>/api/admin/logs</code>, <code style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>/api/admin/live-users</code>, <code style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>/api/admin/whitelist</code>) reference or persist IP addresses.
                </li>
              </ul>
            </div>

            {/* Audit 3: Supabase Database */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Database size={16} color="#10b981" />
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#10b981" }}>3. Supabase Database Schema</span>
                </div>
                <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "10.5px", color: "#10b981", background: "rgba(16,185,129,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                  PostgreSQL
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>
                  <strong style={{ color: "#ffffff" }}>Zero IP Columns:</strong> The 4 operational tables (<code style={{ color: "#ffffff", fontSize: "11px" }}>whitelist</code>, <code style={{ color: "#ffffff", fontSize: "11px" }}>keys</code>, <code style={{ color: "#ffffff", fontSize: "11px" }}>live_users</code>, <code style={{ color: "#ffffff", fontSize: "11px" }}>stats</code>) contain zero <code style={{ color: "#ef4444", fontSize: "11px" }}>ip</code> or network identifier columns.
                </li>
                <li>
                  <strong style={{ color: "#ffffff" }}>RLS Hardening:</strong> Public anon keys are strictly read-only for whitelist validation, preventing any malicious client schema injection or writes.
                </li>
              </ul>
            </div>

            {/* Audit 4: Lua Script Sandbox */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Terminal size={16} color="#ffffff" />
                  <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>4. Client-Side Lua Sandbox</span>
                </div>
                <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "10.5px", color: "#ffffff", background: "rgba(255,255,255,0.08)", padding: "2px 6px", borderRadius: "4px" }}>
                  eternitymain.lua
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "rgba(255,255,255,0.6)", lineHeight: 1.65, display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>
                  Transmits only Roblox <code style={{ color: "#ffffff", fontSize: "11px" }}>UserId</code>, <code style={{ color: "#ffffff", fontSize: "11px" }}>DisplayName</code>, game <code style={{ color: "#ffffff", fontSize: "11px" }}>PlaceId</code>, <code style={{ color: "#ffffff", fontSize: "11px" }}>JobId</code>, and executor signature directly to Supabase.
                </li>
                <li>
                  <strong style={{ color: "#ffffff" }}>No IP Echo Services:</strong> Zero external IP requests (never calls <code style={{ color: "#ef4444", fontSize: "11px" }}>ipify</code>, <code style={{ color: "#ef4444", fontSize: "11px" }}>checkip</code>, or <code style={{ color: "#ef4444", fontSize: "11px" }}>httpbin</code>). Purely memory-sandboxed within Roblox.
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 9. Direct Developer Contact & Right to Deletion (Hero Style Card) */}
        <div style={{
          position: "relative",
          background: "linear-gradient(180deg, rgba(22, 24, 32, 0.85) 0%, rgba(12, 13, 18, 0.98) 100%)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "22px",
          padding: "36px 30px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.75)"
        }}>
          <div style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent)"
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "#10b981", fontWeight: 700 }}>
              USER RIGHTS // DIRECT DEVELOPER SUPPORT
            </span>
          </div>

          <h2 style={{ fontSize: "21px", fontWeight: 800, color: "#ffffff", margin: "0 0 10px 0" }}>
            Data Deletion & Queries? Contact Directly.
          </h2>

          <p style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.65, margin: "0 0 22px 0", maxWidth: "760px" }}>
            If you want any historical username association removed from our presence counter or have any privacy or script-related inquiries, contact the developer directly. No tickets, no queues.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={handleCopyTag}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "13.5px",
                fontWeight: 700,
                padding: "11px 24px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(255, 255, 255, 0.25)",
                transition: "all 0.2s ease"
              }}
            >
              {copiedTag ? <Check size={16} color="#000000" /> : <Copy size={16} color="#000000" />}
              <span>{copiedTag ? "Discord Username Copied! ✓" : "Copy Discord: @hor1zxn."}</span>
            </button>

            <span style={{
              fontFamily: "var(--font-fira-code)",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.45)"
            }}>
              Direct Message: <strong style={{ color: "#ffffff" }}>@hor1zxn.</strong>
            </span>
          </div>
        </div>
      </main>

      {/* 9. Official Eternity SaaS Footer */}
      <footer className="saas-footer" style={{ marginTop: "40px" }}>
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/" aria-label="Go to top">
              <img src="/eternity.png" alt="Eternity" className="footer-logo" />
            </Link>
            <p>Redefining execution for the modern era. Undetected. Fast. Reliable.</p>
            <div style={{ display: "flex", gap: "20px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/" style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", textDecoration: "none" }}>Home</Link>
              <Link href="/getkey" style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", textDecoration: "none" }}>Get Key</Link>
              <button 
                type="button" 
                onClick={handleCopyTag} 
                style={{ 
                  background: "none", 
                  border: "none", 
                  color: "rgba(255, 255, 255, 0.6)", 
                  fontSize: "13px", 
                  cursor: "pointer", 
                  padding: 0 
                }}
              >
                {copiedTag ? "Copied @hor1zxn.!" : "Discord (@hor1zxn.)"}
              </button>
              <Link href="/privacy" style={{ color: "#ffffff", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Eternity. All rights reserved.</p>
          <div className="status-indicator">
            <div className="status-dot" style={{ backgroundColor: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,0.8)" }} />
            <span>Script Status: <strong style={{ color: "#ffffff" }}>Operational</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
