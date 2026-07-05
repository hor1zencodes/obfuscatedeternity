"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

function FullscreenShader1() {
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

function FullscreenShader2() {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      resolution: { value: new THREE.Vector2(size.width, size.height) },
    }),
    [size.width, size.height]
  );

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    // Multiplied the time by 8 to make the animation run a lot faster!
    materialRef.current.uniforms.time.value = clock.getElapsedTime() * 8.0;
    materialRef.current.uniforms.resolution.value.set(size.width, size.height);
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
          #define TWO_PI 6.2831853072
          #define PI 3.14159265359

          precision highp float;
          uniform vec2 resolution;
          uniform float time;
            
          float random (in float x) {
              return fract(sin(x)*1e4);
          }
          float random (vec2 st) {
              return fract(sin(dot(st.xy,
                                   vec2(12.9898,78.233)))*
                  43758.5453123);
          }
          
          varying vec2 vUv;

          void main(void) {
            vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
            
            vec2 fMosaicScal = vec2(4.0, 2.0);
            vec2 vScreenSize = vec2(256.0, 256.0);
            uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
            uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
              
            float t = time*0.06+random(uv.x)*0.4;
            float lineWidth = 0.0008;

            vec3 color = vec3(0.0);
            for(int j = 0; j < 3; j++){
              for(int i=0; i < 5; i++){
                color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));        
              }
            }

            gl_FragColor = vec4(color[2],color[1],color[0],1.0);
          }
        `}
      />
    </mesh>
  );
}

const vertexShader = `
  uniform float time;
  uniform float intensity;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 pos = position;
    pos.y += sin(pos.x * 10.0 + time) * 0.1 * intensity;
    pos.x += cos(pos.y * 8.0 + time * 1.5) * 0.05 * intensity;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  uniform float intensity;
  uniform vec3 color1;
  uniform vec3 color2;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vec2 uv = vUv;
    
    // Create animated noise pattern
    float noise = sin(uv.x * 20.0 + time) * cos(uv.y * 15.0 + time * 0.8);
    noise += sin(uv.x * 35.0 - time * 2.0) * cos(uv.y * 25.0 + time * 1.2) * 0.5;
    
    // Mix colors based on noise and position
    vec3 color = mix(color1, color2, noise * 0.5 + 0.5);
    color = mix(color, vec3(1.0), pow(abs(noise), 2.0) * intensity);
    
    // Add glow effect
    float glow = 1.0 - length(uv - 0.5) * 2.0;
    glow = pow(glow, 2.0);
    
    gl_FragColor = vec4(color * glow, glow * 0.8);
  }
`;

export function ShaderPlane({
  position,
  color1 = "#ff5722",
  color2 = "#ffffff",
}: {
  position: [number, number, number]
  color1?: string
  color2?: string
}) {
  const mesh = useRef<THREE.Mesh>(null!)

  const uniforms = useMemo(
    () => ({
      time: { value: 0 },
      intensity: { value: 1.0 },
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
    }),
    [color1, color2],
  )

  useFrame((state) => {
    if (mesh.current) {
      // @ts-ignore
      mesh.current.material.uniforms.time.value = state.clock.elapsedTime
      // @ts-ignore
      mesh.current.material.uniforms.intensity.value = 1.0 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function EnergyRing({
  radius = 1,
  position = [0, 0, 0],
}: {
  radius?: number
  position?: [number, number, number]
}) {
  const mesh = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.z = state.clock.elapsedTime
      // @ts-ignore
      mesh.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <mesh ref={mesh} position={position}>
      <ringGeometry args={[radius * 0.8, radius, 32]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
  )
}

function Shader3Container() {
  const { size } = useThree();
  // We scale the group up so the 2x2 plane covers the screen on a perspective camera, 
  // since the user's code relies on the camera projection instead of bypassing it.
  const scale = Math.max(size.width, size.height) / 100;
  return (
    <group scale={[scale, scale, 1]}>
      <ShaderPlane position={[0, 0, 0]} color1="#000000" color2="#ffffff" />
      <EnergyRing position={[0, 0, 0.1]} />
    </group>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const [bgIndex, setBgIndex] = useState<number | null>(null);

  useEffect(() => {
    const lastBg = sessionStorage.getItem('lastBgIndex');
    let nextBg;
    
    if (lastBg === null) {
      // Randomly pick a background on initial visit
      nextBg = Math.floor(Math.random() * 3);
    } else {
      // Guarantee a change on refresh by cycling to the next one
      nextBg = (parseInt(lastBg, 10) + 1) % 3;
    }
    
    sessionStorage.setItem('lastBgIndex', nextBg.toString());
    setBgIndex(nextBg);
  }, []);
  
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
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
          <color attach="background" args={["#000000"]} />
          {bgIndex === 0 && <FullscreenShader1 />}
          {bgIndex === 1 && <FullscreenShader2 />}
          {bgIndex === 2 && <Shader3Container />}
        </Canvas>
      </div>

      {/* Foreground UI Layer */}
      <div className={`container layout-wrapper ${bgIndex === 1 ? 'theme-white' : bgIndex === 2 ? 'theme-white' : ''}`}>


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

        {/* Main Logo */}
        <div className="logo-container">
          <img src="/eternitylogo.png" alt="Eternity" className={`main-logo ${bgIndex === 2 ? 'grayscale-logo' : ''}`} />
        </div>

      </div>
    </>
  );
}
