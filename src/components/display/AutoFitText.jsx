// src/components/display/AutoFitText.jsx
import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * AutoFitText
 * - Grows/shrinks font-size (binary search) so the text fills the container without overflow.
 * - Loop-safe ResizeObserver: disconnects during measurement to avoid RO recursion warnings.
 *
 * Props:
 *   text: string (required)
 *   minPx: number (default 18)
 *   maxPx: number (default 120)
 *   lineHeight: number (default 1.2)
 *   weight: number|string (default 700)
 *   align: "left" | "center" | "right" (default "center")
 */
export default function AutoFitText({
  text,
  minPx = 18,
  maxPx = 120,
  lineHeight = 1.2,
  weight = 700,
  align = "center",
}) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [appliedSize, setAppliedSize] = useState(minPx);

  const roRef = useRef(null);
  const rafRef = useRef(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    const fits = () =>
      el.scrollHeight <= container.clientHeight &&
      el.scrollWidth <= container.clientWidth;

    const measure = () => {
      // Skip if container has no size yet (e.g., hidden tab)
      if (container.clientWidth === 0 || container.clientHeight === 0) return;

      let lo = minPx;
      let hi = Math.max(minPx, maxPx);
      let best = lo;

      // Ensure measurement styles are applied
      el.style.lineHeight = String(lineHeight);
      el.style.fontWeight = String(weight);
      el.style.whiteSpace = "normal";
      el.style.wordBreak = "break-word";
      el.style.hyphens = "auto";

      // Binary search largest size that fits
      for (let i = 0; i < 14 && lo <= hi; i++) {
        const mid = Math.floor((lo + hi) / 2);
        if (Number(el.style.fontSize.replace("px", "")) !== mid) {
          el.style.fontSize = `${mid}px`;
          // Force layout after change (ESLint-friendly)
          el.getBoundingClientRect();
        }

        if (fits()) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      if (Number(el.style.fontSize.replace("px", "")) !== best) {
        el.style.fontSize = `${best}px`;
      }
      setAppliedSize(best);
    };

    const safeMeasure = () => {
      // Prevent RO loop: disconnect during writes
      if (roRef.current) roRef.current.disconnect();
      try {
        measure();
      } finally {
        if (roRef.current && container) roRef.current.observe(container);
      }
    };

    // Initial measure
    safeMeasure();

    // Throttled RO callback via rAF
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(safeMeasure);
    };

    roRef.current = new ResizeObserver(onResize);
    roRef.current.observe(container);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (roRef.current) roRef.current.disconnect();
    };
  }, [text, minPx, maxPx, lineHeight, weight]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent:
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
      }}
    >
      <div
        ref={textRef}
        style={{
          width: "100%",
          textAlign: align,
          fontSize: `${appliedSize}px`,
          lineHeight,
          fontWeight: weight,
        }}
      >
        {text}
      </div>
    </div>
  );
}