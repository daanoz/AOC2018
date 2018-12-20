let term = require('terminal-kit').terminal;
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let utils = require('./../utils');

class Cell {
    constructor(x, y, state) {
        this.x = x;
        this.y = y;
        this.state = state;
        this.nextState = null;
    }

    setNeighbours(bg) {
        this.neighbours = [
            bg[this.y - 1] ? bg[this.y - 1][this.x] : null, // top
            bg[this.y - 1] ? bg[this.y - 1][this.x - 1] : null, // top left
            bg[this.y - 1] ? bg[this.y - 1][this.x + 1] : null, // top right
            bg[this.y + 1] ? bg[this.y + 1][this.x] : null, // bottom
            bg[this.y + 1] ? bg[this.y + 1][this.x - 1] : null, // bottom left
            bg[this.y + 1] ? bg[this.y + 1][this.x + 1] : null, // bottom right
            bg[this.y][this.x - 1] ? bg[this.y][this.x - 1] : null, // left
            bg[this.y][this.x + 1] ? bg[this.y][this.x + 1] : null, // right
        ].filter(c => !!c);
    }

    isNeighboursAtLeast(ofState, count) {
        let found = 0;
        return this.neighbours.some(n => {
            if(n.state === ofState) {
                found++;
                if(found >= count) {
                    return true;
                }
            }
            return false;
        });
    }

    findNext() {
        this.nextState = this.state;
        if(this.state === '.') {
            if(this.isNeighboursAtLeast('|', 3)) { this.nextState = '|'; }
        } else if(this.state === '|') {
            if(this.isNeighboursAtLeast('#', 3)) { this.nextState = '#'; }
        } else if(this.state === '#') {
            if(!this.isNeighboursAtLeast('#', 1) || !this.isNeighboursAtLeast('|', 1)) {
                this.nextState = '.';
            }
        }
    }

    setNext() {
        this.state = this.nextState;
    }
}

const drawGround = (gr) => {
    Object.keys(gr).forEach(y => {
        Object.keys(gr[y]).forEach(x => {
            let cell = gr[y][x];
            screen.put({
                x: cell.x,
                y: cell.y,
            }, cell.state);
        });
    });
    screen.draw();
}

const countTreesYards = (cells) => {
    let trees = 0;
    let yards = 0;
    cells.forEach(c => {
        if(c.state === '|') { trees++; }
        if(c.state === '#') { yards++; }
    });
    return { trees, yards };
}

let screen;
module.exports = (isPartB, isVisual) => {
    const inputs = utils.readNewLineSeperatedInput('');
    const size = [inputs[0].length, inputs.length];

    if (isVisual) {
        term.clear();
        screen = new ScreenBuffer({
            dst: term,
            width: size[0]*3,
            height: size[1],
        });
        screen.fill({ char: ' ' });
        screen.draw();
    }


    let cells = [];
    const grounds = {};
    inputs.forEach((line, y) => {
        grounds[y] = {};
        line.split('').forEach((cell, x) => {
            grounds[y][x] = new Cell(x, y, cell);
            cells.push(grounds[y][x]);
        })
    });
    if(isVisual) { drawGround(grounds); }
    cells.forEach(cell => cell.setNeighbours(grounds));

    const done = () => {
        let trees = cells.reduce((curr, c) => c.state === '|' ? curr + 1 : curr, 0);
        let yards = cells.reduce((curr, c) => c.state === '#' ? curr + 1 : curr, 0);

        if(!isPartB)  {
            term.bold('Result for part A: %s\n', trees * yards);
        } else {
            term.bold('Result for part B: %s\n', trees * yards);
        }
    };

    if(isVisual) {
        let c = 0;
        let tick = () => {
            if(c >= (isPartB ? 1000000000 : 10)) {
                done();
                return;
            }
            cells.forEach(cell => cell.findNext());
            cells.forEach(cell => cell.setNext());
            drawGround(grounds);
            c++;
            setTimeout(tick, 10);
        }
        tick();
    } else {
        if(isPartB) {
            let totalCount = 1000000000;
            let countStable = 900;
            let sampleCount = 100;

            // move by 900 to get a stable loop
            for(let i = 0; i < countStable; i++) {
                cells.forEach(cell => cell.findNext());
                cells.forEach(cell => cell.setNext());
            }
            let combinations = [];
            // move another 100 while capturing combinations
            for(let i = 0; i < sampleCount; i++) {
                cells.forEach(cell => cell.findNext());
                cells.forEach(cell => cell.setNext());
                let { trees, yards } = countTreesYards(cells);
                combinations.push(trees + '-' + yards);
            }
            let initial = combinations[0];
            let repeatsAfter = combinations.indexOf(initial, 1);
            let remaining = totalCount - (countStable + sampleCount);
            let offsetBy = remaining % repeatsAfter;
            // move by remaining offset to get final position
            for(let i = 0; i < offsetBy; i++) {
                cells.forEach(cell => cell.findNext());
                cells.forEach(cell => cell.setNext());
            }
            done();
        } else {
            for(let i = 0; i < 10000; i++) {
                cells.forEach(cell => cell.findNext());
                cells.forEach(cell => cell.setNext());
            }
            done();
        }
    }
};