function ensureSetShape() {}
const STORAGE_KEY = "flashcards_1";
let store = loadFromDisk();

const nameSet = document.getElementById("newSetName");
const addButton = document.getElementById("buttonAddSet");
let currentSetId = null;
//for practice
let session = null;

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
//Listener - Enter for new set
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
  renderCards();
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

//render cards
function renderCards() {
  //find right set
  let set = null;
  for (const s of store.sets) {
    if (s.id === currentSetId) { 
      set = s; break; 
    }
  }
  if (!set) return;

  const ulNode = document.getElementById("cardList");
  ulNode.innerHTML = "";

  if (set.cards.length === 0) {
    const li = document.createElement("li");
    li.textContent = " No card's added yet, add one below! ";
    ulNode.appendChild(li);
    return;
  }

  //for each card
  for (const card of set.cards) {
    const li = document.createElement("li");
    li.className = "card-item";
    li.dataset.cardId = card.id;

    const front = document.createElement("div");
    front.className = "card-front";
    front.textContent = "Question: " + card.front;

    const back = document.createElement("div");
    back.className = "card-back";
    back.textContent = "Answer: " + card.back;

    const del = document.createElement("button");
    del.className = "delBtnCard";
    del.textContent = "Delete Card";

    del.addEventListener("click", () => {
      set.cards = set.cards.filter(c => c.id !== card.id);
      saveToDisk(store);
      renderSets(); //update set
      renderCards(); //updates count on cards
    })

    li.append(front, back, del);
    ulNode.appendChild(li);
  }
}

//Button add card
const addCardBtn = document.getElementById("btnAddCard");
const frontNo = document.getElementById("addCardFront");
const backNo  = document.getElementById("addCardBack");
addCardBtn.addEventListener("click", () => {
  let set = null;
  for (const s of store.sets) {
    if (s.id === currentSetId) { 
      set = s; break; 
    }
  }
  if (!set) return;

  //trim value from input => string
  const front = frontNo.value.trim();
  const back  = backNo.value.trim();
  if (!front && !back) { frontNo.focus(); return; } //empty n empty
  set.cards.push(makeCard(front, back));
  set.updatedAt = Date.now();

  //refresh UI
  frontNo.value = "";
  backNo.value  = "";
  saveToDisk(store);
  renderCards();
  renderSets();
  frontNo.focus(); //For fast making of other cards (pointer/focus goes to front)
})

//Listener - Enter (add card)
backNo.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addCardBtn.click();
})

//Practice view ------------------------------------------------------------------------------------------------------------------
//Practice button pressed -> practiceStart func
const practiceStart = document.getElementById("editorBtnPractice");
practiceStart.addEventListener("click", () => {
  startPractice(currentSetId);
})

//practiceStart func
function startPractice(setId) {
  currentSetId = setId;
  let set = null;
  for (const s of store.sets) {
    if (s.id === setId) { 
      set = s; break; 
    }
  }
  if (!set) return;

  //temp state of session
  session = {
    setId,
    deck: [...set.cards],
    i: 0,
    showBack: false,
    knownIds: new Set(),
    mode: "full",  
  }
  //hide other views
  document.getElementById("viewEditor").hidden = true;
  document.getElementById("sidePanel").hidden = true;
  document.getElementById("viewPractice").hidden = false;

  //render practice view
  renderPractice();
};

//Return button -> exit Practice
const btnReturnFPractice = document.getElementById("exitPractice");
btnReturnFPractice.addEventListener("click", () => {
  exitPractice();
})

function exitPractice() {
  session = null;
  currentSetId = null;
  document.getElementById("viewEditor").hidden = false;
  document.getElementById("sidePanel").hidden = false;
  document.getElementById("viewPractice").hidden = true;
  renderCards();
  renderSets();
}

function renderPractice() {
  if (!session) return;

  const card = currentCard();
  const total = session.deck.length;
  const idx = Math.min(session.i + 1, total);

  document.getElementById("practiceCounter").textContent = `${idx}/${total}`;
  document.getElementById("knownCounter").textContent = `Known: ${session.knownIds.size}`;
  document.getElementsByName("learningCounter").textContent = `Learning: ${session.knownIds.size - session.deck.length}`;

  const frontPractice = document.getElementById("flashCardFront");
  const backPractice = document.getElementById("flashCardBack");

  //show based on session showback
  frontPractice.textContent = card ? card.front : "—";
  backPractice.textContent  = card ? card.back  : "—";
  backPractice.hidden  = !session.showBack;
  frontPractice.hidden =  session.showBack;
}

function currentCard() {
  return session ? session.deck[session.i] : null;
}

//flip the session card
function flipCard() {
  if (!session) return;
  session.showBack = !session.showBack;
  renderPractice();
}

//next card func
function nextCard() {
  if (!session) return;
  session.i += 1;
  session.showBack = false;
  if (session.i >= session.deck.length) {
    endOfRound(); } else {
      renderPractice();
    }
}

//keep going skips so its not marked as known
function keepGoing() {
  nextCard();
}

//mark card as known, go next
function markKnow() {
  if (!session) return;
  const c = currentCard(); 
  if (!c) return;
  session.knownIds.add(c.id);
  nextCard();
}

//binding buttons
//BUTTON: flip
const btnFlipCard = document.getElementById("flipCardBtn");
btnFlipCard.addEventListener("click", () => {
  flipCard();
})

//BUTTON: know, next
const btnKnowCard = document.getElementById("practiceKnowBtn");
btnKnowCard.addEventListener("click", () => {
  markKnow();
})

//BUTTON: learn, next
const btnLearnCard = document.getElementById("practiceNextBtn");
btnLearnCard.addEventListener("click", () => {
  nextCard();
})

//BUTTON: Full reset set
const btnFullReset = document.getElementById("btnPracticeHardReset");
btnFullReset.addEventListener("click", () => {
  fullRestart();
})

//BUTTON: Learning set
const btnLearnSet = document.getElementById("btnPracticeReset");
btnLearnSet.addEventListener("click",() => {
  keepLearning();
})

document.addEventListener("keydown", (e) => {
  if (!session) return;
  if (e.key === " ") { e.preventDefault(); flipCard(); }
  else if (e.key === "ArrowRight") keepGoing();
  else if (e.key === "ArrowLeft") markKnow();
  else if (e.key === "Escape") exitPractice();
});

//end of round
function endOfRound() {
  if (!session) return;
  loadUi();
  if (session.deck.length === session.knownIds.size) {
    document.getElementById("practiceResetDiv").hidden = true;
  }
  return;
}

function keepLearning() {
  if (!session) return;
  const uknown = session.deck.filter(c => !session.knownIds.has(c.id));
  if (uknown.length === 0) {
    let set = null;
    for (const s of store.sets) {
      if (s.id === session.setId) { 
        set = s; break; 
      }
    }
    if (!set) return;
    session.deck = [...set.cards];
    session.i = 0;

    for (x in session.cards){
    session.showBack = false;
    }

    renderPractice();

  }

  session.deck = uknown;
  session.i = 0;
  for (x in session.cards){
    session.showBack = false;
  }
  session.knownIds = new Set();
  session.mode = "uknowns";

  reverseUi();
  renderPractice();
}

function fullRestart() {
  if(!session) return;

  reverseUi();

  //render practice again as normal
  session.i = 0;
  for (x in session.cards){
    session.showBack = false;
  }
  renderPractice();
}

//Ui loads/switch
function reverseUi() {
  document.getElementById("learningCounter").hidden = false;
  document.getElementById("knownCounter").hidden = false;
  document.getElementById("practiceCounter").hidden = false;
  document.getElementById("practiceCard").hidden = false;
  document.getElementById("progressBar").hidden = false;
  document.getElementById("practiceOptions").hidden = false;
  document.getElementById("practiceEnd").hidden = true;
}

function loadUi() {
  document.getElementById("learningCounter").hidden = true;
  document.getElementById("knownCounter").hidden = true;
  document.getElementById("practiceCounter").hidden = true;
  document.getElementById("practiceCard").hidden = true;
  document.getElementById("progressBar").hidden = true;
  document.getElementById("practiceOptions").hidden = true;
  document.getElementById("practiceEnd").hidden = false;
}

//show
renderSets();


