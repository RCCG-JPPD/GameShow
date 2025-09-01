// src/components/display/QuestionView.jsx
import React from "react";
import CircularCountdown from "../shared/CircularCountdown.jsx";
import AutoFitText from "./AutoFitText.jsx";

export default function QuestionView({ meta, qs, timer, buzzer }) {
  const q = qs?.[meta?.current?.questionId] || null;
  const isSteal = meta?.current?.phase === "steal";
  if (!q) {
    return (
      <div className="fade-in" style={{ color: "#111", padding: "2rem" }}>
        Waiting for question…
      </div>
    );
  }

  // Full-screen canvas; overlays for timer/banner so the text area can be a clean 80vh.
  const wrap = {
    position: "relative",
    width: "100vw",
    height: "100vh",
    background: "#fff",
    color: "#111",
    overflow: "hidden",
  };

  // The text box is exactly 80% of the viewport height and centered vertically.
  const textBox = {
    position: "absolute",
    top: "10vh",              // 10% top margin
    bottom: "10vh",           // 10% bottom margin  => 80% total height
    left: "6vw",
    right: "6vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 0,             // allow shrinking in all browsers
    overflow: "hidden",
  };

  const timerBox = {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 3,
    pointerEvents: "none",
  };

  const banner = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    textAlign: "center",
    fontWeight: 700,
    fontSize: "clamp(14px, 1.6vw, 22px)",
    color: "#fff",
    background: buzzer?.open ? "#198754" : "#6c757d",
    padding: "0.4rem 1rem",
    zIndex: 2,
  };

  return (
    <div className="question-view fade-in" style={wrap}>
      {/* Timer overlay */}
      <div style={timerBox}>
        <CircularCountdown
          running={timer?.running}
          startedAt={timer?.startedAt}
          durationSec={timer?.durationSec}
          remainingSec={timer?.remainingSec}
        />
      </div>

      {/* Optional steal banner */}
      {isSteal && (
        <div style={banner}>
          {buzzer?.open ? "BUZZERS OPEN — First buzz wins" : "Buzzers closed"}
        </div>
      )}

      {/* 80% of the screen, centered. AutoFitText grows until it *just* fits. */}
      <div style={textBox}>
        <AutoFitText
          text={q.question}
          minPx={24}
          maxPx={1200}       // high cap so long screens can get very large
          lineHeight={1.12}
          weight={900}
          align="center"
        />
      </div>
    </div>
  );
}
