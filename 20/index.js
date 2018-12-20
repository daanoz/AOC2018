const term = require('terminal-kit').terminal;
const utils = require('./../utils');
const ScreenBuffer = require('terminal-kit').ScreenBuffer;

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.sides = {
            N: null,
            E: null,
            S: null,
            W: null
        };
    }
    coordThatIs(d) {
        switch(d) {
            case 'W' : return [this.x - 1, this.y];
            case 'S' : return [this.x, this.y + 1];
            case 'E' : return [this.x + 1, this.y];
            case 'N' : return [this.x, this.y - 1];
            default: { throw new Error('Unknown direction: ' + d); }
        }
    }
    link(cell, d) {
        switch(d) {
            case 'W' : this.sides.W = cell; cell.sides.E = this; break;
            case 'S' : this.sides.S = cell; cell.sides.N = this; break;
            case 'E' : this.sides.E = cell; cell.sides.W = this; break;
            case 'N' : this.sides.N = cell; cell.sides.S = this; break;
        }
    }
}

let lastT = 0;
let createdCells = 0;
let existingCells = 0;
let endings = 0;
const findLocations = (map, grid, cur, path) => {
    let now = new Date().getTime();
    if(now - lastT > 5000) {
        //draw(grid);
        console.log(createdCells, existingCells, endings);
        lastT = now;
    }
    let next = map.shift();
    if(next === '$') { // we are done here!
        endings++;
        return [path];
    } else if(next === '(') { // we can go multiple directions here...
        let endPos = -1;
        let depth = 1;
        let c = 0;
        let sections = [];
        let nextSection = 0;
        while(endPos < 0 && c < map.length) {
            if(map[c] === '(') {
                depth++;
            } else if(map[c] === ')') {
                depth--;
                if(depth <= 0) {
                    endPos = c;
                    sections.push(map.slice(nextSection, c));
                }
            } else if(map[c] === '|' && depth === 1) {
                sections.push(map.slice(nextSection, c));
                nextSection = c + 1;
            }
            c++;
        }
        if(endPos < 0) { throw new Error('Broken regex found!'); }
        map.splice(0, endPos + 1);
        return sections
            .map(s => findLocations(s.concat(map), grid, cur, path.concat([])))
            .reduce((list, s) => list.concat(s), []);
    } else {
        let [newX, newY] = cur.coordThatIs(next);
        if(!grid[newY]) {
            grid[newY] = {};
            grid[newY][newX] = new Cell(newX, newY);
            createdCells++;
        } else if(!grid[newY][newX]) {
            grid[newY][newX] = new Cell(newX, newY);
            createdCells++;
        } else {
            existingCells++;
        }
        let nextCell = grid[newY][newX];
        cur.link(nextCell, next);
        let cid = `${newX}:${newY}`;
        let existingCid = path.indexOf(cid);
        if(existingCid >= 0) {
            path = path.slice(0, existingCid + 1);
        } else {
            path.push(cid);
        }
        return findLocations(map, grid, nextCell, path);
    }
};

const draw = (grid) => {
    let range =[[Number.MAX_VALUE, Number.MIN_VALUE],[Number.MAX_VALUE, Number.MIN_VALUE]];
    Object.keys(grid).forEach(_y => {
        let y = parseInt(_y, 10);
        range[1][0] = Math.min(range[1][0], y);
        range[1][1] = Math.max(range[1][1], y);
        Object.keys(grid[_y]).forEach((_x) => {
            let x = parseInt(_x, 10);
            range[0][0] = Math.min(range[0][0], x);
            range[0][1] = Math.max(range[0][1], x);
        })
    });
    term.clear();
    screen = new ScreenBuffer({
        dst: term,
        width: ((range[0][1] - range[0][0]) * 2) + 3,
        height: ((range[1][1] - range[1][0]) * 2) + 20,
    });
    screen.fill({ char: '#' });
    for(let y = range[1][0]; y <= range[1][1]; y++) {
        for(let x = range[0][0]; x <= range[0][1]; x++) {
            let scrnX = ((x - range[0][0]) * 2) + 1;
            let scrny = ((y - range[1][0]) * 2) + 1;
            let cell = grid[y][x];
            if(cell) {
                screen.put({ x: scrnX, y: scrny }, x === 0 && y === 0 ? 'X' : '.');
                if(cell.sides.S) {
                    screen.put({ x: scrnX, y: scrny + 1 }, '-');
                }
                if(cell.sides.E) {
                    screen.put({ x: scrnX + 1, y: scrny }, '|');
                }
            }
        }
    }
    screen.draw();
}

module.exports = (isPartB) => {
    let input = utils.readInput('').split('');
    input.shift(); // ^

    let grid = {'0' : {'0' : new Cell(0, 0)}};
    let allPaths = findLocations(input, grid, grid[0][0], ['0:0']);

    //draw(grid);

    if(!isPartB)  {
        term.bold('Result for part A: %s\n', 0);
    } else {
        term.bold('Result for part B: %s\n', 0);
    }
};