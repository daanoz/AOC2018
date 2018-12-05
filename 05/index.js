let term = require('terminal-kit').terminal;
let utils = require('./../utils');

let removeReactingUnits = (value) => {
    let i = 0;
    while((i + 1) < value.length) {
        let a = value.charCodeAt(i);
        let b = value.charCodeAt(i + 1);
        if(Math.abs(a - b) === 32) {
            value = value.substr(0, i) + value.substr(i + 2);
            i = i - 1;
        } else {
            i++;
        }
    }
    return value;
}

module.exports = (isPartB) => {
    let input = utils.readInput().trim();

    if(!isPartB) {
        input = removeReactingUnits(input);
        // 7004 = toLow
        term.bold('Result for part A: %s\n', input.length);
    } else {
        let results = [];
        for(let c = 65; c <= 90; c++) {
            let char = String.fromCharCode(c);
            let replaceRegex = new RegExp(char, 'ig');
            results.push({
                char,
                length: removeReactingUnits(input.replace(replaceRegex, '')).length
            });
        }

        let shortest = results.reduce((shortest, item) => item.length < shortest ? item.length : shortest, input.length);

        term.bold('Result for part B: %s\n', shortest);
    }
};