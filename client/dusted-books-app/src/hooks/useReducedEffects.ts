import { useEffect, useState } from "react";

/**
 * True when the user has explicitly requested reduced motion via their OS/browser
 * settings. Used to skip GSAP entrance animations and Ken Burns zoom that can
 * cause motion sickness.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(motion.matches);
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * True on mobile/small screens where expensive GPU effects (Ken Burns transform
 * on full-screen images, will-change layers) cause lag. The carousel still
 * rotates, but each slide stays static instead of zooming.
 */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 640px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}
