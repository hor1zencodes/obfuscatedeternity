"use client";

import React from "react";

export interface GradientBarsProps {
    numBars?: number;
    gradientFrom?: string;
    gradientTo?: string;
    animationDuration?: number;
    className?: string;
}

export const GradientBars: React.FC<GradientBarsProps> = ({
    numBars = 15,
    gradientFrom = "rgb(255, 60, 0)",
    gradientTo = "transparent",
    animationDuration = 2,
    className = "",
}) => {
    const calculateHeight = (index: number, total: number) => {
        const position = index / (total - 1);
        const maxHeight = 100;
        const minHeight = 30;

        const center = 0.5;
        const distanceFromCenter = Math.abs(position - center);
        const heightPercentage = Math.pow(distanceFromCenter * 2, 1.2);

        return minHeight + (maxHeight - minHeight) * heightPercentage;
    };

    return (
        <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className}`}>
            <div
                className="flex h-full w-full items-end"
                style={{
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                }}
            >
                {Array.from({ length: numBars }).map((_, index) => {
                    const height = calculateHeight(index, numBars);
                    return (
                        <div
                            key={index}
                            style={{
                                width: `${100 / numBars}%`,
                                height: `${height}%`,
                                background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
                                transition: "height 0.5s ease-in-out",
                                animation: `pulseBar${index} ${animationDuration}s ease-in-out infinite alternate`,
                                animationDelay: `${index * 0.1}s`,
                                outline: "2px solid rgba(0, 0, 0, 0)",
                                boxSizing: "border-box",
                            }}
                        >
                            <style>{`
                @keyframes pulseBar${index} {
                  0% { height: ${height}%; }
                  100% { height: ${height * 0.7}%; }
                }
              `}</style>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
