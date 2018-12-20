let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const matchInstruction = /([a-z]{4}) (\d*) (\d*) (\d*)/

module.exports = (isPartB) => {
    //const code = utils.readNewLineSeperatedInput('input');
    const code = utils.readNewLineSeperatedInput('input_optimized');
    const instructions = [];
    let registryKey = 0;
    code.forEach(c => {
        let matchedInstruction = matchInstruction.exec(c);
        if(!matchedInstruction) {
            if(c.startsWith('#ip ')) {
                registryKey = parseInt(c.substr(4), 10);
                return;
            }
            throw 'Unable to match instruction: ' + c;
        }
        instructions.push({
            instruction: matchedInstruction[1],
            inputA: parseInt(matchedInstruction[2], 10),
            inputB: parseInt(matchedInstruction[3], 10),
            output: parseInt(matchedInstruction[4], 10)
        });
    });

    let registers = [0, 0, 0, 0, 0, 0];
    const run = () => {
        let running = true;
        while(running) {
            if(!instructions[registers[registryKey]]) {
                running = false;
                break;
            }
            const { instruction, inputA, inputB, output } = instructions[registers[registryKey]];
            instructions[registers[registryKey]].c++;
            switch(instruction) {
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
                default: { throw 'unmapped instruction: ' + instruction; }
            }
            registers[registryKey]++;
        }
    }

    let runFake = false;
    if(!isPartB)  {
        if(runFake) { // fale
            term.bold('Result for part A: %s\n', translated(0));
        } else {
            run();
            term.bold('Result for part A: %s\n', registers[0]);
        }
    } else {
        if(runFake) { // fale
            term.bold('Result for part B: %s\n', translated(1));
        } else {
            registers[0] = 1;
            run();
            term.bold('Result for part B: %s\n', registers[0]);
        }
    }
};


let translated = (r0) => {
    let registers = [r0, 0, 0, 0, 0, 0];

    // 19 to 26
    registers[4] = registers[4] + 2;
    registers[4] = registers[4] + registers[4];
    registers[4] *= 19;
    registers[4] *= 11;
    registers[3] += 3;
    registers[3] *= 22;
    registers[3] += 4;
    registers[4] += registers[3];

    if(registers[0] === 1) { // isPartB
        registers[3] = 27;
        registers[3] *= 28;
        registers[3] += 29;
        registers[3] *= 30;
        registers[3] *= 14;
        registers[3] *= 32;
        registers[4] += registers[3];
    }

    registers[0] = 0; // reset

    let looping = true;

    registers[5] = 1;

    let innerLoop = () => {
        registers[3] = registers[5] * registers[2];
        if(registers[3] === registers[4]) {
            registers[0] += registers[5];
        }
        registers[2] += 1;
    }

    while(looping) {
        registers[2] = 1;
        while(registers[2] <= registers[4]/* speed hack */&& registers[3] < registers[4]/* speed hack */) {
            innerLoop();
        }
        registers[3] = 0;
        registers[5]++;
        if(registers[5] > registers[4]) {
            looping = false;
        }
    }

    return registers[0];
}