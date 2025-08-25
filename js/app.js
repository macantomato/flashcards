function makeSet(name) {

    const now = Date.now();  //current time

    return {
        id: newId(),
        name: (typeof name === "string "),
        createdAt: now,
        updatedAt: "blank",
        cards: []
    }; 
}

function newId() {
    const Id = Date.now();
    return Id;
}


