let term = require('terminal-kit').terminal;
let utils = require('./../utils');

module.exports = (isPartB, visualize) => {
    let depth = 4080;
    let target = [14, 785];
    // depth = 510;
    // target = [10, 10];

    range = [target[0], target[1]];
    if(isPartB) {
        range[0] += 10;
        range[1] += 10;
    }

    let grid = {};
    for(let y = 0; y <= range[1]; y++) {
        grid[y] = {};
        for(let x = 0; x <= range[0]; x++) {
            let geologicIndex;
            if(y === 0) {
                geologicIndex = x * 16807;
            } else if (x === 0) {
                geologicIndex = y * 48271;
            } else {
                geologicIndex = grid[y][x-1] * grid[y-1][x];
            }
            grid[y][x] = (geologicIndex + depth) % 20183;
        }
    }

    if(visualize) {
        for(let y = 0; y <= range[1]; y++) {
            let line = '';
            for(let x = 0; x <= range[0]; x++) {
                let t = grid[y][x] % 3;
                switch(t) {
                    case 0 : line += '.'; break;
                    case 1 : line += '='; break;
                    case 2 : line += '|'; break;
                }
            }
            term(line + '\n');
        }
    }

    if(!isPartB)  {
        let sum = 0;
        for(let y = 0; y <= target[1]; y++) {
            for(let x = 0; x <= target[0]; x++) {
                sum += grid[y][x] % 3;
            }
        }
        sum -=  grid[0][0] % 3;
        sum -=  grid[target[1]][target[0]] % 3;

        term.bold('Result for part A: %s\n', sum);
    } else {
        let movementGrid = {};
        for(let y = 0; y <= range[1]; y++) {
            movementGrid[y] = {};
            for(let x = 0; x <= range[0]; x++) {
                movementGrid[y][x] = new Cell(x, y, grid[y][x] % 3, target);
            }
        }
        for(let y = 0; y <= range[1]; y++) {
            for(let x = 0; x <= range[0]; x++) {
                movementGrid[y][x].updateNeighbours(movementGrid);
            }
        }
        movementGrid[0][0].time = 0;
        movementGrid[0][0].equipment = ['T'];
        
        const moveTo = (cell) => {
            let exec = (cb) => {
                let targets = cell.canMoveInto();
                if(targets.length < 1) { cb(); }
                completionCount = 0;
                targets.forEach(t => {
                    t.cell.time = t.targetTime;
                    t.cell.equipment = t.equipment;

                    moveTo(t.cell).then(() => {
                        completionCount++;
                        if(completionCount === targets.length) {
                            cb();
                        }
                    });
                });
            }

            return new Promise(resolve => 
                setTimeout(() => exec(resolve), 0)
            );
        };
        moveTo(movementGrid[0][0]).then(() => {
            if(visualize) {
                for(let y = 0; y <= range[1]; y++) {
                    let line = '';
                    for(let x = 0; x <= range[0]; x++) {
                        let t = movementGrid[y][x].time;
                        line += (''+t).padStart(5, ' ');
                    }
                    term(line + '\n');
                }
            }

            // 1081 to high
            // 1070 to low
            // 1080 to high
            // 1075 wrong
            // 1078 correct, -3?
            term.bold('Result for part B: %s\n', movementGrid[target[1]][target[0]].time);
        });
    }
};

class Cell {
    constructor(x, y, type, target) {
        this.x = x; 
        this.y = y; 
        this.type = type;
        if(x === target[0] && y === target[1]) {
            this.allowedEquipment = ['T'];
            this.type = 4; // finish
        } else {
            this.allowedEquipment = this.needs();
        }
        this.time = undefined;
        this.equipment = undefined;
        this.neighbours = [];
    }
    canMoveInto() {
        return this.neighbours.map(n => {
            let nextEquipments;
            let switchedEquipment = false;
            if(this.type === n.type) {
                nextEquipments = this.equipment;
            } else if(n.allowedEquipment.indexOf(this.equipment[0]) >= 0) {
                nextEquipments = [this.equipment[0]];
            } else if(this.equipment.length > 0 && n.allowedEquipment.indexOf(this.equipment[1]) >= 0) {
                nextEquipments = [this.equipment[1]];
            } else {
                nextEquipments = n.allowedEquipment;
                switchedEquipment = true;
            }

            let targetTime = this.time + (switchedEquipment ? 7 + 1 : 1);
            return {
                cell: n,
                targetTime,
                equipment: nextEquipments
            };
        }).filter(t => {
            if(t.cell.time === undefined) { return true; }
            return t.targetTime < t.cell.time;
        });
    }
    // isSameEquipment(e) {
    //     if(this.type === 0 && (e === 'T' && e === 'C')) { return true; }
    //     if(this.type === 1 && (e === 'N' && e === 'C')) { return true; }
    //     if(this.type === 2 && (e === 'N' && e === 'T')) { return true; }
    //     return false;
    // }
    needs() {
        if(this.type === 0) { return ['T', 'C']; }
        if(this.type === 1) { return ['N', 'C']; }
        if(this.type === 2) { return ['N', 'T']; }
    }
    updateNeighbours(grid) {
        let x = this.x;
        let y = this.y;
        if(grid[y - 1]) { this.neighbours.push(grid[y - 1][x]); }
        if(grid[y + 1]) { this.neighbours.push(grid[y + 1][x]); }
        if(grid[y][x - 1]) { this.neighbours.push(grid[y][x - 1]); }
        if(grid[y][x + 1]) { this.neighbours.push(grid[y][x + 1]); }
    }
}