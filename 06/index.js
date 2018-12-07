let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const manhattanDistance = (a, b) => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

const countCells = (grid, range) => {
    let counts = {};
    for(let x = range.x[0]; x <= range.x[1]; x++) {
        for(let y = range.y[0]; y <= range.y[1]; y++) {
            let val = grid[x][y];
            if(!counts[val]) {
                counts[val] = 1;
            } else {
                counts[val]++;
            }
        }
    }
    return counts;
}

module.exports = (isPartB) => {
    let inputs = utils.readNewLineSeperatedInput('');
    let coords = [];
    let range = { x: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], y: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] }
    inputs.forEach(input => {
        let [x, y] = input.split(', ');
        x = parseInt(x, 10);
        y = parseInt(y, 10);
        coords.push([x , y]);
        if(range.x[0] > x) { range.x[0] = x;}
        if(range.x[1] < x) { range.x[1] = x;}
        if(range.y[0] > y) { range.y[0] = y;}
        if(range.y[1] < y) { range.y[1] = y;}
    });
    let grid = {};
    for(let x = range.x[0]; x <= range.x[1]; x++) {
        grid[x] = {};
        for(let y = range.y[0]; y <= range.y[1]; y++) {
            grid[x][y] = '?';
        }
    }

    if(!isPartB) {
        coords.forEach((coord, index) => grid[coord[0]][coord[1]] = index);
        for(let x = range.x[0]; x <= range.x[1]; x++) {
            for(let y = range.y[0]; y <= range.y[1]; y++) {
                if(grid[x][y] === '?') {
                    let here = [x, y];
                    let result = coords.reduce((current, item, index) => {
                        let distance = manhattanDistance(here, item);
                        if(distance < current.distance) {
                            return { distance, index };
                        } else if(distance === current.distance) {
                            return { distance, index: '.' }
                        }
                        return current;
                    }, {distance: Number.POSITIVE_INFINITY, index: -1} );
                    if(result.index !== -1) {
                        grid[x][y] = result.index;
                    }
                }
            }
        }

        let counts = countCells(grid, range);
        let largestArea = Object.keys(counts).reduce((current, key) => {
            if(key === '.') { return current; }
            return counts[key] < current ? current : counts[key];
        }, 0)

        term.bold('Result for part A: %s\n', largestArea);
    } else {
        for(let x = range.x[0]; x <= range.x[1]; x++) {
            for(let y = range.y[0]; y <= range.y[1]; y++) {
                if(grid[x][y] === '?') {
                    let here = [x, y];
                    let result = coords.reduce((current, item) => {
                        return current + manhattanDistance(here, item);
                    }, 0);
                    if(result < 10000) {
                        grid[x][y] = '#';
                    } else {
                        grid[x][y] = '.';
                    }
                }
            }
        }
        let counts = countCells(grid, range);

        term.bold('Result for part B: %s\n', counts['#']);
    }
};