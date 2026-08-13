"use client";
import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

export function Globe({ locations }: { locations: { lat: number, lon: number, size: number }[] }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let phi = 0;
        if (!canvasRef.current) return;

        let currentWidth = 400;
        if (window.innerWidth < 768) {
            currentWidth = 300;
        }

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: currentWidth * 2,
            height: currentWidth * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.05, 0.05, 0.05],
            markerColor: [0.15, 0.78, 0.24], // Eternity Green
            glowColor: [0.1, 0.1, 0.1],
            markers: locations.map(l => ({ location: [l.lat, l.lon], size: l.size })),
            onRender: (state) => {
                state.phi = phi;
                phi += 0.005;
            }
        });

        return () => globe.destroy();
    }, [locations]);

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
            <canvas
                ref={canvasRef}
                style={{ width: '100%', maxWidth: '400px', aspectRatio: '1', display: 'block' }}
            />
        </div>
    );
}
