import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { db } from "../../firebase";
import { ref, onValue } from "firebase/database";
import { p } from "../../rtdb/paths.js";
import { TEAM_COLORS } from "../../utils/constants.js";

export default function TeamSelection() {
  const [teams, setTeams] = useState({});
  useEffect(()=> onValue(ref(db, p.teams), s=>setTeams(s.val()||{})), []);
  const activeColors = TEAM_COLORS.filter(c => teams?.[c]?.active);

  return (
    <div className="d-flex flex-column align-items-center gap-3">
      <h3>Select Your Team</h3>
      <div className="d-flex gap-2 flex-wrap">
        {activeColors.map(c=>(
          <Button key={c} style={{ backgroundColor: c, border:"none" }} onClick={()=>{ localStorage.setItem("team", c); window.location.reload(); }}>
            {c}
          </Button>
        ))}
      </div>
    </div>
  );
}
