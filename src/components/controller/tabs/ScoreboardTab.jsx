import React from "react";
import { Table, Form, Button, ButtonGroup } from "react-bootstrap";
import { fmtScore } from "../../../utils/format.js";
import { db } from "../../../firebase";
import { ref, set } from "firebase/database";
import { p } from "../../../rtdb/paths.js";
import { setDisplayView } from "../../../rtdb/actions.js";

export default function ScoreboardTab({ teams }) {
  const entries = Object.entries(teams || {}).filter(([, t]) => t.active);
  const order = entries.sort((a, b) => 0); // fixed color order from RTDB iteration

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <div className="fw-bold">Scores</div>
        <ButtonGroup>
          <Button variant="outline-secondary" onClick={() => setDisplayView("board")}>Back to Board</Button>
          <Button variant="primary" onClick={() => setDisplayView("scoreboard")}>Show on Display</Button>
        </ButtonGroup>
      </div>

      <Table bordered hover responsive>
        <thead><tr><th>Team</th><th>Score</th><th>Manual Edit</th></tr></thead>
        <tbody>
          {order.map(([c, t]) => (
            <tr key={c}>
              <td style={{ backgroundColor: c, color: "white", fontWeight: 700 }}>{c}</td>
              <td>{fmtScore(Number(t.score || 0))}</td>
              <td>
                <Form.Control
                  type="number"
                  step="0.5"
                  defaultValue={Number(t.score || 0)}
                  onBlur={(e) => set(ref(db, `${p.teams}/${c}/score`), Number(e.target.value || 0))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
