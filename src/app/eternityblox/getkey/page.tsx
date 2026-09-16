"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function GetKeyPage() {
  const [key, setKey] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generateKey = async () => {
      try {
        const res = await fetch("/api/key/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "linkvertise" }),
        });
        const data = await res.json();
        if (data.success) {
          setKey(data.key);
          setExpiresAt(data.expiresAt);
        } else {
          setError(data.error || "Failed to generate key");
        }
      } catch (e) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generateKey();
  }, []);

  const handleCopy = () => {
    if (key && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiry = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a0a0f 0%, #0d0d15 50%, #0a0a0f 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        padding: "20px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: "linear-gradient(145deg, rgba(18, 18, 24, 0.95), rgba(12, 12, 16, 0.98))",
          borderRadius: "20px",
          border: "1px solid rgba(248, 248, 255, 0.08)",
          padding: "48px 40px",
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(248, 248, 255, 0.02)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(248, 248, 255, 0.06), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ marginBottom: "8px" }}
        >
          <span
            style={{
              fontSize: "28px",
              fontWeight: 800,
              letterSpacing: "3px",
              background: "linear-gradient(135deg, #f8f8ff, #b0b0b8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ETERNITY
          </span>
        </motion.div>

        <p
          style={{
            color: "rgba(160, 160, 175, 0.8)",
            fontSize: "13px",
            marginBottom: "32px",
            letterSpacing: "0.5px",
          }}
        >
          Key System
        </p>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: "40px 0" }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                border: "3px solid rgba(248, 248, 255, 0.1)",
                borderTopColor: "#f8f8ff",
                borderRadius: "50%",
                margin: "0 auto 16px",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "rgba(160, 160, 175, 0.6)", fontSize: "13px" }}>
              Generating your key...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "rgba(230, 70, 70, 0.1)",
              border: "1px solid rgba(230, 70, 70, 0.3)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <p style={{ color: "#e64646", fontSize: "14px", fontWeight: 600, margin: 0 }}>
              {error}
            </p>
          </motion.div>
        )}

        {key && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {/* Key Display */}
            <div
              style={{
                background: "rgba(8, 8, 10, 0.8)",
                border: "1px solid rgba(248, 248, 255, 0.12)",
                borderRadius: "14px",
                padding: "20px",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  color: "rgba(130, 130, 145, 0.8)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "1.5px",
                  marginBottom: "10px",
                  fontWeight: 600,
                }}
              >
                Your Key
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#f8f8ff",
                  letterSpacing: "2px",
                  margin: "0 0 12px 0",
                  wordBreak: "break-all",
                }}
              >
                {key}
              </p>
              {expiresAt && (
                <p
                  style={{
                    color: "rgba(160, 160, 175, 0.6)",
                    fontSize: "11px",
                    margin: 0,
                  }}
                >
                  Expires: {formatExpiry(expiresAt)}
                </p>
              )}
            </div>

            {/* Copy Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                background: copied
                  ? "linear-gradient(135deg, #34d399, #10b981)"
                  : "linear-gradient(135deg, #f8f8ff, #d0d0d8)",
                color: copied ? "#fff" : "#0a0a0f",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.5px",
                transition: "all 0.3s ease",
                marginBottom: "12px",
              }}
            >
              {copied ? "✓ Copied!" : "Copy Key"}
            </motion.button>

            {/* Instructions */}
            <div
              style={{
                background: "rgba(248, 248, 255, 0.03)",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
              }}
            >
              <p
                style={{
                  color: "rgba(160, 160, 175, 0.8)",
                  fontSize: "12px",
                  margin: "0 0 8px 0",
                  fontWeight: 600,
                }}
              >
                How to use:
              </p>
              <ol
                style={{
                  color: "rgba(140, 140, 155, 0.7)",
                  fontSize: "11px",
                  margin: 0,
                  paddingLeft: "16px",
                  lineHeight: "1.8",
                }}
              >
                <li>Copy the key above</li>
                <li>Go back to your Roblox executor</li>
                <li>Paste the key in the key input field</li>
                <li>Click &quot;Verify&quot; to load the script</li>
              </ol>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
