import { db } from "../firebase";
import { ref, get, set, update, serverTimestamp } from "firebase/database";
import { p } from "./paths.js";
import { TEAM_COLORS } from "../utils/constants.js";

export async function ensureGameInitialized() {
  const metaSnap = await get(ref(db, p.meta));
  if (metaSnap.exists()) return;

  const initialTeams = Object.fromEntries(
    TEAM_COLORS.map((c, idx) => [c, { active: idx < 2, score: 0, blockedCurrent: false }]) // default 2 teams: red, blue
  );

  await set(ref(db, p.meta), {
    title: "Jesus People Parish Game Show",
    createdAt: Date.now(),
    status: "board",
    displayView: "board",
    timers: { firstAttemptSec: 35, stealSec: 20 },
    current: { categoryId: null, questionId: null, selectingTeam: null, phase: "idle" },
    turn: { order: ["red", "blue"], index: 0 },
  });

  await set(ref(db, p.teams), initialTeams);
  await set(ref(db, p.board), { categories: {}, questions: {} });
  await set(ref(db, p.buzzer), { open: false, winner: null, ts: null });
  await set(ref(db, p.timer), { running: false, mode: "firstAttempt", durationSec: 35, startedAt: null, remainingSec: 35 });
  await set(ref(db, p.audit), { last: null, redo: null, log: {} });
}
