import React from "react";
import AutoFitText from "./AutoFitText.jsx";

export default function AnswerView({ meta, qs }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) return <div className="fade-in" style={{ color: "#111", padding: "2rem" }}>No answer</div>;

  // 30vh for the question + 50vh for the answer = 80vh of vertical fill
  const wrap = {
    width: "100vw",
    height: "100vh",
    background: "#fff",
    color: "#111",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: "30vh 50vh 1fr",
    gap: "4vh",
    padding: "6vh 6vw",
  };

  const slot = {
    minHeight: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const inner = { width: "100%", height: "100%" };

  return (
    <div className="answer-view fade-in" style={wrap}>
      {/* 30vh — question (smaller but still fills its box) */}
      <div style={slot}>
        <div style={inner}>
          <AutoFitText
            text={q.question}
            minPx={18}
            maxPx={3000}
            lineHeight={1.1}
            weight={700}
            align="center"
            breakWords={false}
          />
        </div>
      </div>

      {/* 50vh — answer (bigger; aggressively fills) */}
      <div style={slot}>
        <div style={inner}>
          <AutoFitText
            text={q.answer}
            minPx={22}
            maxPx={5000}
            lineHeight={1.06}
            weight={900}
            align="center"
            breakWords={false}
          />
        </div>
      </div>

      {/* Spare space for images/source if you add later */}
      <div style={{ minHeight: 0 }} />
    </div>
  );
}
