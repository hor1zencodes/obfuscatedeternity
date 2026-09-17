"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import './TrueFocus.css';

export interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
  wordClassName?: (index: number, word: string) => string;
}

export const TrueFocus: React.FC<TrueFocusProps> = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 5,
  borderColor = '#ffffff',
  glowColor = 'rgba(255, 255, 255, 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1,
  className = '',
  wordClassName
}) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(
        () => {
          setCurrentIndex(prev => (prev + 1) % words.length);
        },
        (animationDuration + pauseBetweenAnimations) * 1000
      );

      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    const updateRect = () => {
      if (currentIndex === null || currentIndex === -1) return;
      if (!wordRefs.current[currentIndex] || !containerRef.current) return;

      const parentRect = containerRef.current.getBoundingClientRect();
      const activeElement = wordRefs.current[currentIndex];
      if (!activeElement) return;
      const activeRect = activeElement.getBoundingClientRect();

      setFocusRect({
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height
      });
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    const timer = setTimeout(updateRect, 80);
    return () => {
      window.removeEventListener('resize', updateRect);
      clearTimeout(timer);
    };
  }, [currentIndex, words.length]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) {
      setLastActiveIndex(index);
      setCurrentIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (manualMode) {
      if (lastActiveIndex !== null) {
        setCurrentIndex(lastActiveIndex);
      }
    }
  };

  return (
    <div className={`focus-container ${className}`} ref={containerRef}>
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        const customClass = wordClassName ? wordClassName(index, word) : '';
        const isAccent = customClass.includes('hero-word-accent');
        const shadowPrefix = isAccent ? 'drop-shadow(0 0 25px rgba(255, 255, 255, 0.25)) ' : '';
        const filterVal = isActive ? `${shadowPrefix}blur(0px)` : `${shadowPrefix}blur(${blurAmount}px)`;

        return (
          <span
            key={index}
            ref={el => {
              wordRefs.current[index] = el;
            }}
            className={`focus-word ${manualMode ? 'manual' : ''} ${isActive && !manualMode ? 'active' : ''} ${customClass}`}
            style={{
              filter: filterVal,
              ['--border-color' as any]: borderColor,
              ['--glow-color' as any]: glowColor,
              transition: `filter ${animationDuration}s cubic-bezier(0.16, 1, 0.3, 1)`
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="focus-frame"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 && focusRect.width > 0 ? 1 : 0
        }}
        transition={{
          duration: animationDuration,
          ease: [0.22, 1, 0.36, 1]
        }}
        style={{
          ['--border-color' as any]: borderColor,
          ['--glow-color' as any]: glowColor
        }}
      >
        <span className="corner top-left"></span>
        <span className="corner top-right"></span>
        <span className="corner bottom-left"></span>
        <span className="corner bottom-right"></span>
      </motion.div>
    </div>
  );
};

export default TrueFocus;
