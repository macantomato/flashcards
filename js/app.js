function ensureSetShape() {}
const STORAGE_KEY = "flashcards_1";
let store = loadFromDisk();

const nameSet = document.getElementById("newSetName");
const addButton = document.getElementById("buttonAddSet");

//generating random Id with UUID 
function newId() {
    const Id = crypto.randomUUID(); //way better id gen
    return Id;
}

//loads for storing ---------------------------------------------------------------------------------
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

    return obj;
}

function saveToDisk(envelope) {
  const json = JSON.stringify(envelope);
  localStorage.setItem(STORAGE_KEY, json);
}
 //set - card logic -----------------------------------------------------------------------------
function makeSet(name) {
  const now = Date.now(); //cur time
  //checker of corr type of set (mb empty)
  if (typeof(name) === "string" ) {
    n = name;
  } else {
    n = "New Set";
  }

  return {
    id: newId(),
    name: n ,
    createdAt: now,
    updatedAt: now,
    cards: []
  };
}

function makeCard(front, back) {
  const id = newId();
  const frontText = String(front ?? "").trim();
  const backText  = String(back  ?? "").trim();
  return { id, front: frontText, back: backText };
}



// left grid side, logic ------------------------------------------------------------------------
function renderSets() {
    //grab the set list, then empty it
    const listSets = document.getElementById("setsList");
    listSets.innerHTML = "";

    if (store.sets.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No sets yet available, make some above ";
        listSets.appendChild(li);
        return;
    }

    for (const set of store.sets) {
        const li = document.createElement("li");
        
        const title = document.createElement("strong");
        title.textContent = set.name;

        const count = document.createElement("strong");
        count.textContent = `(${set.cards.length})`;

        li.append(title, count);
        listSets.appendChild(li);
    }
}

addButton.addEventListener("click", () => {
    const name = nameSet.value.trim();
    console.log(typeof(name));
    const newSet = makeSet(name);
    store.sets.push(newSet); 
    saveToDisk(store);
    nameSet.value = "";
    renderSets();
})

nameSet.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addButton.click();
})


renderSets();


