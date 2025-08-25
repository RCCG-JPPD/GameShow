import React, { useMemo, useState } from "react";
import { Button, ButtonGroup, Form, Row, Col, Table, InputGroup } from "react-bootstrap";
import { TEAM_COLORS, MAX_CATEGORIES, MAX_QUESTIONS_PER_CATEGORY } from "../../../utils/constants.js";
import { setActiveTeams, setTimersDefaults, createCategory, renameCategory, deleteCategory, createQuestion, updateQuestion, deleteQuestion, resetGameKeepQuestions } from "../../../rtdb/actions.js";

export default function SetupTab({ meta, teams, cats }) {
  const [first, setFirst] = useState(meta?.timers?.firstAttemptSec ?? 35);
  const [steal, setSteal] = useState(meta?.timers?.stealSec ?? 20);
  const enabledOrder = meta?.turn?.order || [];
  const [teamOrder, setTeamOrder] = useState(enabledOrder.length ? enabledOrder : TEAM_COLORS.slice(0,2));

  const catList = useMemo(
    () => Object.entries(cats || {}).sort((a,b) => (a[1].order ?? 0) - (b[1].order ?? 0)),
    [cats]
  );

  const toggleTeam = (color) => {
    const has = teamOrder.includes(color);
    let next = has ? teamOrder.filter(c => c !== color) : [...teamOrder, color];
    // cap 5, min 2
    if (next.length < 2) return;
    if (next.length > 5) next = next.slice(0,5);
    setTeamOrder(next);
  };

  return (
    <div className="p-2">
      <h5>Teams (2–5)</h5>
      <div className="d-flex gap-2 flex-wrap mb-3">
        {TEAM_COLORS.map(c => (
          <Button
            key={c}
            style={{ backgroundColor: teamOrder.includes(c) ? c : "#6c757d", border: "none" }}
            onClick={() => toggleTeam(c)}
          >
            {c}
          </Button>
        ))}
        <Button variant="outline-primary" onClick={() => setActiveTeams(teamOrder)}>Apply</Button>
      </div>

      <h5>Default Timers</h5>
      <div className="d-flex align-items-center gap-2 mb-3">
        <InputGroup style={{ maxWidth: 240 }}>
          <InputGroup.Text>First Attempt (s)</InputGroup.Text>
          <Form.Control type="number" value={first} onChange={e=>setFirst(Number(e.target.value||0))} />
        </InputGroup>
        <InputGroup style={{ maxWidth: 240 }}>
          <InputGroup.Text>Steal (s)</InputGroup.Text>
          <Form.Control type="number" value={steal} onChange={e=>setSteal(Number(e.target.value||0))} />
        </InputGroup>
        <Button variant="outline-primary" onClick={() => setTimersDefaults(first, steal)}>Save Timers</Button>
      </div>

      <h5>Categories</h5>
      <CategoryEditor cats={cats} />
      <hr/>
      <h5>Questions</h5>
      <QuestionEditor cats={cats} />
      <hr/>
      <div className="d-flex gap-2">
        <Button variant="danger" onClick={resetGameKeepQuestions}>Reset Game (keep Qs)</Button>
      </div>
    </div>
  );
}

function CategoryEditor({ cats }) {
  const [name, setName] = useState("");
  const catRows = Object.entries(cats || {}).sort((a,b) => (a[1].order??0)-(b[1].order??0));

  return (
    <>
      <div className="d-flex gap-2 mb-2">
        <Form.Control placeholder="New category name" value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:360}} />
        <Button onClick={async ()=>{ if(!name.trim()) return; await createCategory(name.trim()); setName(""); }}>Add</Button>
      </div>
      <Table size="sm" bordered hover responsive>
        <thead><tr><th>Name</th><th style={{width:200}}>Actions</th></tr></thead>
        <tbody>
          {catRows.map(([id, c]) => (
            <tr key={id}>
              <td>
                <Form.Control defaultValue={c.name} onBlur={(e)=>renameCategory(id, e.target.value)} />
              </td>
              <td>
                <Button variant="outline-danger" size="sm" onClick={()=>deleteCategory(id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}

function QuestionEditor({ cats }) {
  const [form, setForm] = useState({ categoryId:"", points:100, question:"", answer:"", source:"" });
  const catOptions = Object.entries(cats || {}).sort((a,b)=> (a[1].order??0)-(b[1].order??0));

  return (
    <>
      <Row className="g-2 mb-2">
        <Col md={3}>
          <Form.Select value={form.categoryId} onChange={e=>setForm({...form, categoryId:e.target.value})}>
            <option value="">Select category…</option>
            {catOptions.map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control type="number" placeholder="Points" value={form.points} onChange={e=>setForm({...form, points:parseInt(e.target.value||0)})}/>
        </Col>
        <Col md={7}>
          <Form.Control placeholder="Question text" value={form.question} onChange={e=>setForm({...form, question:e.target.value})}/>
        </Col>
      </Row>
      <Row className="g-2 mb-2">
        <Col md={6}>
          <Form.Control placeholder="Answer" value={form.answer} onChange={e=>setForm({...form, answer:e.target.value})}/>
        </Col>
        <Col md={6}>
          <Form.Control placeholder="Source (small text under answer)" value={form.source} onChange={e=>setForm({...form, source:e.target.value})}/>
        </Col>
      </Row>
      <Button onClick={async ()=>{
        const {categoryId, points, question, answer} = form;
        if (!categoryId || !points || !question.trim() || !answer.trim()) return;
        await createQuestion(form);
        setForm({ categoryId:"", points:100, question:"", answer:"", source:"" });
      }}>Add Question</Button>
      <div className="text-muted small mt-2">Tiles within a category are shown lowest points first; ties by creation time.</div>
    </>
  );
}
