import { useCallback, useEffect, useRef } from "react";

interface UseDwellClickOptions {
  dwellTime: number; // in milliseconds
  enabled: boolean;
  onDwell: () => void;
}

export function useDwellClick({
  dwellTime,
  enabled,
  onDwell,
}: UseDwellClickOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    startTimeRef.current = null;
    if (progressRef.current) {
      progressRef.current.style.width = "0%";
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      if (!startTimeRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / dwellTime) * 100, 100);
      if (progressRef.current) {
        progressRef.current.style.width = `${pct}%`;
      }
      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateProgress);

    timerRef.current = setTimeout(() => {
      onDwell();
      clearTimer();
    }, dwellTime);
  }, [enabled, dwellTime, onDwell, clearTimer]);

  const handleMouseLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    progressRef,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
}
