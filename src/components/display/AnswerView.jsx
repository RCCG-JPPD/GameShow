// src/components/display/AnswerView.jsx
import React from "react";
import AutoFitText from "./AutoFitText.jsx";

export default function AnswerView({ meta, qs }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) return <div className="fade-in" style={{ padding: "2rem", color:"#111" }}>No answer</div>;

  // Large, readable layout: question (smaller) + answer (auto-fit big) + optional image + source
  const wrap = {
    width: "100vw",
    minHeight: "100vh",
    background: "#fff",
    color: "#111",
    padding: "3vh 4vw",
    display: "grid",
    gridTemplateRows: q.answerImageUrl ? "auto minmax(0, 50vh) auto auto" : "auto minmax(0, 70vh) auto",
    gap: "2vh",
  };

  const imgStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    justifySelf: "center",
    alignSelf: "center",
  };

  const sourceStyle = { fontSize: "clamp(14px,1.2vw,18px)", color: "#0d6efd" };

  return (
    <div className="answer-view fade-in" style={wrap}>
      {/* Question (smaller, still bold) */}
      <div style={{ minHeight: "3.5rem" }}>
        <AutoFitText text={q.question} minPx={24} maxPx={64} lineHeight={1.2} weight={800} align="left" />
      </div>

      {/* Answer image (optional) */}
      {q.answerImageUrl && <img src={q.answerImageUrl} alt="answer" style={imgStyle} />}

      {/* Big answer text (auto-fits the allocated row) */}
      <div>
        <AutoFitText text={q.answer} minPx={36} maxPx={200} lineHeight={1.12} weight={900} align="left" />
      </div>

      {/* Source (optional) */}
      {q.source && <div style={sourceStyle}>{q.source}</div>}
    </div>
  );
}
