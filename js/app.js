const STORAGE_KEY = "flashcards_1";
let store = loadFromDisk();


function makeDefEnvelope() {
    return { version: 1, sets: [] };
}

function loadFromDisk() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) return makeDefEnvelope();

    let obj;

    try { obj = JSON.parse(raw); }
    catch { return makeDefEnvelope(); }

    if (!obj || typeof obj !== "object") return makeDefEnvelope();
    if (!Array.isArray(obj.sets)) obj.sets = [];

    obj.sets.forEach(s => ensureSetShape(s));

    return obj;
}

function saveToDisk(envelope) {
  const json = JSON.stringify(envelope);
  localStorage.setItem(STORAGE_KEY, json);
}

function makeSet(name) {
  const now = Date.now(); //cur time
  const n = typeof name === "string" ? name.trim() : "";
  return {
    id: newId(),
    name: n || "New set",
    createdAt: now,
    updatedAt: now,
    cards: []
  };
}

function newId() {
    const Id = crypto.randomUUID(); //way better id gen
    return Id;
}

function makeCard(front, back) {
  const id = newId();
  const frontText = String(front ?? "").trim();
  const backText  = String(back  ?? "").trim();
  return { id, front: frontText, back: backText };
}


