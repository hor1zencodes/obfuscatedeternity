"use client";

import React, { useState, useEffect } from "react";
import { motion, HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

interface RandomLetterSwapProps extends Omit<HTMLMotionProps<"span">, "children"> {
  label: string;
  staggerDuration?: number;
}

export function RandomLetterSwap({
  label,
  staggerDuration = 0.025,
  className,
  ...props
}: RandomLetterSwapProps) {
  const [text, setText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      setText(label);
      return;
    }
    
    let iterations = 0;
    const interval = setInterval(() => {
      setText((current) =>
        current
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return label[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      if (iterations >= label.length) {
        clearInterval(interval);
      }
      iterations += 1;
    }, staggerDuration * 1000);

    return () => clearInterval(interval);
  }, [isHovered, label, staggerDuration]);

  return (
    <motion.span
      className={cn("inline-block whitespace-pre", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {text}
    </motion.span>
  );
}
