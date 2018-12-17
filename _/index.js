let term = require('terminal-kit').terminal;
let utils = require('./../utils');

module.exports = (isPartB) => {
    if(!isPartB)  {
        term.bold('Result for part A: %s\n', 0);
    } else {
        term.bold('Result for part B: %s\n', 0);
    }
};