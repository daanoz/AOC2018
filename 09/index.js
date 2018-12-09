let term = require('terminal-kit').terminal;
let utils = require('./../utils');

class Marble {
    constructor(val) {
        this.val = val;
        this.before = null;
        this.after = null;
    }
    getAfter(steps) {
        if(steps === 0) {
            return this;
        }
        return this.after.getAfter(steps - 1);
    }
    getBefore(steps) {
        if(steps === 0) {
            return this;
        }
        return this.before.getBefore(steps - 1);
    }
    swap(newMarble) {
        this.before.after = newMarble;
        newMarble.before = this.before;
        this.before = newMarble;
        newMarble.after = this;
    }
    detach() {
        this.before.after = this.after;
        this.after.before = this.before;
    }
}

module.exports = (isPartB) => {
    let players = 419;
    let maxMarble = 71052;
    if(isPartB) { maxMarble *= 100; }

    let scores = {};
    for(let p = 0; p < players; p++) { scores[p] = 0; }

    let currentMarble = new Marble(0);
    currentMarble.before = currentMarble;
    currentMarble.after = currentMarble;

    let currentPlayer = 0;
    for(let marbleVal = 1; marbleVal <= maxMarble; marbleVal++) {
        let marble = new Marble(marbleVal);
        if(marbleVal % 23 === 0) {        
            scores[currentPlayer] += marble.val;
            let replaceMarble = currentMarble.getBefore(7);
            scores[currentPlayer] += replaceMarble.val;
            currentMarble = replaceMarble.after;
            replaceMarble.detach();
        } else {
            let replaceMarble = currentMarble.getAfter(2);
            replaceMarble.swap(marble);
            currentMarble = marble;
        }
        currentPlayer = (currentPlayer + 1) % players;
    }

    if(!isPartB) {
        term.bold('Result for part A: %s\n', Math.max(...Object.values(scores)));
    } else {
        term.bold('Result for part B: %s\n', Math.max(...Object.values(scores)));
    }
};