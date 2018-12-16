let term = require('terminal-kit').terminal;
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let utils = require('./../utils');

const regexInitial = /initial state: ([.#]*)/;
const regexRule = /([.#]{5}) => ([.#])/;

class Rule {
    constructor(match, result) {
        this.match = {
            prev2: match[0] === '#',
            prev1: match[1] === '#',
            curr:  match[2] === '#',
            next1: match[3] === '#',
            next2: match[4] === '#',
        };
        this.result = result === '#';
    }
    isMatch(states, i) {
        return  states.prev2 === this.match.prev2 &&
                states.prev1 === this.match.prev1 &&
                states.curr === this.match.curr &&
                states.next1 === this.match.next1 &&
                states.next2 === this.match.next2;
    }
}

let plantValue = (plants, sumPad) => {
   return plants.reduce((curr, p, i) => curr + (p === '#'?(i - sumPad):0), 0);
}

let printPlants = (l, plants) => {
    term('%s: %s\n', (''+ l).padStart(2), plants.join(''))
}

let runGeneration = (plants, rules) => {
    plants.unshift('.', '.', '.');
    plants.push('.', '.', '.');
    let newPlants = new Array(plants.length).fill('.');
    for(let i = 2; i < plants.length - 2; i++) {
        let states = {
            prev2: plants[i - 2] === '#',
            prev1: plants[i - 1] === '#',
            curr:  plants[i    ] === '#',
            next1: plants[i + 1] === '#',
            next2: plants[i + 2] === '#'
        };
        let matchedRule = rules.find(rule => rule.isMatch(states));
        if(matchedRule) {
            newPlants[i] = matchedRule.result ? '#' : '.';
        }
    }
    return newPlants;
};

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput('');
    let initialMatch = regexInitial.exec(inputs[0]);
    if(!initialMatch) { throw 'Failure reading initial state:' + inputs[0]; }

    let plants = initialMatch[1].split('');
    let rules = [];
    inputs.shift(); inputs.shift();
    inputs.forEach(input => {
        let ruleMatch = regexRule.exec(input);
        if(!ruleMatch) { throw 'Failure reading rule: ' + input;  }
        rules.push(new Rule(ruleMatch[1], ruleMatch[2]));
    });

    let sumPad = 0;
    let tick = () => {
        plants = runGeneration(plants, rules);
        sumPad += 3;
    }

    if(!isPartB)  {
        printPlants(0, plants);
        for(let l = 0; l < 20; l++) {
            tick();
            printPlants(l + 1, plants);
        }
        let sum = plantValue(plants, sumPad);
        term.bold('Result for part A: %s\n', sum);
    } else {
        let loops = 200;
        for(let l = 0; l < loops; l++) {
            tick();
        }
        let sumAfterFirstLoops = plantValue(plants, sumPad);
        tick();
        let delta = plantValue(plants, sumPad) - sumAfterFirstLoops;
        term.bold('Result for part B: %s\n', sumAfterFirstLoops + ((50000000000 - loops) * delta));
    }
};