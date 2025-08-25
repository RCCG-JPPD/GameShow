import React, { useMemo } from "react";
import { Alert, Button, ButtonGroup, Row, Col } from "react-bootstrap";
import TimerControl from "../../shared/TimerControl.jsx";
import CircularCountdown from "../../shared/CircularCountdown.jsx";
import { startStealPhase, judgment, endQuestion, openBuzzers, closeBuzzers } from "../../../rtdb/actions.js";
import { halfPoints, fmtScore } from "../../../utils/format.js";

export default function QuestionTab({ meta, timer, teams, buzzer, qs }) {
  const cur = meta?.current || {};
  const q = qs[cur?.questionId] || null;
  const selectingTeam = cur?.selectingTeam;

  if (!q) return <Alert variant="secondary">No active question selected.</Alert>;

  const firstSec = meta?.timers?.firstAttemptSec ?? 35;
  const stealSec = meta?.timers?.stealSec ?? 20;
  const isSteal = cur?.phase === "steal";

  return (
    <Row className="g-3">
      <Col md={8}>
        <div className="p-3 bg-dark text-light rounded position-relative">
          <div className="position-absolute top-0 end-0 m-2">
            <CircularCountdown running={timer?.running} startedAt={timer?.startedAt} durationSec={timer?.durationSec} remainingSec={timer?.remainingSec}/>
          </div>
          <div className="small text-info mb-2">{isSteal ? "Steal phase (one window for all steals)" : `First attempt — ${selectingTeam}`}</div>
          <div className="fs-3">{q.question}</div>
        </div>
      </Col>
      <Col md={4} className="d-flex flex-column gap-2">
        <TimerControl timer={timer} />

        {!isSteal ? (
          <>
            <div className="d-flex gap-2">
              <Button variant="success" onClick={async ()=>{
                await judgment({ team: selectingTeam, kind: "correct", points: q.points });
                await endQuestion({ revealAnswer: true });
              }}>Correct (+{q.points})</Button>
              <Button variant="outline-warning" onClick={async ()=>{
                await judgment({ team: selectingTeam, kind: "partial", points: q.points }); // ends question
                await endQuestion({ revealAnswer: true });
              }}>Partial (+{halfPoints(q.points)})</Button>
              <Button variant="danger" onClick={async ()=>{
                await startStealPhase(stealSec, selectingTeam);
                await openBuzzers();
              }}>Wrong → Steals</Button>
            </div>
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={()=>endQuestion({ revealAnswer: true })}>Reveal (0)</Button>
              <Button variant="outline-secondary" onClick={()=>endQuestion({ revealAnswer: false })}>Skip (0)</Button>
            </div>
          </>
        ) : (
          <>
            <Alert variant={buzzer?.open ? "info" : "secondary"} className="py-2">
              {buzzer?.open ? "Buzzers OPEN — first buzz wins" : "Buzzers CLOSED"}
            </Alert>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={openBuzzers}>Open Buzzers</Button>
              <Button variant="outline-dark" onClick={closeBuzzers}>Close Buzzers</Button>
            </div>
            {buzzer?.winner && (
              <div className="d-flex gap-2">
                <Button variant="success" onClick={async ()=>{
                  await judgment({ team: buzzer.winner, kind: "correct", points: q.points / 2 });
                  await endQuestion({ revealAnswer: true });
                }}>
                  {buzzer.winner} Correct (+{fmtScore(q.points/2)})
                </Button>
                <Button variant="danger" onClick={async ()=>{
                  // auto-block handled on player; encourage manual toggle if needed
                }}>
                  Mark Wrong (block stays)
                </Button>
              </div>
            )}
            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={()=>endQuestion({ revealAnswer: true })}>Reveal (0)</Button>
              <Button variant="outline-secondary" onClick={()=>endQuestion({ revealAnswer: false })}>Skip (0)</Button>
            </div>
          </>
        )}
      </Col>
    </Row>
  );
}
