import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Globe2, 
  Server, 
  Trash2, 
  UserX, 
  ExternalLink, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Eternity',
  description: 'Understand how Eternity handles telemetry, coarse geographic analytics, and session data with complete transparency.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#07080b',
      color: '#e4e4e7',
      fontFamily: 'var(--font-montserrat), sans-serif',
      position: 'relative',
      overflowX: 'hidden',
      paddingBottom: '80px'
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '1000px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(16, 185, 129, 0.04) 40%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Top Navigation Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(7, 8, 11, 0.75)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link 
            href="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: '#ffffff'
            }}
          >
            <img 
              src="/eternity.png" 
              alt="Eternity Logo" 
              style={{ width: '32px', height: '32px', objectFit: 'contain' }}
            />
            <span style={{
              fontFamily: 'var(--font-poppins), sans-serif',
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '2px',
              background: 'linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase'
            }}>
              ETERNITY
            </span>
          </Link>

          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '48px 24px 0 24px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Title Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            padding: '4px 14px',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              Transparency & Security
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-poppins), sans-serif',
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 800,
            margin: '0 0 12px 0',
            letterSpacing: '-0.02em',
            color: '#ffffff',
            lineHeight: 1.15
          }}>
            Privacy Policy
          </h1>

          <p style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            margin: 0,
            lineHeight: 1.6
          }}>
            Last updated: {lastUpdated} • Applicable to Eternity script loader, API services, and the eternity web portal.
          </p>
        </div>

        {/* Quick Highlights Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}>
          <div style={{
            backgroundColor: 'rgba(18, 20, 29, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <UserX size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>No Raw IP Stored</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.5 }}>
              We never log or retain raw IP addresses in our databases.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(18, 20, 29, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Globe2 size={18} color="#10b981" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Coarse Edge GeoIP</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.5 }}>
              Approximate regional coordinates (city/country) feed aggregate server telemetry. No device GPS is accessed.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(18, 20, 29, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Trash2 size={18} color="#f59e0b" />
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Auto 24h Expiry</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'rgba(255, 255, 255, 0.6)', margin: 0, lineHeight: 1.5 }}>
              Generated checkpoint keys and ephemeral logs expire and are purged automatically.
            </p>
          </div>
        </div>

        {/* Policy Document Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Section 1 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>1. Information We Collect</span>
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                When you execute Eternity or access our key system, our services process minimal technical telemetry required to deliver scripts and prevent abuse:
              </p>
              <ul style={{ paddingLeft: '20px', margin: '0 0 12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong style={{ color: '#fff' }}>Roblox Usernames:</strong> Provided by your client runtime when connecting to our authentication servers to verify key validation and whitelist entitlement.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Executor Runtime Signatures:</strong> The software client name (e.g., Wave, Solara, Codex) reported via user-agent to ensure scripts deliver compatible bytecode.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Coarse Geographic Telemetry:</strong> Approximate latitude, longitude, and country codes provided by Cloudflare and Vercel edge networks. This is derived from network routing hubs, <span style={{ color: '#f59e0b' }}>not physical device sensors or GPS</span>.
                </li>
                <li>
                  <strong style={{ color: '#fff' }}>Timestamp & Heartbeats:</strong> Basic session connectivity timestamps to power live-user counters.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0'
            }}>
              2. Information We NEVER Collect
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 12px 0' }}>
                We believe in zero invasive tracking. Eternity explicitly does <strong>not</strong> collect:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '10px',
                marginTop: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>No raw IP addresses logged</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>No passwords or .ROBLOSECURITY cookies</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>No hardware MAC addresses or HWIDs</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '13px' }}>
                  <CheckCircle2 size={15} />
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>No private files or local disk data</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0'
            }}>
              3. How We Use Information
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px 0' }}>The telemetry collected is utilized strictly for:</p>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Authentication:</strong> Validating 24-hour key access and permanent whitelist memberships.</li>
                <li><strong>Service Reliability:</strong> Measuring server load, execution volume, and uptime health.</li>
                <li><strong>Global Geo-Matrix Visualization:</strong> Plotting approximate points on an interactive 3D world globe in the admin panel to monitor global server network usage.</li>
                <li><strong>Abuse Mitigation:</strong> Preventing automated API abuse, key-bypass bots, and DDoS flooding.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0'
            }}>
              4. Third-Party Infrastructure
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px 0' }}>
                Eternity utilizes industry-standard cloud providers to ensure rapid worldwide content delivery:
              </p>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>Cloudflare Workers:</strong> Acts as our global reverse proxy and security gateway (`zeternity.online`).</li>
                <li><strong>Vercel:</strong> Hosts our web dashboard and key retrieval portals.</li>
                <li><strong>Supabase:</strong> Provides encrypted PostgreSQL database storage for whitelists and execution counts.</li>
                <li><strong>Linkvertise / Link Hub:</strong> Used for checkpoint ad-verification when obtaining free 24-hour keys. Third-party advertising platforms maintain their own independent privacy policies.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0'
            }}>
              5. Data Retention & Deletion Rights
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 10px 0' }}>
                All generated session keys automatically expire 24 hours after issuance. Ephemeral execution logs and live user presence entries are regularly cleared.
              </p>
              <p style={{ margin: 0 }}>
                If you wish to have any historical logs containing your username permanently expunged from our database records, please reach out directly through our Discord community.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section style={{
            backgroundColor: 'rgba(13, 15, 22, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            padding: '28px 24px'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 700,
              color: '#ffffff',
              margin: '0 0 14px 0'
            }}>
              6. Children&apos;s Privacy (COPPA Notice)
            </h2>
            <div style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                Eternity does not knowingly collect, store, or solicit personal information from children under the age of 13. Because our service operates without requiring personal registration (names, email addresses, phone numbers, or passwords), no child-identifying personal data is harvested.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section style={{
            backgroundColor: 'rgba(16, 20, 32, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '16px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 6px 0'
              }}>
                7. Contact & Inquiries
              </h2>
              <p style={{ fontSize: '13.5px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.6 }}>
                For any privacy inquiries, data deletion requests, or questions regarding this policy, contact the developer directly via Discord.
              </p>
            </div>

            <a
              href="https://discord.gg/4c9N49jtXq"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#5865F2',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 4px 15px rgba(88, 101, 242, 0.35)',
                transition: 'transform 0.2s ease'
              }}
            >
              <span>Join Official Discord</span>
              <ExternalLink size={14} />
            </a>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{
        maxWidth: '860px',
        margin: '64px auto 0 auto',
        padding: '24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '12.5px',
        color: 'rgba(255, 255, 255, 0.4)'
      }}>
        <div>
          &copy; {new Date().getFullYear()} Eternity. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>Home</Link>
          <Link href="/getkey" style={{ color: 'rgba(255, 255, 255, 0.6)', textDecoration: 'none' }}>Get Key</Link>
          <Link href="/privacy" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
