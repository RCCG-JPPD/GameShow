import React from "react";
import AutoFitText from "./AutoFitText.jsx";

export default function AnswerView({ meta, qs }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) {
    return (
      <div className="fade-in" style={{ color: "#111", padding: "2rem" }}>
        No answer
      </div>
    );
  }

  const hasAnswerImg   = !!(q.answerImageUrl   && String(q.answerImageUrl).trim());
  const hasQuestionImg = !!(q.questionImageUrl && String(q.questionImageUrl).trim());

  // Row heights + gap add to exactly 100vh (no cropping)
  const GAP_VH = 2;
  const wrap = {
    width: "100vw",
    height: "100vh",
    background: "#fff",
    color: "#111",
    overflow: "hidden",
    display: "grid",
    gridTemplateRows: `30vh 50vh calc(20vh - ${GAP_VH * 2}vh)`,
    gap: `${GAP_VH}vh`,
    padding: "0 6vw",
  };

  const rowFlexCenter = {
    minHeight: 0,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const fill = { width: "100%", height: "100%" };

  const img = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    display: "block",
    borderRadius: 12,
    boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
    background: "#fff",
  };

  return (
    <div className="answer-view fade-in" style={wrap}>
      {/* 30vh — Question text */}
      <div style={rowFlexCenter}>
        <div style={fill}>
          <AutoFitText
            text={q.question}
            minPx={18}
            maxPx={3000}
            lineHeight={1.1}
            weight={700}
            align="center"
          />
        </div>
      </div>

      {/* 50vh — Answer row */}
      {hasAnswerImg ? (
        // Side-by-side: image | text (text intentionally smaller via shrinkPct)
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2vw",
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          <div style={{ minWidth: 0, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={q.answerImageUrl}
              alt="answer visual"
              style={img}
              loading="eager"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>

          <div style={{ minWidth: 0, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...fill, padding: "3vh 2vw" }}>
              <AutoFitText
                text={q.answer}
                minPx={16}
                maxPx={2000}
                lineHeight={1.08}
                weight={900}
                align="center"
                shrinkPct={0.75}   // <— make the answer text smaller when sharing space with an image
              />
            </div>
          </div>
        </div>
      ) : (
        // Full-width answer text (no image)
        <div style={rowFlexCenter}>
          <div style={fill}>
            <AutoFitText
              text={q.answer}
              minPx={22}
              maxPx={5000}
              lineHeight={1.06}
              weight={900}
              align="center"
            />
          </div>
        </div>
      )}

      {/* Bottom media row — only show question image here if no answer image */}
      <div
        style={{
          width: "100%",
          height: "100%",
          minHeight: 0,
          display: !hasAnswerImg && hasQuestionImg ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {!hasAnswerImg && hasQuestionImg && (
          <img
            src={q.questionImageUrl}
            alt="question visual"
            style={img}
            loading="eager"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
      </div>
    </div>
  );
}
