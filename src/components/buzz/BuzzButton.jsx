import React, { useEffect, useState } from "react";
import { Button, Alert } from "react-bootstrap";
import { db } from "../../firebase";
import { ref, onValue, runTransaction } from "firebase/database";
import { p } from "../../rtdb/paths.js";

export default function BuzzButton({ team }) {
  const [blocked, setBlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState("idle");

  useEffect(()=> onValue(ref(db, `${p.teams}/${team}/blockedCurrent`), s=>setBlocked(!!s.val())), [team]);
  useEffect(()=> onValue(ref(db, `${p.buzzer}/open`), s=>setOpen(!!s.val())), []);
  useEffect(()=> onValue(ref(db, `${p.meta}/current/phase`), s=>setPhase(s.val()||"idle")), []);

  const buzz = async () => {
    if (!open || blocked || phase !== "steal") return;
    const buzzRef = ref(db, `${p.buzzer}/winner`);
    await runTransaction(buzzRef, cur => {
      if (!cur) return team;
      return cur; // someone already won
    });
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3">
      <h4>Your team: <span style={{color:team}}>{team}</span></h4>
      <Alert variant={open && !blocked && phase==="steal" ? "success" : "secondary"}>
        {open ? (blocked ? "You are blocked for this question" : "Buzzers OPEN") : "Buzzers CLOSED"}
      </Alert>
      <Button size="lg" style={{ backgroundColor:team, border:"none" }} disabled={!open || blocked || phase!=="steal"} onClick={buzz}>
        BUZZ
      </Button>
      <Button variant="link" onClick={()=>{ localStorage.removeItem("team"); window.location.reload();}}>Change team</Button>
    </div>
  );
}
