import React from "react";
import { Button } from "react-bootstrap";
import { moveToBoard } from "../../../rtdb/actions.js";

export default function AnswerTab({ meta, qs }) {
  const q = qs?.[meta?.current?.questionId] || null;
  if (!q) return <div>No answer to show.</div>;
  return (
    <div className="p-3 bg-dark text-light rounded">
      <div className="fs-2 mb-2">{q.answer}</div>
      {q.source && <div className="small text-muted">{q.source}</div>}
      <div className="mt-3">
        <Button onClick={moveToBoard}>Back to Board</Button>
      </div>
    </div>
  );
}
