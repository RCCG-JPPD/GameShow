// src/components/controller/tabs/QuestionTab.jsx
import React, { useState } from "react";
import { Alert, Button, Row, Col } from "react-bootstrap";
import TimerControl from "../../shared/TimerControl.jsx";
import CircularCountdown from "../../shared/CircularCountdown.jsx";
import { startStealPhase, judgment, endQuestion, openBuzzers, closeBuzzers, markStealWrongAndContinue } from "../../../rtdb/actions.js";
import { halfPoints, fmtScore } from "../../../utils/format.js";

export default function QuestionTab({ meta, timer, teams, buzzer, qs }) {
  const [busy, setBusy] = useState(false);
  const cur = meta?.current || {};
  const q = qs[cur?.questionId] || null;
  const selectingTeam = cur?.selectingTeam;

  if (!q) return <Alert variant="secondary">No active question selected.</Alert>;

  const stealSec = meta?.timers?.stealSec ?? 20;
  const isSteal = cur?.phase === "steal";

  return (
    <Row className="g-3">
      <Col md={8}>
        {/* Bright panel instead of dark */}
        <div className="p-3 bg-white text-dark rounded border position-relative">
          <div className="position-absolute top-0 end-0 m-2">
            <CircularCountdown running={timer?.running} startedAt={timer?.startedAt} durationSec={timer?.durationSec} remainingSec={timer?.remainingSec}/>
          </div>
          <div className="small text-primary mb-2">
            {isSteal ? "Steal phase (one window for all steals)" : `First attempt — ${selectingTeam}`}
          </div>
          <div className="fs-3">{q.question}</div>
        </div>
      </Col>

      <Col md={4} className="d-flex flex-column gap-2">
        <TimerControl timer={timer} />

        {!isSteal ? (
          <>
            <div className="d-flex gap-2">
              <Button variant="success" disabled={busy || cur.resolved} onClick={async ()=>{
                setBusy(true);
                try {
                  await judgment({ team: selectingTeam, kind: "correct", points: q.points });
                  await endQuestion({ revealAnswer: true });
                } finally { setBusy(false); }
              }}>Correct (+{q.points})</Button>

              <Button variant="outline-success" disabled={busy || cur.resolved} onClick={async ()=>{
                setBusy(true);
                try {
                  await judgment({ team: selectingTeam, kind: "partial", points: q.points });
                  await endQuestion({ revealAnswer: true });
                } finally { setBusy(false); }
              }}>Partial (+{halfPoints(q.points)})</Button>

              <Button variant="danger" disabled={busy} onClick={async ()=>{
                setBusy(true);
                try {
                  await startStealPhase(stealSec, selectingTeam);
                  await openBuzzers();
                } finally { setBusy(false); }
              }}>Wrong → Steals</Button>
            </div>

            <div className="d-flex gap-2">
              <Button variant="primary" disabled={busy} onClick={()=>endQuestion({ revealAnswer: true })}>Reveal (0)</Button>
              <Button variant="outline-secondary" disabled={busy} onClick={()=>endQuestion({ revealAnswer: false })}>Skip (0)</Button>
            </div>
          </>
        ) : (
          <>
            <Alert variant={buzzer?.open ? "success" : "secondary"} className="py-2">
              {buzzer?.open ? "Buzzers OPEN — first buzz wins" : "Buzzers CLOSED"}
            </Alert>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" disabled={busy} onClick={openBuzzers}>Open Buzzers</Button>
              <Button variant="outline-secondary" disabled={busy} onClick={closeBuzzers}>Close Buzzers</Button>
            </div>

            {buzzer?.winner && (
              <div className="d-flex flex-column gap-2">
                <Button variant="success" disabled={busy || cur.resolved} onClick={async ()=>{
                  setBusy(true);
                  try {
                    await judgment({ team: buzzer.winner, kind: "correct", points: q.points / 2 });
                    await endQuestion({ revealAnswer: true });
                  } finally { setBusy(false); }
                }}>
                  {buzzer.winner} Correct (+{fmtScore(q.points/2)})
                </Button>

                <Button variant="danger" disabled={busy} onClick={async ()=>{
                  setBusy(true);
                  try {
                    await markStealWrongAndContinue(buzzer.winner);
                  } finally { setBusy(false); }
                }}>
                  Mark Wrong (block stays)
                </Button>
              </div>
            )}

            <div className="d-flex gap-2">
              <Button variant="primary" disabled={busy} onClick={()=>endQuestion({ revealAnswer: true })}>Reveal (0)</Button>
              <Button variant="outline-secondary" disabled={busy} onClick={()=>endQuestion({ revealAnswer: false })}>Skip (0)</Button>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
}
