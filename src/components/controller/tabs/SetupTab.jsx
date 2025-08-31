// src/components/controller/tabs/SetupTab.jsx
import React, { useMemo, useState } from "react";
import { Button, Form, Row, Col, Table, InputGroup, Modal, Image, Stack } from "react-bootstrap";
import { TEAM_COLORS } from "../../../utils/constants.js";
import {
  setActiveTeams,
  setTimersDefaults,
  createCategory,
  renameCategory,
  deleteCategory,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  resetGameKeepQuestions,
} from "../../../rtdb/actions.js";
import { storage } from "../../../firebase";
import { ref as sref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export default function SetupTab({ meta, teams, cats, qs }) {
  const [first, setFirst] = useState(meta?.timers?.firstAttemptSec ?? 35);
  const [steal, setSteal] = useState(meta?.timers?.stealSec ?? 20);
  const enabledOrder = meta?.turn?.order || [];
  const [teamOrder, setTeamOrder] = useState(enabledOrder.length ? enabledOrder : TEAM_COLORS.slice(0,2));

  return (
    <div className="p-2">
      <h5>Teams (2–5)</h5>
      <TeamPicker teamOrder={teamOrder} setTeamOrder={setTeamOrder} />
      <div className="mb-3">
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

      <h5>Add Question</h5>
      <QuestionCreator cats={cats} />
      <hr/>

      <h5>All Questions (CRUD)</h5>
      <QuestionsManager cats={cats} qs={qs} />
      <hr/>

      <div className="d-flex gap-2">
        <Button variant="danger" onClick={resetGameKeepQuestions}>Reset Game (keep Qs)</Button>
      </div>
    </div>
  );
}

function TeamPicker({ teamOrder, setTeamOrder }) {
  const toggleTeam = (color) => {
    const has = teamOrder.includes(color);
    let next = has ? teamOrder.filter(c => c !== color) : [...teamOrder, color];
    if (next.length < 2) return;
    if (next.length > 5) next = next.slice(0,5);
    setTeamOrder(next);
  };

  return (
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

function QuestionCreator({ cats }) {
  const [form, setForm] = useState({
    categoryId:"", points:100, question:"", answer:"", source:"",
    questionImageUrl:"", answerImageUrl:"",
    questionImageFile:null, answerImageFile:null,
  });

  const catOptions = Object.entries(cats || {}).sort((a,b)=> (a[1].order??0)-(b[1].order??0));

  const onFile = (key, file) => setForm(prev => ({ ...prev, [key]: file }));

  const uploadImage = async (id, file, kind) => {
    if (!file) return null;
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
    const path = `images/questions/${id}/${kind}.${ext}`;
    const r = sref(storage, path);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

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
          <Form.Control placeholder="Source (optional)" value={form.source} onChange={e=>setForm({...form, source:e.target.value})}/>
        </Col>
      </Row>

      {/* Optional image URLs */}
      <Row className="g-2 mb-2">
        <Col md={6}>
          <Form.Control placeholder="Question Image URL (optional)" value={form.questionImageUrl} onChange={e=>setForm({...form, questionImageUrl:e.target.value})}/>
        </Col>
        <Col md={6}>
          <Form.Control placeholder="Answer Image URL (optional)" value={form.answerImageUrl} onChange={e=>setForm({...form, answerImageUrl:e.target.value})}/>
        </Col>
      </Row>

      {/* Or upload files (Storage) */}
      <Row className="g-2 mb-3">
        <Col md={6}>
          <Form.Control type="file" accept="image/*" onChange={e=>onFile("questionImageFile", e.target.files?.[0] ?? null)} />
        </Col>
        <Col md={6}>
          <Form.Control type="file" accept="image/*" onChange={e=>onFile("answerImageFile", e.target.files?.[0] ?? null)} />
        </Col>
      </Row>

      <Button onClick={async ()=>{
        const {categoryId, points, question, answer, source, questionImageUrl, answerImageUrl, questionImageFile, answerImageFile} = form;
        if (!categoryId || !points || !question.trim() || !answer.trim()) return;

        // Create first (with any URL fields)
        const id = await createQuestion({
          categoryId, points, question, answer, source,
          questionImageUrl: questionImageUrl || null,
          answerImageUrl:   answerImageUrl   || null,
        });

        // Then upload files (if provided) and patch URLs
        let patch = {};
        if (questionImageFile) {
          const url = await uploadImage(id, questionImageFile, "question");
          patch.questionImageUrl = url;
        }
        if (answerImageFile) {
          const url = await uploadImage(id, answerImageFile, "answer");
          patch.answerImageUrl = url;
        }
        if (Object.keys(patch).length) await updateQuestion(id, patch);

        setForm({ categoryId:"", points:100, question:"", answer:"", source:"", questionImageUrl:"", answerImageUrl:"", questionImageFile:null, answerImageFile:null });
      }}>
        Add Question
      </Button>

      <div className="text-muted small mt-2">Optional: provide image URLs, or upload images. If both provided, uploads override URLs.</div>
    </>
  );
}

function QuestionsManager({ cats, qs }) {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterUsed, setFilterUsed] = useState("all");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false); // now USED

  const catMap = useMemo(()=>cats || {}, [cats]);
  const rows = useMemo(() => {
    const list = Object.entries(qs || {}).map(([id, q]) => ({ id, ...q }));
    return list
      .filter(q => {
        if (filterCat && q.categoryId !== filterCat) return false;
        if (filterUsed === "used" && !q.used) return false;
        if (filterUsed === "unused" && q.used) return false;
        const hay = `${q.question} ${q.answer} ${q.source || ""}`.toLowerCase();
        if (search.trim() && !hay.includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a,b)=>{
        const ac = catMap[a.categoryId]?.order ?? 0;
        const bc = catMap[b.categoryId]?.order ?? 0;
        if (ac !== bc) return ac - bc;
        if (a.points !== b.points) return a.points - b.points;
        return (a.createdAt ?? 0) - (b.createdAt ?? 0);
      });
  }, [qs, search, filterCat, filterUsed, catMap]);

  const catOptions = Object.entries(catMap).sort((a,b)=> (a[1].order??0)-(b[1].order??0));

  const handleDelete = async (q) => {
    // disable actions during save
    setSaving(true);
    try {
      const candidates = [
        `images/questions/${q.id}/question.jpg`,
        `images/questions/${q.id}/answer.jpg`,
        `images/questions/${q.id}/question.png`,
        `images/questions/${q.id}/answer.png`,
      ];
      for (const path of candidates) {
        try { await deleteObject(sref(storage, path)); } catch {}
      }
      await deleteQuestion(q.id);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Form.Control placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth: 300}} />
        <Form.Select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{maxWidth:220}}>
          <option value="">All categories</option>
          {catOptions.map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}
        </Form.Select>
        <Form.Select value={filterUsed} onChange={e=>setFilterUsed(e.target.value)} style={{maxWidth:160}}>
          <option value="all">All</option>
          <option value="unused">Unused</option>
          <option value="used">Used</option>
        </Form.Select>
      </div>

      <Table size="sm" bordered hover responsive>
        <thead>
          <tr>
            <th style={{minWidth:160}}>Category</th>
            <th>Pts</th>
            <th style={{minWidth:280}}>Question</th>
            <th style={{minWidth:240}}>Answer</th>
            <th>Q Img</th>
            <th>A Img</th>
            <th>Used</th>
            <th style={{width:240}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(q => (
            <tr key={q.id}>
              <td>{catMap[q.categoryId]?.name || "—"}</td>
              <td>{q.points}</td>
              <td title={q.question} style={{maxWidth: 360, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{q.question}</td>
              <td title={q.answer} style={{maxWidth: 360, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{q.answer}</td>
              <td className="text-center">{q.questionImageUrl ? "✅" : "—"}</td>
              <td className="text-center">{q.answerImageUrl ? "✅" : "—"}</td>
              <td>{q.used ? "Yes" : "No"}</td>
              <td className="d-flex flex-wrap gap-2">
                <Button size="sm" variant="outline-primary" disabled={saving} onClick={()=>setEditing(q)}>Edit</Button>
                <Button size="sm" variant="outline-danger" disabled={saving} onClick={()=>handleDelete(q)}>Delete</Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={8} className="text-center text-muted">No questions match your filters.</td></tr>
          )}
        </tbody>
      </Table>

      <EditQuestionModal
        show={!!editing}
        onHide={()=>setEditing(null)}
        q={editing}
        catOptions={catOptions}
        saving={saving}
        onSave={async (updated) => {
          setSaving(true);
          try {
            await updateQuestion(updated.id, {
              categoryId: updated.categoryId,
              points: updated.points,
              question: updated.question,
              answer: updated.answer,
              source: updated.source || "",
              questionImageUrl: updated.questionImageUrl || null,
              answerImageUrl: updated.answerImageUrl || null,
            });
            setEditing(null);
          } finally { setSaving(false); }
        }}
      />
    </>
  );
}


function EditQuestionModal({ show, onHide, q, catOptions, onSave, saving }) {
  const [model, setModel] = useState(q || null);
  const [uploading, setUploading] = useState(false);

  React.useEffect(()=>setModel(q || null), [q]);

  const upload = async (file, kind) => {
    if (!model?.id || !file) return null;
    setUploading(true);
    try {
      const ext = (file.name?.split(".").pop() || "jpg").toLowerCase();
      const path = `images/questions/${model.id}/${kind}.${ext}`;
      const r = sref(storage, path);
      await uploadBytes(r, file);
      return await getDownloadURL(r);
    } finally {
      setUploading(false);
    }
  };

  if (!model) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton><Modal.Title>Edit Question</Modal.Title></Modal.Header>
      <Modal.Body>
        <Row className="g-2">
          <Col md={3}>
            <Form.Select
              value={model.categoryId}
              onChange={e=>setModel({ ...model, categoryId: e.target.value })}
              disabled={uploading || saving}
            >
              {catOptions.map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Control
              type="number"
              value={model.points}
              onChange={e=>setModel({...model, points: parseInt(e.target.value||0)})}
              disabled={uploading || saving}
            />
          </Col>
          <Col md={7}>
            <Form.Control
              as="textarea"
              rows={2}
              value={model.question}
              onChange={e=>setModel({...model, question: e.target.value})}
              disabled={uploading || saving}
            />
          </Col>

          <Col md={12}>
            <Form.Control
              as="textarea"
              rows={2}
              value={model.answer}
              onChange={e=>setModel({...model, answer: e.target.value})}
              disabled={uploading || saving}
            />
          </Col>
          <Col md={12}>
            <Form.Control
              placeholder="Source (optional)"
              value={model.source || ""}
              onChange={e=>setModel({...model, source: e.target.value})}
              disabled={uploading || saving}
            />
          </Col>

          {/* Images with preview + replace/remove */}
          <Col md={6}>
            <Stack gap={2}>
              <div className="fw-bold">Question Image</div>
              {model.questionImageUrl ? <Image src={model.questionImageUrl} thumbnail alt="question" /> : <div className="text-muted small">No image</div>}
              <div className="d-flex gap-2">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={async e=>{
                    const f = e.target.files?.[0]; if(!f) return;
                    const url = await upload(f, "question");
                    if (url) setModel(m=>({ ...m, questionImageUrl: url }));
                  }}
                  disabled={uploading || saving}
                />
                {model.questionImageUrl && (
                  <Button
                    variant="outline-secondary"
                    onClick={()=>setModel(m=>({ ...m, questionImageUrl: null }))}
                    disabled={uploading || saving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Stack>
          </Col>

          <Col md={6}>
            <Stack gap={2}>
              <div className="fw-bold">Answer Image</div>
              {model.answerImageUrl ? <Image src={model.answerImageUrl} thumbnail alt="answer" /> : <div className="text-muted small">No image</div>}
              <div className="d-flex gap-2">
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={async e=>{
                    const f = e.target.files?.[0]; if(!f) return;
                    const url = await upload(f, "answer");
                    if (url) setModel(m=>({ ...m, answerImageUrl: url }));
                  }}
                  disabled={uploading || saving}
                />
                {model.answerImageUrl && (
                  <Button
                    variant="outline-secondary"
                    onClick={()=>setModel(m=>({ ...m, answerImageUrl: null }))}
                    disabled={uploading || saving}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Stack>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={uploading || saving}>Cancel</Button>
        <Button variant="primary" onClick={()=>onSave(model)} disabled={uploading || saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

