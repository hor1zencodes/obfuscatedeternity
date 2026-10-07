"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  Lock, 
  Globe2, 
  Server, 
  Trash2, 
  UserX, 
  ExternalLink, 
  CheckCircle2,
  FileText,
  AlertCircle,
  Radio,
  KeyRound,
  Cpu
} from "lucide-react";
import { ThreeJsBackground } from "@/components/ThreeJsBackground";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { AmbientSound } from "@/components/AmbientSound";
import { LiquidMetalButton } from "@/components/ui/LiquidMetalButton";

const DISCORD_INVITE_URL = "https://discord.gg/4c9N49jtXq";

export default function PrivacyPolicyPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const lastUpdated = "October 2026";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="eb-clean-wrapper" style={{ position: "relative", minHeight: "100vh", backgroundColor: "#000000", color: "#ffffff", overflowX: "hidden" }}>
      {/* 1. Dynamic 3D Starfield Background (Monochrome Stars) */}
      <ThreeJsBackground />

      {/* 2. Pure Monochrome Ambient Glow */}
      <div className="eb-ambient-glow" aria-hidden="true" style={{
        position: "fixed",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "500px",
        background: "radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)",
        filter: "blur(90px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

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
                  <span style={{ color: "#fff", fontWeight: 600 }}>Privacy</span>
                  <span className="eb-nav-badge">Legal</span>
                </Link>
              </div>

              <div className="nav-actions">
                <AmbientSound />
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-nav-discord"
                  aria-label="Join Discord Server"
                  style={{ textDecoration: "none" }}
                >
                  <LiquidMetalButton label="Discord" />
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 4. Main Content Area */}
      <main style={{ position: "relative", zIndex: 1, maxWidth: "1080px", margin: "0 auto", padding: "140px 24px 60px 24px" }}>
        
        {/* Header Hero Area */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.3 }}
          style={{ textAlign: "center", marginBottom: "50px", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {/* Monochrome Cyber Status Badge */}
          <div className="hero-badge-mono" style={{ 
            marginBottom: "20px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.18)"
          }}>
            <div style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "#ffffff",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.9)"
            }} />
            <span style={{ fontFamily: "var(--font-fira-code)", letterSpacing: "1px", color: "#ffffff" }}>
              ETERNITY PROTOCOL // TRANSPARENCY & DATA PRIVACY
            </span>
          </div>

          {/* Cinematic Monochrome Title */}
          <h1 className="hero-title-wrapper" style={{ margin: "0 0 16px 0", justifyContent: "center" }}>
            <span 
              className="hero-word" 
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(38px, 6vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                background: "linear-gradient(180deg, #ffffff 10%, #888888 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Privacy
            </span>
            <span 
              className="hero-word" 
              style={{
                fontFamily: "var(--font-poppins)",
                fontSize: "clamp(38px, 6vw, 64px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#ffffff"
              }}
            >
              Policy
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(14px, 1.8vw, 16px)",
            color: "rgba(255, 255, 255, 0.6)",
            maxWidth: "680px",
            lineHeight: 1.65,
            margin: "0 0 12px 0",
            fontFamily: "var(--font-montserrat)"
          }}>
            Zero invasive tracking. Transparent edge telemetry. Clear data retention rules built directly into the Eternity ecosystem.
          </p>

          <span style={{
            fontSize: "12px",
            fontFamily: "var(--font-fira-code)",
            color: "rgba(255, 255, 255, 0.35)",
            letterSpacing: "0.5px"
          }}>
            REVISION: {lastUpdated} • APPLIES TO ZETERNITY.ONLINE & WEB APP
          </span>
        </motion.div>

        {/* 5. The 3 Cyber Cards (Pure Black & White / Silver Glass) */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "20px",
          marginBottom: "50px"
        }}>
          {/* Card 1: Zero IP Logging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 24, 0.75) 0%, rgba(10, 10, 12, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Top Monochrome Shine */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)"
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

            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Zero Raw IP Storage
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, margin: 0 }}>
              Neither our Cloudflare Worker nor the web database stores client IP addresses. Network requests are processed at the edge without saving raw IPs.
            </p>
          </motion.div>

          {/* Card 2: Coarse Edge Geo-Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 24, 0.75) 0%, rgba(10, 10, 12, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Top Monochrome Shine */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)"
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
                <Globe2 size={22} color="#ffffff" />
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
                [EDGE_GEO_MATRIX]
              </span>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Coarse Edge GeoIP
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, margin: 0 }}>
              Approximate city/country coordinates derived from edge CDN routing feed the 3D Global Geo-Matrix map. No device GPS is accessed.
            </p>
          </motion.div>

          {/* Card 3: 24h Auto Expiration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: "relative",
              background: "linear-gradient(180deg, rgba(20, 20, 24, 0.75) 0%, rgba(10, 10, 12, 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px 24px",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            {/* Top Monochrome Shine */}
            <div style={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: "1px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)"
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
                <Trash2 size={22} color="#ffffff" />
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
                [24H_AUTO_PURGE]
              </span>
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              Automatic Key Expiry
            </h3>
            <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, margin: 0 }}>
              Generated checkpoint tokens, HMAC nonces, and session logs automatically expire and are purged from database records every 24 hours.
            </p>
          </motion.div>
        </div>

        {/* 6. Policy Specification Sections (Monochrome Cyber Specs) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* SPEC 01: Information Ingested */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 22, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "30px 28px",
            overflow: "hidden"
          }}>
            {/* Monochrome Terminal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SEC_SPEC_01 // TELEMETRY_INGESTION
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "0 0 14px 0", letterSpacing: "-0.01em" }}>
              1. Information We Collect
            </h2>

            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7, margin: "0 0 14px 0" }}>
              When your executor or browser communicates with Eternity services (`zeternity.online` or `zeneternity.vercel.app`), only strictly required operational telemetry is processed:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <KeyRound size={16} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#fff", fontSize: "13.5px" }}>Roblox Username & Session Handle:</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}>
                    Passed by the script during key verification and whitelist entitlement checks.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Cpu size={16} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#fff", fontSize: "13.5px" }}>Executor Runtime Signature:</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}>
                    User-agent headers identifying your executor (Wave, Solara, Codex, etc.) to ensure compatible bytecode delivery.
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: "rgba(255,255,255,0.03)", padding: "12px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Radio size={16} color="#ffffff" style={{ marginTop: "2px", flexShrink: 0 }} />
                <div>
                  <strong style={{ color: "#fff", fontSize: "13.5px" }}>Approximate Edge Coordinates:</strong>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)" }}>
                    Coarse latitude, longitude, and country attached by Cloudflare/Vercel edge POPs to route telemetry to our global 3D matrix.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SPEC 02: Zero Invasive Logging */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 22, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "30px 28px",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SEC_SPEC_02 // ZERO_INVASIVE_POLICY
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "0 0 14px 0" }}>
              2. What We Explicitly NEVER Collect
            </h2>

            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7, margin: "0 0 16px 0" }}>
              Eternity operates under a strict minimal-data philosophy. We never touch, inspect, or log:
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "12px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                <CheckCircle2 size={16} color="#ffffff" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>No Raw IP Addresses Logged</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                <CheckCircle2 size={16} color="#ffffff" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>No Passwords or .ROBLOSECURITY</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                <CheckCircle2 size={16} color="#ffffff" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>No Hardware MAC or HWIDs</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                <CheckCircle2 size={16} color="#ffffff" />
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>No Local Files or Disk Browsing</span>
              </div>
            </div>
          </div>

          {/* SPEC 03: Global Geo-Matrix */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 22, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "30px 28px",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SEC_SPEC_03 // GLOBAL_GEO_MATRIX
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "0 0 14px 0" }}>
              3. Telemetry & The Global Geo-Matrix
            </h2>

            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.7, margin: "0 0 12px 0" }}>
              Our administration panel features an interactive 3D WebGL globe known as the <strong>GLOBAL GEO-MATRIX</strong>.
            </p>
            <ul style={{ paddingLeft: "20px", margin: 0, display: "flex", flexDirection: "column", gap: "8px", fontSize: "13.5px", color: "rgba(255,255,255,0.7)" }}>
              <li>
                Coordinates represent <strong style={{ color: "#fff" }}>regional ISP edge routing</strong> (approximate metropolitan area or data center hub), not precise physical addresses.
              </li>
              <li>
                This data allows our engineering team to balance Cloudflare worker regions, analyze CDN latency across continents, and forecast compute requirements.
              </li>
              <li>
                Location points are kept strictly for operational telemetry and are never sold or shared with marketing third parties.
              </li>
            </ul>
          </div>

          {/* SPEC 04: Infrastructure & Third-Parties */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(16, 17, 22, 0.8) 0%, rgba(9, 10, 14, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "18px",
            padding: "30px 28px",
            overflow: "hidden"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "18px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.25)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.4)" }} />
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.7)" }} />
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.45)", marginLeft: "10px" }}>
                SEC_SPEC_04 // CLOUD_INFRASTRUCTURE
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "0 0 14px 0" }}>
              4. Cloud Infrastructure & Edge Providers
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginTop: "12px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>CLOUDFLARE</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Acts as the primary reverse proxy and security firewall at `zeternity.online`.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>VERCEL EDGE</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Hosts the Next.js web application and key portal with serverless edge compute.
                </p>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px" }}>
                <span style={{ fontFamily: "var(--font-fira-code)", color: "#ffffff", fontSize: "12px", fontWeight: 700 }}>SUPABASE</span>
                <p style={{ margin: "6px 0 0 0", fontSize: "12.5px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                  Encrypted PostgreSQL storage for whitelist records and 24-hour token verification.
                </p>
              </div>
            </div>
          </div>

          {/* SPEC 05: Data Rights & Discord Contact */}
          <div style={{
            position: "relative",
            background: "linear-gradient(180deg, rgba(22, 22, 28, 0.85) 0%, rgba(12, 12, 16, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "18px",
            padding: "32px 28px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
              <span style={{ fontFamily: "var(--font-fira-code)", fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                SEC_SPEC_05 // USER_RIGHTS_&_CONTACT
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px 0" }}>
              5. Your Rights & Data Deletion
            </h2>

            <p style={{ fontSize: "13.5px", color: "rgba(255, 255, 255, 0.65)", lineHeight: 1.65, margin: "0 0 20px 0", maxWidth: "700px" }}>
              You may request immediate manual deletion of any historical logs or whitelist associations linked to your Roblox username at any time. Simply open a ticket in our official Discord community.
            </p>

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "13px",
                fontWeight: 700,
                padding: "10px 22px",
                borderRadius: "10px",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(255, 255, 255, 0.2)",
                transition: "all 0.2s ease"
              }}
            >
              <span>Join Official Discord Server</span>
              <ExternalLink size={14} color="#000000" />
            </a>
          </div>

        </div>
      </main>

      {/* 7. Official Eternity SaaS Footer */}
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
              <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "13px", textDecoration: "none" }}>Discord</a>
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
