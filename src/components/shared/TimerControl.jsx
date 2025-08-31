// src/components/shared/TimerControl.jsx
import React, { useMemo, useState, useEffect } from "react";
import { ButtonGroup, Button } from "react-bootstrap";
import { startTimer, pauseTimer, resetTimer, plus5 } from "../../rtdb/actions.js";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";

export default function TimerControl({ timer }) {
  const { running, mode, durationSec, startedAt, remainingSec } = timer || {};

  // server offset keeps everyone consistent
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const offRef = ref(db, ".info/serverTimeOffset");
    return onValue(offRef, (s) => setOffset(Number(s.val() || 0)));
  }, []);

  const left = useMemo(() => {
    if (!running || !startedAt) return remainingSec ?? durationSec ?? 0;
    const serverNow = Date.now() + offset;
    const elapsed = (serverNow - startedAt) / 1000;
    return Math.max(0, (durationSec ?? 0) - elapsed);
  }, [running, startedAt, durationSec, remainingSec, offset]);

  const [busy, setBusy] = useState(false);
  const ceilLeft = Math.ceil(left || 0);

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="me-2">Timer: {mode} — {ceilLeft}s</div>
      <ButtonGroup>
        {/* Start resumes from the paused second */}
        <Button
          variant="success"
          onClick={async () => { setBusy(true); try { await startTimer(mode, Math.max(1, ceilLeft)); } finally { setBusy(false); } }}
          disabled={running || busy || ceilLeft <= 0}
        >
          Start
        </Button>
        <Button
          variant="warning"
          onClick={async () => { setBusy(true); try { await pauseTimer(ceilLeft); } finally { setBusy(false); } }}
          disabled={!running || busy}
        >
          Pause
        </Button>
        <Button
          variant="secondary"
          onClick={async () => { setBusy(true); try { await plus5(ceilLeft); } finally { setBusy(false); } }}
          disabled={busy}
        >
          +5s
        </Button>
        <Button
          variant="outline-danger"
          onClick={async () => { setBusy(true); try { await resetTimer(durationSec); } finally { setBusy(false); } }}
          disabled={busy}
        >
          Reset
        </Button>
      </ButtonGroup>
    </div>
  );
}
