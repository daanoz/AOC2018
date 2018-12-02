let term = require('terminal-kit').terminal;
let utils = require('./../utils');

module.exports = (isPartB) => {
    let inputs = utils.readNewLineSeperatedInput();

    if(!isPartB) {
        let sum = 0;
        inputs.forEach(input => {
            if(input) {
                let operator = input.substr(0, 1);
                let value = input.substr(1);
                if(operator === '-') {
                    sum -= parseInt(value);
                } else {
                    sum += parseInt(value);
                }
            }
        });
        term.bold('Result for part A: %s\n', sum);
    } else {
        let frequencies = [];
        let doubleFrequencySum = 0;
        let doubleFrequency = null;
        while(doubleFrequency === null) {
            inputs.forEach(input => {
                if(input && doubleFrequency === null) {
                    let operator = input.substr(0, 1);
                    let value = input.substr(1);
                    if(operator === '-') {
                        doubleFrequencySum -= parseInt(value);
                    } else {
                        doubleFrequencySum += parseInt(value);
                    }
                    if(frequencies.indexOf(doubleFrequencySum) >= 0) {
                        doubleFrequency = doubleFrequencySum;
                    } else {
                        frequencies.push(doubleFrequencySum);
                    }
                }
            });
        }

        term.bold('Result for part B: %s\n', doubleFrequency);
    }
};