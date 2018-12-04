let term = require('terminal-kit').terminal;
let utils = require('./../utils');

class Claim {
    constructor(id, left, top, width, height) {
        this.id = id;
        this.left = parseInt(left);
        this.top = parseInt(top);
        this.width = parseInt(width);
        this.height = parseInt(height);
    }
    right() { return this.left + this.width; }
    bottom() { return this.top + this.height; }
    applyToGrid(grid) {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                grid[x + this.left][y + this.top]++;
            }
        }
    }
    isIntact(grid) {
        let foundOverlap = false;
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                if(grid[x + this.left][y + this.top] !== 1) {
                    foundOverlap = true;
                }
            }
        }
        return !foundOverlap;
    }
}

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput();
    const lineRegex = /^#(\d*) @ (\d*),(\d*): (\d*)x(\d*)$/i;
    const claims = [];
    inputs.forEach(input => {
        const matches = lineRegex.exec(input);
        if(matches) {
            claims.push(new Claim(matches[1], matches[2], matches[3], matches[4], matches[5]));
        }
    });
    const maxWidth = claims.reduce((max, claim) => claim.right() > max ? claim.right() : max, 0);
    const maxHeight = claims.reduce((max, claim) => claim.bottom() > max ? claim.bottom() : max, 0);

    const grid = [];
    for(let x = 0; x < maxWidth; x++) {
        let column = [];
        for(let y = 0; y < maxHeight; y++) {
            column.push(0);
        }
        grid.push(column);
    }

    claims.forEach(claim => claim.applyToGrid(grid));
    if(!isPartB) {
        let doubleCount = grid.reduce((total, column) => {
            return total + column.reduce((columnCount, cell) => {
                return columnCount + (cell > 1 ? 1 : 0);
            }, 0);
        }, 0);

        term.bold('Result for part A: %s\n', doubleCount);
    } else {
        const intactClaims = claims.filter(claim => claim.isIntact(grid));
        if(intactClaims.length < 1) {
            console.log('No results found for part B');
            return;
        }
        term.bold('Result for part B: %s, found %s intact claims\n', intactClaims[0].id, intactClaims.length);
    }
};