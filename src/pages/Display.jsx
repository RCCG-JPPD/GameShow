// src/pages/Display.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { p } from "../rtdb/paths.js";
import BoardView from "../components/display/BoardView.jsx";
import QuestionView from "../components/display/QuestionView.jsx";
import AnswerView from "../components/display/AnswerView.jsx";
import ScoreboardView from "../components/display/ScoreboardView.jsx";

export default function Display() {
  const [meta, setMeta] = useState(null);
  const [cats, setCats] = useState({});
  const [qs, setQs] = useState({});
  const [teams, setTeams] = useState({});
  const [timer, setTimer] = useState({});
  const [buzzer, setBuzzer] = useState({});

  useEffect(()=> onValue(ref(db, p.meta), s=>setMeta(s.val()||null)),[]);
  useEffect(()=> onValue(ref(db, p.categories), s=>setCats(s.val()||{})),[]);
  useEffect(()=> onValue(ref(db, p.questions), s=>setQs(s.val()||{})),[]);
  useEffect(()=> onValue(ref(db, p.teams), s=>setTeams(s.val()||{})),[]);
  useEffect(()=> onValue(ref(db, p.timer), s=>setTimer(s.val()||{})),[]);
  useEffect(()=> onValue(ref(db, p.buzzer), s=>setBuzzer(s.val()||{})),[]);

  if (!meta) {
    return (
      <div className="display-surface" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        Loading…
      </div>
    );
  }

  const view = meta.displayView;

  return (
    <div className="display-surface">
      {view === "board" && <BoardView cats={cats} qs={qs} />}
      {view === "question" && <QuestionView meta={meta} qs={qs} timer={timer} buzzer={buzzer} />}
      {view === "answer" && <AnswerView meta={meta} qs={qs} />}
      {view === "scoreboard" && <ScoreboardView teams={teams} />}
    </div>
  );
}
