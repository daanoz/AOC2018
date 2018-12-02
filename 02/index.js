let term = require('terminal-kit').terminal;
let utils = require('./../utils');


module.exports = (isPartB) => {
    let inputs = utils.readNewLineSeperatedInput();

    if(!isPartB) {
        let countTwo = 0;
        let countThree = 0;
        inputs.forEach(input => {
            let lc = {};
            input.split('').forEach(letter => {
                if(!lc[letter]) {
                    lc[letter] = 1;
                } else {
                    lc[letter]++;
                }
            });
            let hasTwo = false;
            let hasThree = false;
            Object.keys(lc).forEach(letter => {
                if(lc[letter] === 2) { hasTwo = true; }
                if(lc[letter] === 3) { hasThree = true; }
            });
            if(hasTwo) { countTwo++ };
            if(hasThree) { countThree++ };
        });

        term.bold('Result for part A: %s\n', countTwo * countThree);
    } else {
        let boxIds = [];
        inputs.forEach(inputA => {
            inputs.forEach(inputB => {
                if(inputA === inputB) {
                    return;
                }
                let aList = inputA.split('');
                let bList = inputB.split('');
                let boxId = '';
                aList.forEach((letter, index) => {
                    if(bList[index] === letter) {
                        boxId += letter;
                    }
                });
                boxIds.push(boxId);
            });
        });

        let result = boxIds.reduce((current, id) => (current.length > id.length) ? current : id, '');

        term.bold('Result for part B: %s\n', result);
    }
};