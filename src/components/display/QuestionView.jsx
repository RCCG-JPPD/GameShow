import React from "react";
import CircularCountdown from "../shared/CircularCountdown.jsx";

export default function QuestionView({ meta, qs, timer }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) return <div className="fade-in">Waiting for question…</div>;
  return (
    <div className="question-view fade-in">
      <div className="timer-overlay">
        <CircularCountdown running={timer?.running} startedAt={timer?.startedAt} durationSec={timer?.durationSec} remainingSec={timer?.remainingSec}/>
      </div>
      <div className="question-text">{q.question}</div>
    </div>
  );
}
