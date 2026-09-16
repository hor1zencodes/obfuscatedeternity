"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Key, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  ExternalLink,
  RefreshCw,
  ArrowRight,
  Lock,
  Unlock,
  CheckCircle2
} from "lucide-react";

const CP1_URL = "https://link-center.net/9423908/Ueld4j1n6FoT";
const CP2_URL = "https://link-hub.net/9423908/7YBkX98OTddQ";
const DISCORD_URL = "https://discord.gg/4c9N49jtXq";

export default function GetKeyPage() {
  // Current checkpoint step: 1 = CP1, 2 = CP2, 3 = Key Unlocked
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [key, setKey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize and detect step from URL query or localStorage
  useEffect(() => {
    setMounted(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      const savedKey = localStorage.getItem("etn_active_key");
      const savedExpiry = localStorage.getItem("etn_key_expiry");
      const savedProgress = localStorage.getItem("etn_cp_progress");
      const progressTime = parseInt(localStorage.getItem("etn_cp_timestamp") || "0", 10);
      const isFresh = Date.now() - progressTime < 2 * 60 * 60 * 1000; // 2 hours validity

      // 1. If user already has an active, non-expired key saved
      if (savedKey && savedExpiry && new Date(savedExpiry) > new Date()) {
        setKey(savedKey);
        setExpiresAt(savedExpiry);
        setCurrentStep(3);
        return;
      }

      // 2. Check query params or referrer
      if (stepParam === "complete" || stepParam === "3") {
        advanceToStep(3);
      } else if (stepParam === "2") {
        advanceToStep(2);
      } else if (savedProgress && isFresh) {
        const stepNum = parseInt(savedProgress, 10);
        if (stepNum === 2) setCurrentStep(2);
        if (stepNum === 3) advanceToStep(3);
      }
    } catch {
      // Fallback
    }
  }, []);

  const advanceToStep = (step: 1 | 2 | 3) => {
    setCurrentStep(step);
    try {
      localStorage.setItem("etn_cp_progress", step.toString());
      localStorage.setItem("etn_cp_timestamp", Date.now().toString());
    } catch {}

    if (step === 3 && !key) {
      generateKey();
    }
  };

  const generateKey = async () => {
    setLoadingKey(true);
    setError(null);
    try {
      const res = await fetch("/api/key/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "linkvertise_2cp" }),
      });
      const data = await res.json();
      if (data.success) {
        setKey(data.key);
        setExpiresAt(data.expiresAt);
        try {
          localStorage.setItem("etn_active_key", data.key);
          localStorage.setItem("etn_key_expiry", data.expiresAt);
        } catch {}
      } else {
        setError(data.error || "Failed to generate key. Please retry.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoadingKey(false);
    }
  };

  const handleStartCP1 = () => {
    try {
      localStorage.setItem("etn_cp_progress", "2");
      localStorage.setItem("etn_cp_timestamp", Date.now().toString());
    } catch {}
    window.location.href = CP1_URL;
  };

  const handleStartCP2 = () => {
    try {
      localStorage.setItem("etn_cp_progress", "3");
      localStorage.setItem("etn_cp_timestamp", Date.now().toString());
    } catch {}
    window.location.href = CP2_URL;
  };

  const handleCopy = () => {
    if (key && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    }
  };

  const formatExpiry = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "24 Hours from now";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% -10%, #18181e 0%, #0b0b0e 55%, #050507 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
        color: "#f5f5f7",
      }}
    >
      {/* Background Ambient Glows (Monochrome) */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "550px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(255, 255, 255, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: "400px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.025) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Grid Pattern Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: "480px",
          background: "linear-gradient(180deg, rgba(18, 18, 22, 0.88) 0%, rgba(10, 10, 14, 0.95) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          padding: "36px 32px 32px 32px",
          boxShadow: "0 35px 80px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.04) inset, 0 1px 25px rgba(255, 255, 255, 0.03)",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Top ambient card shine */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
          }}
        />

        {/* LOGO & BRAND HEADER */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              style={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "50%",
                background: "conic-gradient(from 0deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.65))",
                filter: "blur(6px)",
                opacity: 0.8,
              }}
            />
            <div
              style={{
                position: "relative",
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #18181c 0%, #0c0c10 100%)",
                border: "1.5px solid rgba(255, 255, 255, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.12)",
                overflow: "hidden",
              }}
            >
              <img
                src="/eternity.png"
                alt="Eternity Logo"
                style={{
                  width: "52px",
                  height: "52px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 2px 10px rgba(255, 255, 255, 0.3))",
                }}
              />
            </div>
          </div>

          {/* Title & Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: 900,
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                background: "linear-gradient(180deg, #ffffff 10%, #a1a1aa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              ETERNITY
            </h1>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                padding: "2px 8px",
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#e4e4e7",
                textTransform: "uppercase",
              }}
            >
              KEY SYSTEM
            </span>
          </div>
        </div>

        {/* CHECKPOINT TRACKER (Like absent.wtf) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            marginBottom: "24px",
            padding: "14px 20px",
            background: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "14px",
          }}
        >
          {/* Step 1: CP 1 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: currentStep > 1 
                  ? "#22c55e" 
                  : currentStep === 1 
                  ? "rgba(255, 255, 255, 0.2)" 
                  : "rgba(255, 255, 255, 0.05)",
                border: currentStep === 1 
                  ? "2px solid #ffffff" 
                  : "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: currentStep === 1 ? "0 0 12px rgba(255, 255, 255, 0.5)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {currentStep > 1 ? (
                <Check size={14} color="#000" strokeWidth={3} />
              ) : (
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#fff" }}>1</span>
              )}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color: currentStep === 1 ? "#ffffff" : currentStep > 1 ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
              }}
            >
              CP 1
            </span>
          </div>

          {/* Connector Line 1 */}
          <div
            style={{
              flex: 1,
              height: "2px",
              margin: "0 10px",
              marginBottom: "16px",
              background: currentStep > 1 
                ? "linear-gradient(90deg, #22c55e, rgba(255, 255, 255, 0.5))" 
                : "rgba(255, 255, 255, 0.08)",
              transition: "all 0.4s ease",
            }}
          />

          {/* Step 2: CP 2 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: currentStep > 2 
                  ? "#22c55e" 
                  : currentStep === 2 
                  ? "rgba(255, 255, 255, 0.2)" 
                  : "rgba(255, 255, 255, 0.05)",
                border: currentStep === 2 
                  ? "2px solid #ffffff" 
                  : "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: currentStep === 2 ? "0 0 12px rgba(255, 255, 255, 0.5)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              {currentStep > 2 ? (
                <Check size={14} color="#000" strokeWidth={3} />
              ) : (
                <span style={{ fontSize: "11px", fontWeight: 700, color: currentStep === 2 ? "#fff" : "rgba(255,255,255,0.4)" }}>2</span>
              )}
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color: currentStep === 2 ? "#ffffff" : currentStep > 2 ? "#22c55e" : "rgba(255, 255, 255, 0.3)",
              }}
            >
              CP 2
            </span>
          </div>

          {/* Connector Line 2 */}
          <div
            style={{
              flex: 1,
              height: "2px",
              margin: "0 10px",
              marginBottom: "16px",
              background: currentStep === 3 
                ? "linear-gradient(90deg, #22c55e, #ffffff)" 
                : "rgba(255, 255, 255, 0.08)",
              transition: "all 0.4s ease",
            }}
          />

          {/* Step 3: KEY */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: currentStep === 3 
                  ? "linear-gradient(135deg, #ffffff, #e2e8f0)" 
                  : "rgba(255, 255, 255, 0.05)",
                border: currentStep === 3 
                  ? "2px solid #ffffff" 
                  : "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: currentStep === 3 ? "0 0 16px rgba(255, 255, 255, 0.7)" : "none",
                transition: "all 0.3s ease",
              }}
            >
              <Key size={12} color={currentStep === 3 ? "#000" : "rgba(255,255,255,0.4)"} />
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.8px",
                color: currentStep === 3 ? "#ffffff" : "rgba(255, 255, 255, 0.3)",
              }}
            >
              KEY
            </span>
          </div>
        </div>

        {/* STEP 1: CHECKPOINT 1 CONTENT */}
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, rgba(14, 14, 18, 0.9) 0%, rgba(8, 8, 12, 0.98) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                padding: "24px 20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "100px",
                  padding: "3px 12px",
                  marginBottom: "14px",
                }}
              >
                <Lock size={12} color="#ffffff" />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.5px" }}>
                  CHECKPOINT 1 OF 2
                </span>
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 8px 0", color: "#ffffff" }}>
                Begin Authentication
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: "1.6" }}>
                Complete Checkpoint 1 via Linkvertise to unlock Checkpoint 2. Takes about 30 seconds.
              </p>
            </div>

            {/* CTA: START CP1 */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCP1}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #ffffff 0%, #f4f4f5 70%, #e4e4e7 100%)",
                color: "#09090b",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 10px 35px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0,0,0,0.3)",
                marginBottom: "20px",
              }}
            >
              <span>Proceed to Checkpoint 1</span>
              <ArrowRight size={17} strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 2: CHECKPOINT 2 CONTENT */}
        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            <div
              style={{
                background: "linear-gradient(180deg, rgba(14, 14, 18, 0.9) 0%, rgba(8, 8, 12, 0.98) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "18px",
                padding: "24px 20px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  borderRadius: "100px",
                  padding: "3px 12px",
                  marginBottom: "14px",
                }}
              >
                <Check size={12} color="#22c55e" strokeWidth={3} />
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", letterSpacing: "0.5px" }}>
                  CHECKPOINT 1 PASSED
                </span>
              </div>

              <h3 style={{ fontSize: "17px", fontWeight: 800, margin: "0 0 8px 0", color: "#ffffff" }}>
                Final Checkpoint (2 of 2)
              </h3>
              <p style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.65)", margin: 0, lineHeight: "1.6" }}>
                Great job! Complete this final checkpoint to instantly generate your 24-hour key.
              </p>
            </div>

            {/* CTA: START CP2 */}
            <motion.button
              whileHover={{ scale: 1.02, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartCP2}
              style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "14px",
                border: "none",
                background: "linear-gradient(135deg, #ffffff 0%, #f4f4f5 70%, #e4e4e7 100%)",
                color: "#09090b",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "0.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 10px 35px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0,0,0,0.3)",
                marginBottom: "20px",
              }}
            >
              <span>Proceed to Checkpoint 2</span>
              <ArrowRight size={17} strokeWidth={2.5} />
            </motion.button>
          </motion.div>
        )}

        {/* STEP 3: KEY UNLOCKED (VAULT) */}
        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {loadingKey && (
              <div style={{ padding: "40px 0" }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                  style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid rgba(255, 255, 255, 0.1)",
                    borderTopColor: "#ffffff",
                    borderRadius: "50%",
                    margin: "0 auto 16px",
                  }}
                />
                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "13px", fontWeight: 500 }}>
                  Generating secure access key...
                </p>
              </div>
            )}

            {error && (
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "20px",
                }}
              >
                <p style={{ color: "#f87171", fontSize: "13px", fontWeight: 600, margin: "0 0 14px 0" }}>
                  {error}
                </p>
                <button
                  onClick={generateKey}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <RefreshCw size={14} /> Retry Generation
                </button>
              </div>
            )}

            {key && (
              <div>
                {/* Key Vault Card */}
                <div
                  style={{
                    background: "linear-gradient(180deg, rgba(14, 14, 18, 0.9) 0%, rgba(8, 8, 12, 0.98) 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "18px",
                    padding: "20px",
                    marginBottom: "20px",
                    boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      paddingBottom: "10px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Key size={13} color="#ffffff" />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "1.2px",
                          color: "rgba(255, 255, 255, 0.8)",
                          textTransform: "uppercase",
                        }}
                      >
                        Personal Key
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <ShieldCheck size={13} color="#22c55e" />
                      <span style={{ fontSize: "11px", color: "#22c55e", fontWeight: 600 }}>
                        Verified
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={handleCopy}
                    style={{
                      background: "rgba(0, 0, 0, 0.55)",
                      border: "1px dashed rgba(255, 255, 255, 0.28)",
                      borderRadius: "12px",
                      padding: "16px 14px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                        fontSize: "22px",
                        fontWeight: 800,
                        letterSpacing: "2.5px",
                        color: "#ffffff",
                        textShadow: "0 0 16px rgba(255, 255, 255, 0.45)",
                        wordBreak: "break-all",
                      }}
                    >
                      {key}
                    </span>
                    <span style={{ color: copied ? "#22c55e" : "rgba(255, 255, 255, 0.5)" }}>
                      {copied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} />}
                    </span>
                  </div>

                  {expiresAt && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px",
                        color: "rgba(255, 255, 255, 0.6)",
                        fontSize: "11px",
                        fontWeight: 500,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Clock size={12} color="#f59e0b" />
                        <span>Claim Window: <strong style={{ color: "#ffffff" }}>15 Minutes</strong> (redeem before {formatExpiry(expiresAt)})</span>
                      </div>
                      <span style={{ fontSize: "10.5px", color: "#22c55e", fontWeight: 600 }}>
                        ⚡ Activates 24-Hour Whitelist access once entered in Roblox!
                      </span>
                    </div>
                  )}
                </div>

                {/* COPY BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopy}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    borderRadius: "14px",
                    border: "none",
                    background: copied
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #ffffff 0%, #f4f4f5 70%, #e4e4e7 100%)",
                    color: copied ? "#ffffff" : "#09090b",
                    fontSize: "14px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: copied
                      ? "0 10px 30px rgba(16, 185, 129, 0.35)"
                      : "0 10px 35px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0,0,0,0.3)",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    marginBottom: "20px",
                  }}
                >
                  {copied ? (
                    <>
                      <Check size={18} strokeWidth={3} />
                      <span>Key Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} strokeWidth={2.5} />
                      <span>Copy Access Key</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* THREE-STEP HOW TO USE GUIDE */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.025)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
            borderRadius: "16px",
            padding: "18px 16px",
            textAlign: "left",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1px",
              color: "rgba(255, 255, 255, 0.75)",
              textTransform: "uppercase",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Terminal size={13} color="#ffffff" />
            Quick Instructions
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                1
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.4" }}>
                Complete Checkpoints 1 & 2 via Linkvertise.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                2
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.4" }}>
                Copy key & paste into Roblox within 15 minutes.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                3
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "rgba(255, 255, 255, 0.8)", lineHeight: "1.4" }}>
                Click <strong>Verify</strong> to activate 24-hour whitelist (no key required when rejoining).
              </p>
            </div>
          </div>
        </div>

        {/* COMMUNITY FOOTER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            paddingTop: "6px",
          }}
        >
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              textDecoration: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)")}
          >
            <span>Need support? Join our Discord</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </main>
  );
}
