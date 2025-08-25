import React from "react";
import { Button, Table, Form } from "react-bootstrap";
import { openBuzzers, closeBuzzers, setBlocked, resetPerQuestionBlocks } from "../../../rtdb/actions.js";

export default function BuzzerTab({ teams, buzzer }) {
  const actives = Object.entries(teams||{}).filter(([,t])=>t.active);

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex gap-2">
        <Button onClick={openBuzzers}>Open Buzzers</Button>
        <Button variant="secondary" onClick={closeBuzzers}>Close Buzzers</Button>
        <Button variant="warning" onClick={resetPerQuestionBlocks}>Reset Blocks (this question)</Button>
      </div>
      <Table size="sm" bordered>
        <thead><tr><th>Team</th><th>Blocked (this question)</th></tr></thead>
        <tbody>
          {actives.map(([c,t])=>(
            <tr key={c}>
              <td style={{ backgroundColor: c, color: "white" }}>{c}</td>
              <td>
                <Form.Check type="switch" checked={!!t.blockedCurrent} onChange={e=>setBlocked(c, e.target.checked)} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div>Winner: <strong>{buzzer?.winner || "—"}</strong></div>
    </div>
  );
}
