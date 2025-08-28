function ensureSetShape() {}
const STORAGE_KEY = "flashcards_1";
let store = loadFromDisk();

const nameSet = document.getElementById("newSetName");
const addButton = document.getElementById("buttonAddSet");
let currentSetId = null;

//generating random Id with UUID 
function newId() {
    const id = crypto.randomUUID(); //way better id gen
    return id;
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
  let n = "";
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

        //Makes the set interactable, open specific 
      li.dataset.setId = set.id;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => openEditor(set.id));
      
        li.append(title, count);
        listSets.appendChild(li);
    }
}

//new set - name 
addButton.addEventListener("click", () => {
    const name = nameSet.value.trim();
    console.log(typeof(name));
    const newSet = makeSet(name);
    store.sets.push(newSet); 
    saveToDisk(store);
    nameSet.value = "";
    renderSets();
}) 
//enter listener
nameSet.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addButton.click();
})

//link for git
const btnGit = document.getElementById("linkGit");
btnGit.addEventListener("click", () => {
  const url = btnGit.dataset.url;
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
})

//right hand side ----------------------------------------------------------------------------------------------------------
function openEditor(setId) {
  //track the current open set (global)
  currentSetId = setId;
  let set = null;
  for (const s of store.sets) {
    if (s.id === setId) { 
      set = s; break; 
    }
  }
  if (!set) return;
  
  //Fill set name, and connect input for renaming
  document.getElementById("editorSet").textContent = `- ${set.name}`;
  const renameInput = document.getElementById("renameSetInput");
  renameInput.value = set.name;

  //Make it visible
  document.getElementById("viewEditor").hidden = false;

  //render cards from set
  //renderCards();

}

//Delete button logic (set)
const buttonDeleteSet = document.getElementById("editorBtnDelete");
buttonDeleteSet.addEventListener("click", () => {
  let set = null;
  for (const s of store.sets) {
    if (s.id === currentSetId) { 
      set = s; break; 
    }
  }
  if (!set) return;

  //additional confirm
  if (!confirm(`Delete set "${set.name}"?`)) return;

  //filters out specific id, leaving rest of sets
  store.sets = store.sets.filter(s => s.id !== currentSetId);

  //store
  saveToDisk(store);
  currentSetId = null;                         //clear selection
  document.getElementById("viewEditor").hidden = true; //hide editor
  renderSets();  
})

//show
renderSets();


