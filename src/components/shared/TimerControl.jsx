import React, { useMemo } from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { startTimer, pauseTimer, resetTimer, plus5 } from "../../rtdb/actions.js";

export default function TimerControl({ timer }) {
  const { running, mode, durationSec, startedAt, remainingSec } = timer || {};
  const left = useMemo(() => {
    if (!running || !startedAt) return remainingSec ?? durationSec ?? 0;
    const elapsed = (Date.now() - startedAt) / 1000;
    return Math.max(0, (durationSec ?? 0) - elapsed);
  }, [running, startedAt, durationSec, remainingSec]);

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="me-2">Timer: {mode} — {Math.ceil(left)}s</div>
      <ButtonGroup>
        <Button variant="success" onClick={() => startTimer(mode, durationSec)} disabled={running}>Start</Button>
        <Button variant="warning" onClick={() => pauseTimer(Math.ceil(left))} disabled={!running}>Pause</Button>
        <Button variant="secondary" onClick={() => plus5(Math.ceil(left))}>+5s</Button>
        <Button variant="outline-danger" onClick={() => resetTimer(durationSec)}>Reset</Button>
      </ButtonGroup>
    </div>
  );
}
