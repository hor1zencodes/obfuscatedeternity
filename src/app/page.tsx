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

export function DottedSurface({ className, ...props }: React.ComponentProps<'div'>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points[];
    animationId: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      10000,
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    containerRef.current.appendChild(renderer.domElement);

    const particles: THREE.Points[] = [];
    const positions: number[] = [];
    const colors: number[] = [];

    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0;
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);
        colors.push(200 / 255, 200 / 255, 200 / 255); // Three.js Float32 colors are 0-1
      }
    }

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 8,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const positionAttribute = geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;
          positions[index + 1] =
            Math.sin((ix + count) * 0.3) * 50 +
            Math.sin((iy + count) * 0.5) * 50;
          i++;
        }
      }

      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
      count += 0.1;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    animate();

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles: [points],
      animationId,
      count,
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.scene.traverse((object) => {
          if (object instanceof THREE.Points) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((material) => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
        sceneRef.current.renderer.dispose();
        if (containerRef.current && sceneRef.current.renderer.domElement) {
          containerRef.current.removeChild(sceneRef.current.renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', backgroundColor: '#000' }}
      className={className}
      {...props}
    />
  );
}

const GLSLHills = ({ width = '100vw', height = '100vh', cameraZ = 125, planeSize = 256, speed = 0.5 }) => {
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
    <div ref={containerRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden', backgroundColor: '#000' }}>
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

function CustomThemeSwitcher({ currentBg, setBg }: { currentBg: number, setBg: (val: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const themes = [
    { value: 0, label: 'Theme 1: Gold Waves' },
    { value: 1, label: 'Theme 2: White Noise' },
    { value: 2, label: 'Theme 3: Shader Plane' },
    { value: 3, label: 'Theme 4: Dotted Surface' },
    { value: 4, label: 'Theme 5: GLSL Hills' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="theme-switcher-custom" ref={ref}>
      <div className="theme-switcher-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="theme-switcher-label">Background:</span>
        <span className="theme-switcher-value">{themes.find(t => t.value === currentBg)?.label}</span>
        <svg className={`theme-switcher-arrow ${isOpen ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="theme-switcher-dropdown">
          {themes.map(t => (
            <div
              key={t.value}
              className={`theme-switcher-option ${currentBg === t.value ? 'selected' : ''}`}
              onClick={() => {
                setBg(t.value);
                sessionStorage.setItem('lastBgIndex', t.value.toString());
                setIsOpen(false);
              }}
            >
              {t.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const SONGS = [
  { title: "Main Atraction", url: "/Main%20Atraction.mp3" },
  { title: "Too Many Nights", url: "/Metro%20Boomin%20%26%20Future%20-%20Too%20Many%20Nights%20(Feat.%20Don%20Toliver)%20%5BClean%5D.mp3" },
  { title: "Right On", url: "/Right%20On.mp3" },
  { title: "Timeless", url: "/The%20Weeknd%20%26%20Playboi%20Carti%20-%20Timeless%20(Clean%20Lyrics).mp3" }
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [discordCopied, setDiscordCopied] = useState(false);
  const [bgIndex, setBgIndex] = useState<number | null>(null);
  const [songIndex, setSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.05); // Default to 15% volume
  const [hasEntered, setHasEntered] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const lastBg = sessionStorage.getItem('lastBgIndex');
    const allowedBgs = [0, 1, 4]; // Only Theme 1, Theme 2, and Theme 5 are allowed on landing
    let nextBg;

    if (lastBg === null) {
      // Randomly pick an allowed background on initial visit
      nextBg = allowedBgs[Math.floor(Math.random() * allowedBgs.length)];
    } else {
      // Guarantee a random change on refresh by picking until it's different
      const prevBg = parseInt(lastBg, 10);
      do {
        nextBg = allowedBgs[Math.floor(Math.random() * allowedBgs.length)];
      } while (nextBg === prevBg);
    }

    sessionStorage.setItem('lastBgIndex', nextBg.toString());
    setBgIndex(nextBg);

    // Pick a random song on initial load
    setSongIndex(Math.floor(Math.random() * SONGS.length));
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
    } catch (e) { }
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

  // Removed autoplay useEffect as browsers block it; using Click-to-Enter overlay instead

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const nextSong = () => {
    if (songIndex !== null) setSongIndex((songIndex + 1) % SONGS.length);
  };

  const prevSong = () => {
    if (songIndex !== null) setSongIndex((songIndex - 1 + SONGS.length) % SONGS.length);
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (audioRef.current && isPlaying && songIndex !== null) {
      audioRef.current.play().catch(() => { });
    }
  }, [songIndex, volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Prevent hydration mismatch
  if (bgIndex === null) return null;

  return (
    <>
      {/* Enter Overlay */}
      {!hasEntered && (
        <div
          className="enter-overlay"
          onClick={() => {
            setHasEntered(true);
            if (audioRef.current) {
              audioRef.current.volume = volume;
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => { });
            }
          }}
        >
          <div className="enter-content">
            <span className="enter-text">Click to Enter</span>
            <span className="enter-subtext">( contains music after enter you can pause / change music from the music bar )</span>
          </div>
        </div>
      )}

      {/* Three.js Background Layer */}
      {bgIndex !== 3 && bgIndex !== 4 && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0, overflow: 'hidden' }}>
          <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
            <color attach="background" args={["#000000"]} />
            {bgIndex === 0 && <FullscreenShader1 />}
            {bgIndex === 1 && <FullscreenShader2 />}
            {bgIndex === 2 && <Shader3Container />}
          </Canvas>
        </div>
      )}

      {/* 4th Background (Dotted Surface) */}
      {bgIndex === 3 && <DottedSurface />}

      {/* 5th Background (GLSL Hills) */}
      {bgIndex === 4 && <GLSLHills />}

      {/* Foreground UI Layer */}
      <div className={`container layout-wrapper ${bgIndex === 1 || bgIndex === 2 || bgIndex === 3 || bgIndex === 4 ? 'theme-white' : ''}`}>

        {/* Advanced Music Player */}
        <div className="music-player-advanced">
          <div className="music-controls">
            <button onClick={prevSong} className="music-btn-small" title="Previous Song">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button onClick={togglePlay} className="music-btn" title="Play/Pause Music">
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button onClick={nextSong} className="music-btn-small" title="Next Song">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          <div className="music-info">
            <div className="music-title">
              {songIndex !== null ? SONGS[songIndex].title : ''}
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
              title="Volume"
            />
          </div>
        </div>

        {songIndex !== null && (
          <audio
            ref={audioRef}
            src={SONGS[songIndex].url}
            onEnded={nextSong}
          />
        )}

        {/* Theme Switcher */}
        <CustomThemeSwitcher currentBg={bgIndex} setBg={setBgIndex} />

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
