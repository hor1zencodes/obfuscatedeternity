"use client";

import { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FullscreenShader() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();

  const noiseTexture = useMemo(() => {
    const w = 256;
    const h = 256;
    const data = new Uint8Array(w * h * 4);
    for (let i = 0; i < w * h * 4; i++) data[i] = Math.floor(Math.random() * 256);
    const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(size.width, size.height) },
      iChannel0: { value: noiseTexture },
    }),
    [noiseTexture, size.width, size.height]
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.iTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.iResolution.value.set(size.width, size.height);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        depthWrite={false}
        depthTest={false}
        transparent={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          precision highp float;

          uniform float iTime;
          uniform vec2 iResolution;
          uniform sampler2D iChannel0;

          void mainImage(out vec4 O, vec2 I)
          {
              vec2 r = iResolution.xy,
                   p = (I+I-r) / r.y * mat2(3.,4.,4.,-3.) / 1e2;

              vec4 S = vec4(0.0);
              vec4 C = vec4(1.,2.,3.,0.);
              vec4 W;

              for(float t=iTime, T=.1*t+p.y, i=0.; i<50.; i+=1.){
                  S += (cos(W=sin(i)*C)+1.)
                       * exp(sin(i+i*T))
                       / length(max(p,
                         p / vec2(2.0, texture(iChannel0, p/exp(W.x)+vec2(i,t)/8.).r*40.0)
                       )) / 1e4;

                  p += .02 * cos(i*(C.xz+8.0+i) + T + T);
              }
              O = vec4(tanh((S*S).rgb), 1.0);
          }

          void main() {
            vec2 fragCoord = gl_FragCoord.xy;
            vec4 O;
            mainImage(O, fragCoord);
            gl_FragColor = O;
          }
        `}
      />
    </mesh>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  
  const SCRIPT = `loadstring(game:HttpGet("https://zeneternity.vercel.app", true))()`;
  const DISCORD_NAME = "hor1zen.";

  const fallbackCopy = (text: string, callback: () => void) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
    } catch (e) {}
    document.body.removeChild(ta);
    callback();
  };

  const copyScript = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(SCRIPT).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(SCRIPT, () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }));
    } else {
      fallbackCopy(SCRIPT, () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const copyDiscord = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(DISCORD_NAME).then(() => {
        setDiscordCopied(true);
        setTimeout(() => setDiscordCopied(false), 2000);
      }).catch(() => fallbackCopy(DISCORD_NAME, () => {
        setDiscordCopied(true);
        setTimeout(() => setDiscordCopied(false), 2000);
      }));
    } else {
      fallbackCopy(DISCORD_NAME, () => {
        setDiscordCopied(true);
        setTimeout(() => setDiscordCopied(false), 2000);
      });
    }
  };

  return (
    <>
      {/* Three.js Background Layer */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden' }}>
        <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }} dpr={[1, 2]}>
          <color attach="background" args={["#000000"]} />
          <FullscreenShader />
        </Canvas>
      </div>

      {/* Foreground UI Layer */}
      <div className="container layout-wrapper">


        {/* Loadstring Card */}
        <div className="animated-border-box">
          <div className="script-box">
            <div className="script-text">
              <span className="prompt-icon">&gt;_</span>
              <span className="script-code">
                loadstring(game:HttpGet(
                <span className="script-url">"https://zeneternity.vercel.app"</span>, true))()
              </span>
            </div>
            <button
              className={`copy-btn ${copied ? 'copied' : ''}`}
              id="copy-btn"
              onClick={copyScript}
            >
              <img src="/copy.png" alt="copy" className="btn-icon" />
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Discord Card */}
        <div className="animated-border-box discord-wrapper">
          <div className="script-box discord-box">
            <div className="discord-text">
              <img src="/discord.png" alt="Discord" className="discord-icon" />
              <span className="discord-label">Developer Discord :</span>
              <span className="discord-username">{DISCORD_NAME}</span>
            </div>
            <button
              className={`copy-btn discord-copy ${discordCopied ? 'copied' : ''}`}
              onClick={copyDiscord}
              title="Copy Discord"
            >
              <img src="/copy.png" alt="copy" className="btn-icon" />
            </button>
          </div>
        </div>

        {/* Main Logo (Moved below Discord card) */}
        <div className="logo-container">
          <img src="/eternitylogo.png" alt="Eternity" className="main-logo" />
        </div>

      </div>
    </>
  );
}
