"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Download, Home } from "lucide-react";
import { ThreeJsBackground } from "@/components/ThreeJsBackground";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";

const DISCORD_INVITE_URL = "https://discord.gg/4c9N49jtXq";
const DOWNLOAD_APP_URL = "https://bit.ly/4yhxIEB";

export default function EternityBloxPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="eb-clean-wrapper">
      {/* 3D Starfield Background */}
      <ThreeJsBackground />

      {/* Ambient Cyber Glow */}
      <div className="eb-ambient-glow" aria-hidden="true" />

      {/* Floating Navbar */}
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
                <Link href="/#access" id="btn-nav-access">
                  <RandomLetterSwap
                    label="Access"
                    staggerDuration={0.025}
                    transition={{ duration: 0.6, type: "spring" }}
                  />
                </Link>
                <Link
                  href="/eternityblox"
                  id="btn-nav-active-page"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span style={{ color: "#fff", fontWeight: 600 }}>EternityBlox</span>
                  <span className="eb-nav-badge">App</span>
                </Link>
              </div>

              <div className="nav-actions">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="btn-nav-discord"
                  className="eb-nav-discord-btn"
                  aria-label="Join Discord Server"
                >
                  <svg width="15" height="15" viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09h0c2.69-28.7-4.66-51.52-18.95-72.06ZM42.66,65.34c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Zm41.81,0c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Z" />
                  </svg>
                  <span>Discord</span>
                </a>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Centered Download Card */}
      <main className="eb-clean-main">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", bounce: 0.35 }}
          className="eb-download-box"
        >
          {/* App Icon */}
          <div className="eb-clean-icon-wrapper">
            <img
              src="/eternityblox.png"
              alt="EternityBlox"
              className="eb-clean-icon"
            />
            <div className="eb-clean-icon-glow" aria-hidden="true" />
          </div>

          {/* Status Badge */}
          <div className="hero-badge-mono" style={{ margin: "0 auto 16px auto", width: "fit-content" }}>
            <span className="eb-mono-dot"></span>
            <span>Status: <strong style={{ color: "#ffffff" }}>Operational</strong></span>
          </div>

          {/* Single H1 Title - White with slight grey gradient */}
          <h1 className="eb-clean-title">
            EternityBlox
          </h1>

          <p className="eb-clean-sub">
            Roblox Version Downgrader, Selector &amp; Multi-Instance Manager
          </p>

          {/* EXACTLY 3 BUTTONS */}
          <div className="eb-clean-buttons">
            {/* 1. DOWNLOAD BUTTON */}
            <motion.a
              id="btn-download-app"
              href={DOWNLOAD_APP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="eb-btn-download-primary"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={20} className="eb-download-arrow-anim" />
              <span>Download EternityBlox</span>
            </motion.a>

            {/* 2. VISIT HOME PAGE BUTTON */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ width: "100%" }}>
              <Link href="/" id="btn-visit-home" className="eb-btn-home-secondary">
                <Home size={18} />
                <span>Visit Home Page</span>
              </Link>
            </motion.div>

            {/* 3. JOIN DISCORD BUTTON */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} style={{ width: "100%" }}>
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-join-discord"
                className="eb-btn-discord-secondary"
              >
                <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor" aria-hidden="true">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09h0c2.69-28.7-4.66-51.52-18.95-72.06ZM42.66,65.34c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Zm41.81,0c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Z" />
                </svg>
                <span>Join Discord</span>
              </a>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Simple Clean Footer */}
      <footer className="eb-clean-footer">
        <p>&copy; {new Date().getFullYear()} Eternity. All rights reserved.</p>
      </footer>
    </div>
  );
}
