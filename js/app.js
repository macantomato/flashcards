function makeSet(name) {

    const now = Date.now();  //current time

    return {
        id: newId(),
        name: (typeof name === "string "),
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
    
}
