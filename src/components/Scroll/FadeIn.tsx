"use client";

import { ReactNode, useEffect, useRef } from "react";
import { inView, useReducedMotion } from "motion/react";
import { animate } from "motion/mini";

interface FadeInProps {
  children: ReactNode;
  className?: string;
}

// Fades and rises 24px the first time it scrolls into view. The server HTML is
// fully visible: content only hides after hydration, and only if it is still
// below the fold, so nothing disappears without JavaScript.
export function FadeIn({ children, className }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reduceMotion) return;
    if (element.getBoundingClientRect().top < window.innerHeight) return;

    element.style.opacity = "0";
    element.style.transform = "translateY(24px)";
    const stop = inView(
      element,
      () => {
        animate(
          element,
          { opacity: [0, 1], transform: ["translateY(24px)", "none"] },
          { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        );
        stop();
      },
      { amount: 0.2 }
    );
    return stop;
  }, [reduceMotion]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
