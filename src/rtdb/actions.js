// src/rtdb/actions.js
import { db } from "../firebase";
import { ref, get, set, update, push } from "firebase/database";
import { p, GAME_ROOT } from "./paths.js";
import { PHASE, TIMER_MODE } from "../utils/constants.js";
import { halfPoints } from "../utils/format.js";
import { logAction } from "../utils/audit.js";

const R = (path) => ref(db, path);

// --- Helpers ---
async function writeUpdates(updates) {
  const { update: rtdbUpdate } = await import("firebase/database");
  await rtdbUpdate(ref(db), updates);
}

async function serverNow() {
  try {
    const offSnap = await get(ref(db, ".info/serverTimeOffset"));
    const offset = offSnap.exists() ? Number(offSnap.val()) : 0;
    return Date.now() + offset;
  } catch {
    return Date.now();
  }
}

// --- Setup & Teams ---
export async function setActiveTeams(order) {
  const updates = {};
  const allSnap = await get(R(p.teams));
  const all = allSnap.exists() ? allSnap.val() : {};
  Object.keys(all).forEach((color) => {
    updates[`${p.teams}/${color}/active`] = order.includes(color);
    updates[`${p.teams}/${color}/blockedCurrent`] = false;
  });
  updates[`${p.meta}/turn/order`] = order;
  updates[`${p.meta}/turn/index`] = 0;
  await writeUpdates(updates);
}

export async function setTimersDefaults(first, steal) {
  await update(R(p.meta), { timers: { firstAttemptSec: first, stealSec: steal } });
  await update(R(p.timer), { durationSec: first, mode: TIMER_MODE.FIRST, remainingSec: first });
}

// --- Board CRUD ---
export async function createCategory(name) {
  const id = push(R(`${p.categories}`)).key;
  const snap = await get(R(`${p.categories}`));
  const order = snap.exists() ? Object.keys(snap.val()).length : 0;
  await set(R(`${p.categories}/${id}`), { name, order });
  return id;
}

export async function renameCategory(id, name) {
  await update(R(`${p.categories}/${id}`), { name });
}

export async function deleteCategory(id) {
  const qSnap = await get(R(p.questions));
  const updates = {};
  if (qSnap.exists()) {
    const qs = qSnap.val();
    Object.entries(qs).forEach(([qid, q]) => {
      if (q.categoryId === id) updates[`${p.questions}/${qid}`] = null;
    });
  }
  updates[`${p.categories}/${id}`] = null;
  await writeUpdates(updates);
}

/**
 * createQuestion
 * Supports optional images:
 * - questionImageUrl
 * - answerImageUrl
 */
export async function createQuestion({ categoryId, points, question, answer, source, questionImageUrl = null, answerImageUrl = null }) {
  const id = push(R(p.questions)).key;
  await set(R(`${p.questions}/${id}`), {
    categoryId,
    points,
    question,
    answer,
    source: source || "",
    questionImageUrl: questionImageUrl || null,
    answerImageUrl: answerImageUrl || null,
    createdAt: Date.now(),
    used: false,
    usedAt: null,
  });
  return id;
}

export async function updateQuestion(id, patch) {
  await update(R(`${p.questions}/${id}`), patch);
}

export async function deleteQuestion(id) {
  await set(R(`${p.questions}/${id}`), null);
}

// --- Flow actions ---
export async function selectTile({ categoryId, questionId, selectingTeam, firstAttemptSec }) {
  const updates = {};
  updates[`${p.meta}/current`] = {
    categoryId,
    questionId,
    selectingTeam,
    phase: PHASE.FIRST,
    resolved: false,
    judgedBy: null,
    judgedAt: null,
  };
  updates[`${p.meta}/status`] = "question";
  updates[`${p.meta}/displayView`] = "question";
  updates[`${p.timer}`] = {
    running: false,
    mode: TIMER_MODE.FIRST,
    durationSec: firstAttemptSec,
    startedAt: null,
    remainingSec: firstAttemptSec,
  };
  updates[`${p.buzzer}`] = { open: false, winner: null, ts: null };
  const teamsSnap = await get(R(p.teams));
  if (teamsSnap.exists()) {
    Object.keys(teamsSnap.val()).forEach((color) => {
      updates[`${p.teams}/${color}/blockedCurrent`] = false;
    });
  }
  await writeUpdates(updates);
  await logAction(GAME_ROOT, "TILE_SELECTED", { forward: { writes: updates } }, { writes: {} });
}

// in startTimer(mode, durationSec) — set remainingSec to the same value so all clients see it immediately
export async function startTimer(mode, durationSec) {
  const now = await serverNow();
  const updates = {};
  updates[`${p.timer}/running`] = true;
  updates[`${p.timer}/mode`] = mode;
  updates[`${p.timer}/durationSec`] = durationSec;
  updates[`${p.timer}/remainingSec`] = durationSec;   // <— keep remaining in sync on resume
  updates[`${p.timer}/startedAt`] = now;
  await writeUpdates(updates);
  await logAction(
    GAME_ROOT,
    "TIMER_STARTED",
    { forward: { writes: updates } },
    { writes: { [`${p.timer}/running`]: false, [`${p.timer}/startedAt`]: null } }
  );
}

export async function pauseTimer(remainingSec) {
  const updates = {};
  updates[`${p.timer}/running`] = false;
  updates[`${p.timer}/startedAt`] = null;
  updates[`${p.timer}/remainingSec`] = remainingSec;
  await writeUpdates(updates);
  await logAction(GAME_ROOT, "TIMER_PAUSED", { forward: { writes: updates } }, { writes: {} });
}

export async function resetTimer(toSec) {
  const updates = {};
  updates[`${p.timer}/running`] = false;
  updates[`${p.timer}/startedAt`] = null;
  updates[`${p.timer}/durationSec`] = toSec;
  updates[`${p.timer}/remainingSec`] = toSec;
  await writeUpdates(updates);
  await logAction(GAME_ROOT, "TIMER_RESET", { forward: { writes: updates } }, { writes: {} });
}

export async function plus5(remainingSec) {
  const to = remainingSec + 5;
  await resetTimer(to);
}

export async function openBuzzers() {
  const updates = {};
  updates[`${p.buzzer}/open`] = true;
  updates[`${p.buzzer}/winner`] = null;
  updates[`${p.buzzer}/ts`] = await serverNow();
  await writeUpdates(updates);
  await logAction(
    GAME_ROOT,
    "BUZZERS_OPEN",
    { forward: { writes: updates } },
    { writes: { [`${p.buzzer}/open`]: false } }
  );
}

export async function closeBuzzers() {
  const updates = {};
  updates[`${p.buzzer}/open`] = false;
  await writeUpdates(updates);
  await logAction(
    GAME_ROOT,
    "BUZZERS_CLOSED",
    { forward: { writes: updates } },
    { writes: { [`${p.buzzer}/open`]: true } }
  );
}

export async function setBuzzerWinner(color) {
  const updates = {};
  updates[`${p.buzzer}/winner`] = color;
  updates[`${p.buzzer}/ts`] = await serverNow();
  await writeUpdates(updates);
}

export async function clearBuzzerWinner() {
  await update(R(p.buzzer), { winner: null, ts: await serverNow() });
}

export async function markStealWrongAndContinue(teamColor) {
  await setBlocked(teamColor, true);
  await clearBuzzerWinner();
}

export async function setBlocked(color, to) {
  await update(R(`${p.teams}/${color}`), { blockedCurrent: to });
}

export async function markUsed(questionId, used) {
  await update(R(`${p.questions}/${questionId}`), { used, usedAt: used ? Date.now() : null });
}

export async function setDisplayView(view) {
  await update(R(p.meta), { displayView: view, status: view });
}

export async function nextPickerAdvance() {
  const metaSnap = await get(R(p.meta));
  if (!metaSnap.exists()) return;
  const meta = metaSnap.val();
  const order = meta.turn?.order || [];
  const index = meta.turn?.index || 0;
  const nextIndex = order.length ? (index + 1) % order.length : 0;
  await update(R(`${p.meta}/turn`), { index: nextIndex });
}

export async function judgment({ team, kind, points }) {
  const inverseWrites = {};
  const forwardWrites = {};

  const metaSnap = await get(R(p.meta));
  if (!metaSnap.exists()) return;
  const meta = metaSnap.val();
  const cur = meta.current || {};
  if (!cur?.questionId) return;

  if (cur.resolved === true) return;

  const teamRef = R(`${p.teams}/${team}/score`);
  const currentScoreSnap = await get(teamRef);
  const currentScore = currentScoreSnap.exists() ? Number(currentScoreSnap.val()) : 0;

  let delta = 0;
  if (kind === "correct") delta = points;
  if (kind === "partial") delta = halfPoints(points);
  if (kind === "wrong") delta = 0;

  const newScore = currentScore + delta;

  forwardWrites[`${p.teams}/${team}/score`] = newScore;
  forwardWrites[`${p.meta}/current/resolved`] = true;
  forwardWrites[`${p.meta}/current/judgedBy`] = "host";
  forwardWrites[`${p.meta}/current/judgedAt`] = await serverNow();

  inverseWrites[`${p.teams}/${team}/score`] = currentScore;
  inverseWrites[`${p.meta}/current/resolved`] = false;
  inverseWrites[`${p.meta}/current/judgedBy`] = null;
  inverseWrites[`${p.meta}/current/judgedAt`] = null;

  await writeUpdates(forwardWrites);
  await logAction(GAME_ROOT, "JUDGMENT", { forward: { writes: forwardWrites } }, { writes: inverseWrites });
}

export async function endQuestion({ revealAnswer = true }) {
  const metaSnap = await get(R(p.meta));
  if (!metaSnap.exists()) return;
  const { current } = metaSnap.val();
  if (!current?.questionId) return;

  const updates = {};
  updates[`${p.questions}/${current.questionId}/used`] = true;
  updates[`${p.questions}/${current.questionId}/usedAt`] = Date.now();
  updates[`${p.timer}/running`] = false;
  updates[`${p.timer}/startedAt`] = null;

  if (revealAnswer) {
    updates[`${p.meta}/displayView`] = "answer";
    updates[`${p.meta}/status`] = "answer";
  } else {
    updates[`${p.meta}/displayView`] = "board";
    updates[`${p.meta}/status`] = "board";
    updates[`${p.meta}/current`] = { categoryId: null, questionId: null, selectingTeam: null, phase: PHASE.IDLE, resolved: false, judgedBy: null, judgedAt: null };
  }

  await writeUpdates(updates);
  await nextPickerAdvance();
}

export async function moveToBoard() {
  await update(R(p.meta), {
    displayView: "board",
    status: "board",
    current: { categoryId: null, questionId: null, selectingTeam: null, phase: PHASE.IDLE, resolved: false, judgedBy: null, judgedAt: null },
  });
}

export async function startStealPhase(stealSec, selectingTeam) {
  const updates = {};
  updates[`${p.meta}/current/phase`] = PHASE.STEAL;
  updates[`${p.buzzer}/open`] = true;
  updates[`${p.buzzer}/winner`] = null;
  updates[`${p.timer}`] = {
    running: false,
    mode: TIMER_MODE.STEAL,
    durationSec: stealSec,
    startedAt: null,
    remainingSec: stealSec,
  };
  updates[`${p.teams}/${selectingTeam}/blockedCurrent`] = true;
  await writeUpdates(updates);
}

export async function resetPerQuestionBlocks() {
  const snap = await get(R(p.teams));
  if (!snap.exists()) return;
  const updates = {};
  Object.keys(snap.val()).forEach((c) => {
    updates[`${p.teams}/${c}/blockedCurrent`] = false;
  });
  await writeUpdates(updates);
}

export async function resetScores() {
  const snap = await get(R(p.teams));
  if (!snap.exists()) return;
  const updates = {};
  Object.keys(snap.val()).forEach((c) => {
    updates[`${p.teams}/${c}/score`] = 0;
  });
  await writeUpdates(updates);
}

export async function resetGameKeepQuestions() {
  const updates = {};
  updates[`${p.meta}/status`] = "board";
  updates[`${p.meta}/displayView`] = "board";
  updates[`${p.meta}/current`] = {
    categoryId: null,
    questionId: null,
    selectingTeam: null,
    phase: PHASE.IDLE,
    resolved: false,
    judgedBy: null,
    judgedAt: null,
  };
  updates[`${p.buzzer}`] = { open: false, winner: null, ts: null };
  updates[`${p.timer}`] = {
    running: false,
    mode: TIMER_MODE.FIRST,
    durationSec: 35,
    startedAt: null,
    remainingSec: 35,
  };
  updates[`${p.audit}`] = { last: null, redo: null, log: {} };

  const teamsSnap = await get(R(p.teams));
  if (teamsSnap.exists()) {
    Object.keys(teamsSnap.val()).forEach((color) => {
      updates[`${p.teams}/${color}/score`] = 0;
      updates[`${p.teams}/${color}/blockedCurrent`] = false;
    });
  }

  const qsSnap = await get(R(p.questions));
  if (qsSnap.exists()) {
    Object.entries(qsSnap.val()).forEach(([qid]) => {
      updates[`${p.questions}/${qid}/used`] = false;
      updates[`${p.questions}/${qid}/usedAt`] = null;
    });
  }
  await writeUpdates(updates);
}

export async function resetGameDeleteAllQuestions() {
  const updates = {};

  // meta/display
  updates[`${p.meta}/status`] = "board";
  updates[`${p.meta}/displayView`] = "board";
  updates[`${p.meta}/current`] = {
    categoryId: null,
    questionId: null,
    selectingTeam: null,
    phase: PHASE.IDLE,
    resolved: false,
    judgedBy: null,
    judgedAt: null,
  };

  // buzzer/timer/audit
  updates[`${p.buzzer}`] = { open: false, winner: null, ts: null };
  updates[`${p.timer}`] = {
    running: false,
    mode: TIMER_MODE.FIRST,
    durationSec: 35,
    startedAt: null,
    remainingSec: 35,
  };
  updates[`${p.audit}`] = { last: null, redo: null, log: {} };

  // teams: zero scores + clear per-question blocks
  const teamsSnap = await get(R(p.teams));
  if (teamsSnap.exists()) {
    Object.keys(teamsSnap.val()).forEach((color) => {
      updates[`${p.teams}/${color}/score`] = 0;
      updates[`${p.teams}/${color}/blockedCurrent`] = false;
    });
  }

  // DELETE ALL QUESTIONS
  updates[`${p.questions}`] = null;

  await writeUpdates(updates);
}