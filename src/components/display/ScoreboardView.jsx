import React from "react";
import { fmtScore } from "../../utils/format.js";

export default function ScoreboardView({ teams }) {
  const entries = Object.entries(teams||{}).filter(([,t])=>t.active);
  return (
    <div className="scoreboard-view fade-in">
      <table className="scoreboard-table">
        <thead><tr><th>Team</th><th>Score</th></tr></thead>
        <tbody>
          {entries.map(([c,t])=>(
            <tr key={c}>
              <td style={{ backgroundColor:c, color:"#fff", fontWeight:700 }}>{c}</td>
              <td>{fmtScore(Number(t.score||0))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
