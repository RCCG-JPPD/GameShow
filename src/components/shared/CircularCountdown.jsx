// src/components/shared/CircularCountdown.jsx
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function CircularCountdown({ running, startedAt, durationSec, remainingSec }) {
  // server time offset
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const offRef = ref(db, ".info/serverTimeOffset");
    return onValue(offRef, (s) => setOffset(Number(s.val() || 0)));
  }, []);

  // tick
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  // derive remaining (use server-corrected clock when running)
  let remain = remainingSec ?? durationSec ?? 0;
  if (running && startedAt && durationSec) {
    const serverNow = now + offset;
    const elapsed = (serverNow - startedAt) / 1000;
    remain = Math.max(0, durationSec - elapsed);
  }
  const pct = Math.max(0, Math.min(1, (durationSec || 0) ? remain / durationSec : 0));
  const dash = 283 * pct; // 2 * PI * r (r=45)

  return (
    <div className="countdown-wrapper">
      <svg width="120" height="120" viewBox="0 0 100 100">
        {/* Light track for bright theme */}
        <circle cx="50" cy="50" r="45" stroke="#e9ecef" strokeWidth="8" fill="none" />
        {/* Blue progress */}
        <circle
          cx="50" cy="50" r="45"
          stroke="#0d6efd" strokeWidth="8" fill="none"
          strokeDasharray="283"
          strokeDashoffset={283 - dash}
          transform="rotate(-90 50 50)"
        />
        {/* Dark text on white */}
        <text x="50" y="55" textAnchor="middle" fontSize="22" fill="#111">
          {Math.ceil(remain)}
        </text>
      </svg>
    </div>
  );
}
