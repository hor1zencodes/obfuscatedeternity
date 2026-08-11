"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RandomLetterSwap } from '@/components/ui/random-letter-swap';
import { AmbientSound } from '@/components/AmbientSound';
import { Zap, ShieldCheck, RefreshCw, Crown, Wrench } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'motion/react';

/* =====================================
   SHADERS (ORIGINAL VERSIONS)
======================================== */

// --- Shader Plane & Energy Ring (Theme 3) ---
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

function ShaderPlane({
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

function EnergyRing({
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
  const scale = Math.max(size.width, size.height) / 100;
  return (
    <group scale={[scale, scale, 1]}>
      {/* Passing black and white colors to keep it fully monochrome! */}
      <ShaderPlane position={[0, 0, 0]} color1="#000000" color2="#ffffff" />
      <EnergyRing position={[0, 0, 0.1]} />
    </group>
  );
}

// --- GLSL Hills (Theme 5) ---
const GLSLHills = ({ cameraZ = 125, planeSize = 256, speed = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Plane class
    class Plane {
      uniforms: { time: { type: string, value: number } };
      mesh: THREE.Mesh;
      time: number;

      constructor() {
        this.uniforms = {
          time: { type: 'f', value: 0 },
        };
        this.mesh = this.createMesh();
        this.time = speed;
      }

      createMesh() {
        return new THREE.Mesh(
          new THREE.PlaneGeometry(planeSize, planeSize, planeSize, planeSize),
          new THREE.RawShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: `
              #define GLSLIFY 1
              attribute vec3 position;
              uniform mat4 projectionMatrix;
              uniform mat4 modelViewMatrix;
              uniform float time;
              varying vec3 vPosition;

              mat4 rotateMatrixX(float radian) {
                return mat4(
                  1.0, 0.0, 0.0, 0.0,
                  0.0, cos(radian), -sin(radian), 0.0,
                  0.0, sin(radian), cos(radian), 0.0,
                  0.0, 0.0, 0.0, 1.0
                );
              }

              vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
              vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
              vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
              vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
              vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

              float cnoise(vec3 P) {
                vec3 Pi0 = floor(P);
                vec3 Pi1 = Pi0 + vec3(1.0);
                Pi0 = mod289(Pi0);
                Pi1 = mod289(Pi1);
                vec3 Pf0 = fract(P);
                vec3 Pf1 = Pf0 - vec3(1.0);
                vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
                vec4 iy = vec4(Pi0.yy, Pi1.yy);
                vec4 iz0 = Pi0.zzzz;
                vec4 iz1 = Pi1.zzzz;

                vec4 ixy = permute(permute(ix) + iy);
                vec4 ixy0 = permute(ixy + iz0);
                vec4 ixy1 = permute(ixy + iz1);

                vec4 gx0 = ixy0 * (1.0 / 7.0);
                vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
                gx0 = fract(gx0);
                vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
                vec4 sz0 = step(gz0, vec4(0.0));
                gx0 -= sz0 * (step(0.0, gx0) - 0.5);
                gy0 -= sz0 * (step(0.0, gy0) - 0.5);

                vec4 gx1 = ixy1 * (1.0 / 7.0);
                vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
                gx1 = fract(gx1);
                vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
                vec4 sz1 = step(gz1, vec4(0.0));
                gx1 -= sz1 * (step(0.0, gx1) - 0.5);
                gy1 -= sz1 * (step(0.0, gy1) - 0.5);

                vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
                vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
                vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
                vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
                vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
                vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
                vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
                vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

                vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
                g000 *= norm0.x;
                g010 *= norm0.y;
                g100 *= norm0.z;
                g110 *= norm0.w;
                vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
                g001 *= norm1.x;
                g011 *= norm1.y;
                g101 *= norm1.z;
                g111 *= norm1.w;

                float n000 = dot(g000, Pf0);
                float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
                float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
                float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
                float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
                float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
                float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
                float n111 = dot(g111, Pf1);

                vec3 fade_xyz = fade(Pf0);
                vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
                vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
                float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
                return 2.2 * n_xyz;
              }

              void main(void) {
                vec3 updatePosition = (rotateMatrixX(radians(90.0)) * vec4(position, 1.0)).xyz;
                float sin1 = sin(radians(updatePosition.x / 128.0 * 90.0));
                vec3 noisePosition = updatePosition + vec3(0.0, 0.0, time * -30.0);
                float noise1 = cnoise(noisePosition * 0.08);
                float noise2 = cnoise(noisePosition * 0.06);
                float noise3 = cnoise(noisePosition * 0.4);
                vec3 lastPosition = updatePosition + vec3(0.0,
                  noise1 * sin1 * 8.0
                  + noise2 * sin1 * 8.0
                  + noise3 * (abs(sin1) * 2.0 + 0.5)
                  + pow(sin1, 2.0) * 40.0, 0.0);

                vPosition = lastPosition;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(lastPosition, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;
              #define GLSLIFY 1
              varying vec3 vPosition;

              void main(void) {
                float opacity = (96.0 - length(vPosition)) / 256.0 * 0.6;
                vec3 color = vec3(0.6);
                gl_FragColor = vec4(color, opacity);
              }
            `,
            transparent: true
          })
        );
      }

      render(time: number) {
        this.uniforms.time.value += time * this.time;
      }
    }

    // Three.js setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: false });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    const clock = new THREE.Clock();
    const plane = new Plane();

    let animationId: number;

    const resize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    const render = () => {
      plane.render(clock.getDelta());
      renderer.render(scene, camera);
    };

    const renderLoop = () => {
      render();
      animationId = requestAnimationFrame(renderLoop);
    };

    const init = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 1);
      camera.position.set(0, 16, cameraZ);
      camera.lookAt(new THREE.Vector3(0, 28, 0));
      scene.add(plane.mesh);
      window.addEventListener('resize', resize);
      resize();
      renderLoop();
    };

    init();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      plane.mesh.geometry.dispose();
      (plane.mesh.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, [cameraZ, planeSize, speed]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[-1] bg-black pointer-events-none w-screen h-screen">
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1
        }}
      />
    </div>
  );
};


/* =====================================
   MAIN PAGE
======================================== */

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const loadingTexts = useMemo(() => [
    "Welcome to Eternity",
    "Redefining Execution",
    "Lightning Fast",
    "Completely Undetected"
  ], []);

  const [copied, setCopied] = useState(false);
  const [typedChars, setTypedChars] = useState(0);
  const [backgroundTheme, setBackgroundTheme] = useState<'plane' | 'hills' | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const fullScript = 'loadstring(game:HttpGet("https://zeneternity.vercel.app", true))()';

  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    if (!isLoading) return;

    const textDuration = 450;
    let index = 0;
    
    const textInterval = setInterval(() => {
      index++;
      if (index < loadingTexts.length) {
        setLoadingTextIndex(index);
      }
    }, textDuration);

    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) return 100;
        return prev + (100 / 30);
      });
    }, 50);

    const finishTimeout = setTimeout(() => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setIsLoading(false);
    }, textDuration * loadingTexts.length + 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
      clearTimeout(finishTimeout);
    };
  }, [isLoading, loadingTexts]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Randomize Background
    const themes: ('plane' | 'hills')[] = ['plane', 'hills'];
    setBackgroundTheme(themes[Math.floor(Math.random() * themes.length)]);

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setTypedChars(prev => {
          if (prev >= fullScript.length) {
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  const copyScript = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (backgroundTheme === null) return null;

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }} 
            exit={{ opacity: 0, filter: 'blur(10px)' }} 
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="loading-overlay"
          >
            <div className="loading-content">
              <div className="loading-text-container">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingTextIndex}
                    initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                    transition={{ duration: 0.25 }}
                    className="loading-text"
                  >
                    {loadingTexts[loadingTextIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              
              <div className="loading-bar-container">
                <div 
                  className="loading-bar-fill"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="saas-layout">
        {/* 3D Dynamic Backgrounds */}
        {backgroundTheme === 'plane' ? (
          <div className="fixed inset-0 z-[-1] bg-black pointer-events-none w-screen h-screen">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }} style={{ width: '100%', height: '100%' }}>
              <Shader3Container />
            </Canvas>
          </div>
        ) : (
          <GLSLHills />
        )}

        {!isLoading && (
          <>
            <motion.div className="scroll-progress-bar" style={{ scaleY }} />
            {/* Navbar */}
            <nav className={`saas-navbar ${isScrolled ? 'scrolled' : ''}`}>
          <div className="nav-content">
            <div className="nav-logo">
              <a href="#" aria-label="Go to top">
                <img src="/eternity.png" alt="Eternity" />
              </a>
            </div>
            <div className="nav-links">
              <div className="nav-page-links">
                <a href="#">
                  <RandomLetterSwap label="Home" staggerDuration={0.025} transition={{ duration: 0.6, type: "spring" }} />
                </a>
                <a href="#features">
                  <RandomLetterSwap label="Features" staggerDuration={0.025} transition={{ duration: 0.6, type: "spring" }} />
                </a>
                <a href="#access">
                  <RandomLetterSwap label="Access" staggerDuration={0.025} transition={{ duration: 0.6, type: "spring" }} />
                </a>
              </div>
              <div className="nav-actions">
                <AmbientSound />
                <a href="https://discord.gg/4c9N49jtXq" target="_blank" rel="noopener noreferrer" className="discord-btn">
                  <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.05-.09h0c2.69-28.7-4.66-51.52-18.95-72.06ZM42.66,65.34c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Zm41.81,0c-5.32,0-9.71-4.86-9.71-10.8s4.31-10.8,9.71-10.8c5.44,0,9.77,4.9,9.71,10.8,0,5.94-4.31,10.8-9.71,10.8Z"/>
                  </svg>
                  <span className="discord-btn-text">Join Discord</span>
                </a>
              </div>
            </div>
          </div>
        </nav>

      <main className="saas-main">
        {/* Hero Section */}
        <section className="hero-section">
          <motion.div initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.4 }} className="hero-badge-mono">
            <span className="pulse-dot-green"></span>
            Script Status: <strong style={{color: '#10b981'}}>Operational</strong>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} className="hero-title">
            R<span className="glitch-letter" style={{ animationDelay: '0.5s' }}>e</span>def<span className="glitch-letter" style={{ animationDelay: '1.2s' }}>i</span>n<span className="glitch-letter" style={{ animationDelay: '2.5s' }}>i</span>ng <span className="glitch-letter" style={{ animationDelay: '0.2s' }}>E</span>xec<span className="glitch-letter" style={{ animationDelay: '3.1s' }}>u</span>ti<span className="glitch-letter" style={{ animationDelay: '1.7s' }}>o</span>n
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }} whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, delay: 0.4, type: "spring", bounce: 0.3 }} className="hero-subtitle">
            Lightning fast, completely undetected, and built for absolute dominance.<br/>
            Eternity is the premier execution engine for modern scripters.
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.9, y: 60, rotateX: 10 }} whileInView={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 1, delay: 0.5, type: "spring", bounce: 0.4 }} className="hero-terminal-wrapper-mono" style={{ perspective: '1000px' }}>
            
            {/* SVG Filters for Electrical Distortion */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              {/* Border edge distortion - moderate */}
              <filter id="electric-distort" x="-200%" y="-200%" width="500%" height="500%">
                <feTurbulence type="fractalNoise" baseFrequency="0.12" numOctaves="3" result="noise">
                  <animate attributeName="baseFrequency" values="0.12;0.18;0.12" dur="0.4s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              {/* Bolt-specific distortion - stronger zigzag for the falling beam */}
              <filter id="bolt-distort" x="-500%" y="-10%" width="1100%" height="120%">
                <feTurbulence type="turbulence" baseFrequency="0.05 0.8" numOctaves="4" result="noise" seed="2">
                  <animate attributeName="baseFrequency" values="0.05 0.8;0.08 1.2;0.05 0.8" dur="0.3s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="18" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </svg>

            {/* Background Smoke Layers */}
            <div className="smoke-container">
              <div className="smoke-particle smoke-1"></div>
              <div className="smoke-particle smoke-2"></div>
              <div className="smoke-particle smoke-3"></div>
            </div>

            <div className="saber-lightning"></div>
            
            {/* Crackling Electrical Arc Border (Rounded and behind terminal) */}
            <div className="saber-wrapper-arc">
              <div className="saber-border-fill"></div>
              <div className="saber-border-retract"></div>
            </div>

            <div className={`hero-terminal-mono ${copied ? 'terminal-success-pulse' : ''}`}>

              <div className="terminal-header-mono">
                <div className="terminal-dots-mono">
                  <span className="dot-mono dot-mono-r"></span>
                  <span className="dot-mono dot-mono-y"></span>
                  <span className="dot-mono dot-mono-g"></span>
                </div>
                <div className="terminal-title">project-eternity.lua</div>
              </div>
              <div className="terminal-body">
                <div className="script-text">
                  <span className="prompt-icon">&gt;_</span>
                  <span className="script-code">
                    {typedChars > 0 && (
                      <>
                        {fullScript.substring(0, Math.min(typedChars, 25))}
                        {typedChars > 25 && (
                          <span className="script-url">
                            {fullScript.substring(25, Math.min(typedChars, 57))}
                          </span>
                        )}
                        {typedChars > 57 && (
                          fullScript.substring(57, Math.min(typedChars, fullScript.length))
                        )}
                      </>
                    )}
                    <span className="cursor-blink">|</span>
                  </span>
                </div>
                <button
                  className={`terminal-copy-btn-mono ${copied ? 'copied' : ''}`}
                  onClick={copyScript}
                >
                  <img src="/copy.png" alt="copy" className="btn-icon" />
                  {copied ? 'COPIED!' : 'COPY'}
                </button>
              </div>
            </div>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: -15, filter: 'blur(8px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.9, type: "spring", bounce: 0.6 }} className={`text-[13px] mt-4 font-medium tracking-wide transition-all duration-300 ${copied ? 'text-[#ff5f56] drop-shadow-[0_0_8px_rgba(255,95,86,0.8)]' : 'text-white/40'}`}>
            <span className={copied ? 'inline-block warning-shake' : 'inline-block'}>
              Make sure you have access before executing the script. <span className="opacity-70">(Ignore this if you are whitelisted and have an access key)</span>
            </span>
          </motion.p>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="features-section">
          <div className="features-header">
            <motion.div initial={{ opacity: 0, y: -20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: "spring" }} className="badge-wrapper mb-4">
              <div className="section-badge">
                <span className="section-badge-text">Features</span>
              </div>
            </motion.div>
            <motion.h2 initial={{ opacity: 0, x: -50, filter: 'blur(10px)' }} whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, delay: 0.1, type: "spring" }} className="section-title">Built for Performance</motion.h2>
            <motion.p initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }} whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, delay: 0.1, type: "spring" }} className="section-subtitle">Everything you need to dominate, wrapped in a beautiful UI.</motion.p>
          </div>
          <div className="bento-grid">
            <motion.div initial={{ opacity: 0, scale: 0.8, rotate: -3 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: 'spring', bounce: 0.5, delay: 0.1 }} className="bento-card col-span-2">
              <div className="bento-icon">
                <Zap size={28} className="text-white" />
              </div>
              <h3>Optimized</h3>
              <p>Engineered from the ground up for maximum performance. Ensures your scripts run smoothly with minimal overhead and absolute stability.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -60, rotate: -5 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: 'spring', bounce: 0.4, delay: 0.2 }} className="bento-card">
              <div className="bento-icon">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h3>Undetected</h3>
              <p>Advanced ring-0 bypasses and active signature morphing keep your execution completely hidden from automated anti-cheat systems.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 60, scale: 0.9 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: 'spring', bounce: 0.4, delay: 0.3 }} className="bento-card">
              <div className="bento-icon">
                <RefreshCw size={28} className="text-white" />
              </div>
              <h3>Regular Updates</h3>
              <p>Actively maintained by a dedicated developer. Game patches are monitored and adapted to in real-time so you never have to wait long for updates.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 60, rotate: 3 }} whileInView={{ opacity: 1, x: 0, rotate: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: 'spring', bounce: 0.4, delay: 0.4 }} className="bento-card col-span-2">
              <div className="bento-icon">
                <Crown size={28} className="text-white" />
              </div>
              <h3>Exclusive Access</h3>
              <p>Available only to a hand-picked network of elite users. Secured by a strict whitelist and unique key system to ensure maximum security, quality, and unparalleled support.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 1.1, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: 'spring', bounce: 0.3, delay: 0.5 }} className="bento-card col-span-2">
              <div className="bento-icon">
                <Wrench size={28} className="text-white" />
              </div>
              <h3>Unrivaled In-Script Arsenal</h3>
              <p>Equipped with zero delay attaches, Anti-VC, custom reanimations, brand new visual shaders, an in-script chat system, and more exclusive tools which other scripts may not have.</p>
            </motion.div>
          </div>
        </section>

        {/* Access Section */}
        <section id="access" className="access-section">
          <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} viewport={{ once: false, margin: "-10%" }} transition={{ duration: 0.8, type: "spring" }} className="access-header">
            <div className="flex justify-center mb-6">
              <div className="section-badge">
                <span className="section-badge-text">Access</span>
              </div>
            </div>
            <h2>How to Get Access</h2>
            <p>Eternity is strictly invite-only. Follow these steps to apply for a whitelist and receive your execution key.</p>
          </motion.div>
          
          <div className="access-steps">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0, margin: "200px" }} transition={{ duration: 0.8, type: "spring", bounce: 0.6, delay: 0.1 }} className="access-step-card">
              <div className="step-number">1</div>
              <h3>Join the Server</h3>
              <p>Gain entry to the private Project Eternity Discord server. This is your hub for updates, support, and community.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0, margin: "200px" }} transition={{ duration: 0.8, type: "spring", bounce: 0.6, delay: 0.2 }} className="access-step-card">
              <div className="step-number">2</div>
              <h3>DM @hor1zxn.</h3>
              <p>Direct message Zen to apply. He will personally verify you, whitelist your Roblox username, and provide your unique key.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: false, amount: 0, margin: "200px" }} transition={{ duration: 0.8, type: "spring", bounce: 0.6, delay: 0.3 }} className="access-step-card">
              <div className="step-number">3</div>
              <h3>Execute & Enjoy</h3>
              <p>Run the script's loadstring and authenticate. Make sure to read the usage rules and guidelines in Discord before dominating.</p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="saas-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" aria-label="Go to top">
              <img src="/eternity.png" alt="Eternity" className="footer-logo" />
            </a>
            <p>Redefining execution for the modern era. Undetected. Fast. Reliable.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Eternity. All rights reserved.</p>
          <div className="status-indicator">
            <div className="status-dot" style={{ backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.8)' }}></div>
            <span>Script Status: <strong style={{color: '#10b981'}}>Operational</strong></span>
          </div>
        </div>
      </footer>
      </>
      )}
    </div>
    </>
  );
}
