let term = require('terminal-kit').terminal;
let utils = require('./../utils');

let doSum = (value, index, isPartB) => {
    let nextIndex = index + 1;
    if(isPartB) {
        nextIndex = index + Math.floor(value.length / 2);
    }
    if(nextIndex < value.length) {
        return value.substr(index, 1) === value.substr(nextIndex, 1);
    } else {
        nextIndex = nextIndex - value.length;
        return value.substr(index, 1) === value.substr(nextIndex, 1);
    }
};

let getCapthaSum = (input, isPartB) => {
    let sum = 0;

    for(var i = 0; i < input.length; i++) {
        if(doSum(input, i, isPartB)) {
            sum += parseInt(input.substr(i, 1));
        }
    }

    return sum;
};

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