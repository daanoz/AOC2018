let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const matchRegisterNumbers = /\[(\d*), (\d*), (\d*), (\d*)\]/
const matchInstruction = /(\d*) (\d*) (\d*) (\d*)/

class Sample {
    constructor(before, instruction, after) {
        let matchBefore = matchRegisterNumbers.exec(before);
        if(!matchBefore) { throw 'Unable to match before: ' + before; }
        this.before = [parseInt(matchBefore[1], 10), parseInt(matchBefore[2], 10), parseInt(matchBefore[3], 10), parseInt(matchBefore[4], 10)];
        let matchAfter = matchRegisterNumbers.exec(after);
        if(!matchAfter) { throw 'Unable to match after: ' + after; }
        this.after = [parseInt(matchAfter[1], 10), parseInt(matchAfter[2], 10), parseInt(matchAfter[3], 10), parseInt(matchAfter[4], 10)];

        let matchedInstruction = matchInstruction.exec(instruction);
        if(!matchedInstruction) { throw 'Unable to match instruction: ' + instruction; }

        this.opCode = parseInt(matchedInstruction[1], 10);
        this.inputA = parseInt(matchedInstruction[2], 10);
        this.inputB = parseInt(matchedInstruction[3], 10);
        this.output = parseInt(matchedInstruction[4], 10);
    }

    guessOpCodes() {
        let opCodes = [];
        // addr
        if(this.before[this.inputA] + this.before[this.inputB] === this.after[this.output]) { opCodes.push('addr'); }
        // addi
        if(this.before[this.inputA] + this.inputB === this.after[this.output]) { opCodes.push('addi'); }
        // mulr
        if(this.before[this.inputA] * this.before[this.inputB] === this.after[this.output]) { opCodes.push('mulr'); }
        // muli
        if(this.before[this.inputA] * this.inputB === this.after[this.output]) { opCodes.push('muli'); }
        // banr
        if((this.before[this.inputA] & this.before[this.inputB]) === this.after[this.output]) { opCodes.push('banr'); }
        // bani
        if((this.before[this.inputA] & this.inputB) === this.after[this.output]) { opCodes.push('bani'); }
        // borr
        if((this.before[this.inputA] | this.before[this.inputB]) === this.after[this.output]) { opCodes.push('borr'); }
        // bori
        if((this.before[this.inputA] | this.inputB) === this.after[this.output]) { opCodes.push('bori'); }
        // setr
        if(this.before[this.inputA] === this.after[this.output]) { opCodes.push('setr'); }
        // seti
        if(this.inputA === this.after[this.output]) { opCodes.push('seti'); }
        // gtir
        if((this.inputA > this.before[this.inputB] ? 1 : 0) === this.after[this.output]) { opCodes.push('gtir'); }
        // gtri
        if((this.before[this.inputA] > this.inputB ? 1 : 0) === this.after[this.output]) { opCodes.push('gtri'); }
        // gtrr
        if((this.before[this.inputA] > this.before[this.inputB] ? 1 : 0) === this.after[this.output]) { opCodes.push('gtrr'); }
        // eqir
        if((this.inputA === this.before[this.inputB] ? 1 : 0) === this.after[this.output]) { opCodes.push('eqir'); }
        // eqri
        if((this.before[this.inputA] === this.inputB ? 1 : 0) === this.after[this.output]) { opCodes.push('eqri'); }
        // eqrr
        if((this.before[this.inputA] === this.before[this.inputB] ? 1 : 0) === this.after[this.output]) { opCodes.push('eqrr'); }

        this.opCodes = opCodes;
        return this.opCodes;
    }
}

module.exports = (isPartB) => {
    // let s = new Sample('Before: [3, 2, 1, 1]', '9 2 1 2', 'After:  [3, 2, 2, 1]');
    // console.log(s.guessOpCodes());

    const inputs = utils.readNewLineSeperatedInput('inputA');
    const samples = [];
    for(let l = 0; l < inputs.length; l += 4) {
        samples.push(new Sample(inputs[l + 0], inputs[l + 1], inputs[l + 2]));
    }
    samples.map(s => s.guessOpCodes());

    if(!isPartB)  {
        let possibilitiesPerSample = samples.map(s => s.opCodes.length);
        let samplesWithAtLeast3 = possibilitiesPerSample.filter(c => c >= 3);
        term.bold('Result for part A: %s\n', samplesWithAtLeast3.length);
    } else {
        let foundInstructions = [];
        let instructionMap = {};
        for(let i = 0; i < 16; i++) { instructionMap[i] = null; }
        let l = 0;
        while(foundInstructions.length < 16) {
            Object.keys(instructionMap).forEach(i => {
                if(instructionMap[i] !== null) { return; }
                let possibilites = null;
                samples.filter(s => ('' + s.opCode) === i).forEach(s => {
                    let availableOpcodes = s.opCodes.filter(code => foundInstructions.indexOf(code) < 0);
                    if(possibilites === null) {
                        possibilites = availableOpcodes;
                    } else {
                        possibilites = possibilites.filter(oc => availableOpcodes.indexOf(oc) >= 0);
                    }
                });
                if(possibilites == null || possibilites.length !== 1) {
                    // to many or no options available
                } else {
                    instructionMap[i] = possibilites[0];
                    foundInstructions.push(possibilites[0])
                }
            });
            l++;
        }

        const code = utils.readNewLineSeperatedInput('inputB');

        let registers = [0, 0, 0, 0]
        code.forEach(c => {
            let matchedInstruction = matchInstruction.exec(c);
            if(!matchedInstruction) { throw 'Unable to match instruction: ' + c; }

            let opCode = parseInt(matchedInstruction[1], 10);
            let inputA = parseInt(matchedInstruction[2], 10);
            let inputB = parseInt(matchedInstruction[3], 10);
            let output = parseInt(matchedInstruction[4], 10);

            switch(instructionMap[opCode]) {
                case 'addr': registers[output] = registers[inputA] + registers[inputB]; break;
                case 'addi': registers[output] = registers[inputA] + inputB; break;
                case 'mulr': registers[output] = registers[inputA] * registers[inputB]; break;
                case 'muli': registers[output] = registers[inputA] * inputB; break;
                case 'banr': registers[output] = registers[inputA] & registers[inputB]; break;
                case 'bani': registers[output] = registers[inputA] & inputB; break;
                case 'borr': registers[output] = registers[inputA] | registers[inputB]; break;
                case 'bori': registers[output] = registers[inputA] | inputB; break;
                case 'setr': registers[output] = registers[inputA]; break;
                case 'seti': registers[output] = inputA; break;
                case 'gtir': registers[output] = inputA > registers[inputB] ? 1 : 0; break;
                case 'gtri': registers[output] = registers[inputA] > inputB ? 1 : 0; break;
                case 'gtrr': registers[output] = registers[inputA] > registers[inputB] ? 1 : 0; break;
                case 'eqir': registers[output] = inputA === registers[inputB] ? 1 : 0; break;
                case 'eqri': registers[output] = registers[inputA] === inputB ? 1 : 0; break;
                case 'eqrr': registers[output] = registers[inputA] === registers[inputB] ? 1 : 0; break;
                default: { throw 'unmapped instruction: ' + instructionMap[opCode]; }
            }
        })

        term.bold('Result for part B: %s\n', registers[0]);
    }
};