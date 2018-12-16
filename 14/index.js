let term = require('terminal-kit').terminal;
let utils = require('./../utils');

module.exports = (isPartB) => {
    let input = 556061;
    let elves = [0, 1];
    let scores = [3, 7];

    if(!isPartB)  {
        while(scores.length < input + 10) {
            let newScore = elves.reduce((current, elfPos) => current + scores[elfPos], 0);
            if(newScore >= 10) {
                let secondDigit = newScore % 10;
                scores.push((newScore - secondDigit) / 10);
                scores.push(secondDigit);
            } else {
                scores.push(newScore);
            }

            elves = elves.map(elf =>
                (elf + scores[elf] + 1) % scores.length
            );
        }
        let result = scores.slice(input, input + 10).join('');
        term.bold('Result for part A: %s\n', result);
    } else {
        input = '' + input;
        let searching = true;
        let result = 0;
        while(searching) {
            let newScore = elves.reduce((current, elfPos) => current + scores[elfPos], 0);
            if(newScore >= 10) {
                let secondDigit = newScore % 10;
                scores.push((newScore - secondDigit) / 10);
                scores.push(secondDigit);
            } else {
                scores.push(newScore);
            }

            elves = elves.map(elf =>
                (elf + scores[elf] + 1) % scores.length
            );

            let lastRecipesIndex = scores.length - (input.length + 1);
            let lastScores = scores.slice(lastRecipesIndex, scores.length).join('');
            let scoreMatchIndex = lastScores.indexOf(input);
            if(scoreMatchIndex >= 0) {
                searching = false;
                result = lastRecipesIndex + scoreMatchIndex;
            }
        }

        term.bold('Result for part B: %s\n', result);
    }
};