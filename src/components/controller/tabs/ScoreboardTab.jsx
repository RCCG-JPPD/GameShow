import React from "react";
import { Table, Form } from "react-bootstrap";
import { fmtScore } from "../../../utils/format.js";
import { db } from "../../../firebase";
import { ref, set } from "firebase/database";
import { p } from "../../../rtdb/paths.js";

export default function ScoreboardTab({ teams }) {
  const entries = Object.entries(teams || {}).filter(([,t])=>t.active);
  const order = entries.sort((a,b)=>0); // fixed color order from RTDB iteration

  return (
    <Table bordered hover responsive>
      <thead><tr><th>Team</th><th>Score</th><th>Manual Edit</th></tr></thead>
      <tbody>
        {order.map(([c, t])=>(
          <tr key={c}>
            <td style={{ backgroundColor: c, color: "white", fontWeight: 700 }}>{c}</td>
            <td>{fmtScore(Number(t.score||0))}</td>
            <td>
              <Form.Control type="number" step="0.5" defaultValue={Number(t.score||0)}
                onBlur={(e)=> set(ref(db, `${p.teams}/${c}/score`), Number(e.target.value||0))}/>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
