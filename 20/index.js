const term = require('terminal-kit').terminal;
const utils = require('./../utils');

class Cell {
    constructor(x, y, distance) {
        this.x = x;
        this.y = y;
        this.distance = distance;
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
}

module.exports = (isPartB) => {
    let input = utils.readInput('').split('');
    input.shift();// ^

    let grid = {'0' : {'0' : new Cell(0, 0, 0)}};

    let splitPoints = [];
    let nextPos = grid[0][0];
    input.forEach(next => {
        if(next === '$') { // we are done here!
            return;
        } else if(next === '(') {
            splitPoints.push(nextPos);
        } else if(next === ')') {
            nextPos = splitPoints.pop();
        } else if(next === '|') {
            nextPos = splitPoints[splitPoints.length - 1];
        } else {
            let [newX, newY] = nextPos.coordThatIs(next);
            if(!grid[newY]) {
                grid[newY] = {};
                grid[newY][newX] = new Cell(newX, newY, nextPos.distance + 1);
            } else if(!grid[newY][newX]) {
                grid[newY][newX] = new Cell(newX, newY, nextPos.distance + 1);
            } else {
                grid[newY][newX].distance = Math.min(nextPos.distance + 1, grid[newY][newX].distance);
            }
            nextPos = grid[newY][newX];
        }
    });

    if(!isPartB)  {
        let largest = Object.values(grid).reduce((highestRow, row) => {
            let rowHigh = Object.values(row).reduce((highest, cell) => cell.distance > highest ? cell.distance : highest, 0);
            return rowHigh > highestRow ? rowHigh : highestRow;
        }, 0);
        term.bold('Result for part A: %s\n', largest);
    } else {
        let thousandRooms = Object.values(grid).reduce((list, row) => {
            let roomRowList = Object.values(row).filter(cell => cell.distance >= 1000);
            return list.concat(roomRowList);
        }, []);
        term.bold('Result for part B: %s\n', thousandRooms.length);
    }
};