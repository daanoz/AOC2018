let term = require('terminal-kit').terminal;
let utils = require('./../utils');

let powerLevel = (x, y, serial) => {
    let rackId = x + 10;
    let powerLevel = rackId * y;
    powerLevel += serial;
    powerLevel *= rackId;

    // Keep only the hundreds digit of the power level
    powerLevel -= powerLevel % 100;
    powerLevel = powerLevel % 1000;
    powerLevel = powerLevel / 100;

    powerLevel -= 5;
    return powerLevel;
}

let locateLargest = (grid, xRange, yRange, size) => {
    let largest = {
        val: 0,
        coord: []
    };
    for(x = 1; x < xRange - (size-1); x++) {
        for(y = 1; y < yRange - (size-1); y++) {
            let sum = 0;
            for(x2 = x; x2 < x+size; x2++) {
                for(y2 = y; y2 < y+size; y2++) {
                    sum += grid[x2][y2];
                }
            }
            if(sum > largest.val) {
                largest.val = sum;
                largest.coord = [x, y];
            }
        }
    }
    return largest;
}

module.exports = (isPartB) => {
    // console.log(powerLevel(3, 5, 8));
    // console.log(powerLevel(122, 79, 57));
    // console.log(powerLevel(217, 196, 39));
    // console.log(powerLevel(101, 153, 71));
    let xRange = 300;
    let yRange = 300;
    let serial = 7165;
    //serial = 18;
    //serial = 42;
    let grid = {}

    for(x = 1; x <= xRange; x++) {
        grid[x] = {};
        for(y = 1; y <= yRange; y++) {
            grid[x][y] = powerLevel(x, y, serial);
        }
    }


    if(!isPartB) {
        let largest = locateLargest(grid, xRange, yRange, 3);
        term.bold('Result for part A: cood: %s, value: %s\n', largest.coord, largest.val);
    } else {
        let largest = {
            val: 0,
            coord: []
        };
        for(s = 1; s <= 300; s++) {
            let result = locateLargest(grid, xRange, yRange, s);
            if(result.val > largest.val) {
                largest.val = result.val;
                largest.coord = result.coord;
                largest.coord.push(s);
            }
            console.log('Largest for %s: %s, current: %s', s, result.val, largest.coord);
        }
        term.bold('Result for part B: cood: %s, value: %s\n', largest.coord, largest.val);
    }
};