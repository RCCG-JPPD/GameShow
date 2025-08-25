import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { db } from "../../../firebase";
import { ref, onValue } from "firebase/database";
import { p } from "../../../rtdb/paths.js";
import { undoLast, redoLast } from "../../../utils/audit.js";

export default function AuditTab() {
  const [last, setLast] = useState(null);
  const [redo, setRedo] = useState(null);
  useEffect(()=> onValue(ref(db, `${p.audit}/last`), s=>setLast(s.val()||null)),[]);
  useEffect(()=> onValue(ref(db, `${p.audit}/redo`), s=>setRedo(s.val()||null)),[]);

  return (
    <div className="d-flex gap-2">
      <Button variant="outline-danger" disabled={!last} onClick={()=>undoLast(p.GAME_ROOT)}>Undo</Button>
      <Button variant="outline-primary" disabled={!redo} onClick={()=>redoLast(p.GAME_ROOT)}>Redo</Button>
    </div>
  );
}
