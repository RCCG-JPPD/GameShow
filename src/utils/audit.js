import { db } from "../firebase";
import { ref, push, set, get, update } from "firebase/database";

// Convert { "/a/b": 1 }  <->  [{ path: "/a/b", value: 1 }]
function objToPairs(obj = {}) {
  return Object.entries(obj).map(([path, value]) => ({ path, value }));
}
function pairsToObj(pairs = []) {
  const out = {};
  for (const { path, value } of pairs) out[path] = value;
  return out;
}

/**
 * logAction(gameRoot, type, forwardPayload, inverse)
 * - forwardPayload may be { forward: { writes: {...} } } OR { writes: {...} }
 * - inverse must be { writes: {...} } or omitted
 */
export async function logAction(gameRoot, type, forwardPayload = {}, inverse = {}) {
  const forwardWrites =
    forwardPayload?.forward?.writes ??
    forwardPayload?.writes ??
    {};
  const inverseWrites = inverse?.writes ?? {};

  const entry = {
    type,
    forward: objToPairs(forwardWrites), // arrays are safe in RTDB
    inverse: objToPairs(inverseWrites),
    actor: "host",
    at: Date.now(),
  };

  await push(ref(db, `${gameRoot}/audit/log`), entry);
  await set(ref(db, `${gameRoot}/audit/last`), entry);
  await set(ref(db, `${gameRoot}/audit/redo`), null); // clear redo on new action
}

export async function undoLast(gameRoot) {
  const lastSnap = await get(ref(db, `${gameRoot}/audit/last`));
  if (!lastSnap.exists()) return false;
  const last = lastSnap.val();

  const inverseUpdates = pairsToObj(last.inverse || []);
  if (Object.keys(inverseUpdates).length) {
    await update(ref(db), inverseUpdates);
  }

  // save forward for redo, clear last
  await set(ref(db, `${gameRoot}/audit/redo`), { forward: last.forward || [] });
  await set(ref(db, `${gameRoot}/audit/last`), null);
  return true;
}

export async function redoLast(gameRoot) {
  const redoSnap = await get(ref(db, `${gameRoot}/audit/redo`));
  if (!redoSnap.exists()) return false;
  const { forward = [] } = redoSnap.val() || {};

  const forwardUpdates = pairsToObj(forward);
  if (Object.keys(forwardUpdates).length) {
    await update(ref(db), forwardUpdates);
  }

  await set(ref(db, `${gameRoot}/audit/redo`), null);
  return true;
}
