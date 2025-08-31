// src/components/display/QuestionView.jsx
import React from "react";
import CircularCountdown from "../shared/CircularCountdown.jsx";
import AutoFitText from "./AutoFitText.jsx";

export default function QuestionView({ meta, qs, timer, buzzer }) {
  const q = qs?.[meta?.current?.questionId] || null;
  const isSteal = meta?.current?.phase === "steal";
  if (!q) return <div className="fade-in" style={{ color: "#111", padding: "2rem" }}>Waiting for question…</div>;

  const wrap = {
    width: "100vw",
    height: "100vh",
    display: "grid",
    gridTemplateRows: "auto auto 1fr", // header, statusRow, content
    background: "#fff",
    color: "#111",
  };

  const header = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0.5rem 1rem",
    minHeight: 96,
    borderBottom: "1px solid #dfe6ef",
    background: "#fff",
  };

  // SINGLE compact row that contains both the banner and small winner chip
  const statusRow = {
    display: isSteal ? "flex" : "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.4rem",
    padding: "0.25rem 1rem",
    background: "#fff",
  };

  const banner = {
    width: "100%",
    padding: "0.4rem 1rem",
    textAlign: "center",
    fontSize: "clamp(13px, 1.4vw, 20px)",
    fontWeight: 700,
    color: "#fff",
    background: buzzer?.open ? "#198754" : "#6c757d",
    borderRadius: 4,
  };

  const winnerChip = {
    display: buzzer?.winner ? "inline-block" : "none",
    padding: "0.2rem 0.6rem",
    borderRadius: 999,
    fontSize: "clamp(14px, 1.4vw, 20px)",
    fontWeight: 800,
    background: buzzer?.winner || "#0d6efd",
    color: "#fff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
  };

  const content = {
    position: "relative",
    padding: "3vh 4vw",
    overflow: "hidden",
    background: "#fff",
    display: "grid",
    gridTemplateRows: q.questionImageUrl ? "minmax(0, 40%) 1fr" : "1fr",
    gap: "2vh",
  };

  const imgStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    justifySelf: "center",
    alignSelf: "center",
  };

  return (
    <div className="question-view fade-in" style={wrap}>
      {/* Header with timer */}
      <div style={header}>
        <CircularCountdown
          running={timer?.running}
          startedAt={timer?.startedAt}
          durationSec={timer?.durationSec}
          remainingSec={timer?.remainingSec}
        />
      </div>

      {/* Status row (one compact row prevents giant red “pill”) */}
      <div style={statusRow}>
        <div style={banner}>{buzzer?.open ? "BUZZERS OPEN — First buzz wins" : "Buzzers closed"}</div>
        <div style={winnerChip}>{buzzer?.winner ? `${buzzer.winner.toUpperCase()} BUZZED` : ""}</div>
      </div>

      {/* Question area */}
      <div style={content}>
        {q.questionImageUrl && <img src={q.questionImageUrl} alt="question" style={imgStyle} />}
        <AutoFitText text={q.question} minPx={22} maxPx={160} lineHeight={1.18} weight={800} align="left" />
      </div>
    </div>
  );
}
