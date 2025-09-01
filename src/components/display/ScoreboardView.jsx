import React, { useEffect, useMemo, useState } from "react";
import { fmtScore } from "../../utils/format.js";

export default function ScoreboardView({ teams }) {
  const entries = useMemo(
    () => Object.entries(teams || {}).filter(([, t]) => t.active),
    [teams]
  );

  const scores = entries.map(([, t]) => Number(t.score || 0));
  const maxScore = Math.max(1, ...scores); // avoid divide-by-zero

  // Local state to animate heights from 0 -> pct
  const [heights, setHeights] = useState({});
  useEffect(() => {
    // Start at zero for smooth animation
    const zeros = Object.fromEntries(entries.map(([c]) => [c, 0]));
    setHeights(zeros);

    // Next frame: set to actual % heights
    const id = requestAnimationFrame(() => {
      const next = Object.fromEntries(
        entries.map(([c, t]) => [c, Math.min(100, (Number(t.score || 0) / maxScore) * 100)])
      );
      setHeights(next);
    });
    return () => cancelAnimationFrame(id);
  }, [entries, maxScore]);

  // Bright, large layout
  const wrap = {
    width: "100vw",
    height: "100vh",
    background: "#fff",
    display: "grid",
    gridTemplateRows: "auto 1fr",
    color: "#111",
  };

  const titleRow = {
    padding: "1rem 2rem",
    borderBottom: "1px solid #e9eef4",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: `repeat(${Math.max(2, entries.length)}, 1fr)`,
    gap: "2vw",
    padding: "4vh 4vw",
    alignItems: "end",
  };

  const column = {
    display: "grid",
    gridTemplateRows: "1fr auto auto", // bar, score, label
    alignItems: "end",
    justifyItems: "center",
    minWidth: 0,
  };

  const barWrap = {
    width: "100%",
    height: "60vh",
    background: "#f2f6fb",
    borderRadius: 12,
    boxShadow: "inset 0 0 0 1px #e2e8f0",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  };

  const scoreStyle = { fontSize: "clamp(20px, 2.2vw, 36px)", fontWeight: 900 };
  const labelStyle = { fontSize: "clamp(16px, 1.6vw, 24px)", fontWeight: 700 };

  return (
    <div className="scoreboard-view fade-in" style={wrap}>
      <div style={titleRow}>
        <div style={{ fontSize: "clamp(18px, 1.6vw, 24px)", fontWeight: 700 }}>Scoreboard</div>
        <div style={{ opacity: 0.7, fontSize: "clamp(12px, 1vw, 16px)" }}>
          Bars animate to current totals
        </div>
      </div>

      <div style={grid}>
        {entries.map(([color, t]) => {
          const pct = heights[color] ?? 0;
          return (
            <div key={color} style={column}>
              <div style={barWrap} aria-label={`${color} score ${fmtScore(Number(t.score || 0))}`}>
                <div
                  style={{
                    width: "100%",
                    height: `${pct}%`,
                    background: color, // team color
                    transition: "height 800ms ease",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.08) inset",
                  }}
                />
              </div>
              <div style={scoreStyle}>{fmtScore(Number(t.score || 0))}</div>
              <div style={labelStyle}>{color}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
