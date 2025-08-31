import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "react-bootstrap";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";
import { ensureGameInitialized } from "../rtdb/init.js";
import { p } from "../rtdb/paths.js";
import SetupTab from "../components/controller/tabs/SetupTab.jsx";
import BoardTab from "../components/controller/tabs/BoardTab.jsx";
import QuestionTab from "../components/controller/tabs/QuestionTab.jsx";
import AnswerTab from "../components/controller/tabs/AnswerTab.jsx";
import ScoreboardTab from "../components/controller/tabs/ScoreboardTab.jsx";
import BuzzerTab from "../components/controller/tabs/BuzzerTab.jsx";
import AuditTab from "../components/controller/tabs/AuditTab.jsx";

export default function Controller() {
  const [meta, setMeta] = useState(null);
  const [teams, setTeams] = useState({});
  const [cats, setCats] = useState({});
  const [qs, setQs] = useState({});
  const [buzzer, setBuzzer] = useState({});
  const [timer, setTimer] = useState({});

  useEffect(() => { ensureGameInitialized(); }, []);
  useEffect(() => onValue(ref(db, p.meta), s => setMeta(s.val() || null)), []);
  useEffect(() => onValue(ref(db, p.teams), s => setTeams(s.val() || {})), []);
  useEffect(() => onValue(ref(db, p.categories), s => setCats(s.val() || {})), []);
  useEffect(() => onValue(ref(db, p.questions), s => setQs(s.val() || {})), []);
  useEffect(() => onValue(ref(db, p.buzzer), s => setBuzzer(s.val() || {})), []);
  useEffect(() => onValue(ref(db, p.timer), s => setTimer(s.val() || {})), []);

  if (!meta) return <div>Loading…</div>;

  return (
    <Tabs defaultActiveKey="board" className="mb-3">
      <Tab eventKey="setup" title="Setup">
        {/* Pass qs so Setup can show ALL questions and CRUD them */}
        <SetupTab meta={meta} teams={teams} cats={cats} qs={qs} />
      </Tab>
      <Tab eventKey="board" title="Board">
        <BoardTab meta={meta} teams={teams} cats={cats} qs={qs} />
      </Tab>
      <Tab eventKey="question" title="Question">
        <QuestionTab meta={meta} timer={timer} teams={teams} buzzer={buzzer} qs={qs} />
      </Tab>
      <Tab eventKey="answer" title="Answer">
        <AnswerTab meta={meta} qs={qs} />
      </Tab>
      <Tab eventKey="scoreboard" title="Scoreboard">
        <ScoreboardTab teams={teams} />
      </Tab>
      <Tab eventKey="buzzer" title="Buzzer">
        <BuzzerTab teams={teams} buzzer={buzzer} />
      </Tab>
      <Tab eventKey="audit" title="Audit">
        <AuditTab />
      </Tab>
    </Tabs>
  );
}
