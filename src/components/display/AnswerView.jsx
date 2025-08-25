import React from "react";

export default function AnswerView({ meta, qs }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) return <div className="fade-in">No answer</div>;
  return (
    <div className="answer-view fade-in">
      <div className="answer-text">{q.answer}</div>
      {q.source && <div className="answer-source">{q.source}</div>}
    </div>
  );
}
