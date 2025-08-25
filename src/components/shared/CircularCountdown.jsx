import React, { useEffect, useMemo, useState } from "react";

export default function CircularCountdown({ running, startedAt, durationSec, remainingSec }) {
  // derive remaining if running
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  let remain = remainingSec;
  if (running && startedAt) {
    const elapsed = (now - startedAt) / 1000;
    remain = Math.max(0, durationSec - elapsed);
  }
  const pct = Math.max(0, Math.min(1, remain / durationSec));
  const dash = 283 * pct; // 2 * PI * r (r=45)
  return (
    <div className="countdown-wrapper">
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" stroke="#333" strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r="45"
          stroke="#0d6efd" strokeWidth="8" fill="none"
          strokeDasharray="283"
          strokeDashoffset={283 - dash}
          transform="rotate(-90 50 50)"
        />
        <text x="50" y="55" textAnchor="middle" fontSize="22" fill="#fff">
          {Math.ceil(remain)}
        </text>
      </svg>
    </div>
  );
}
