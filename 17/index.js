let term = require('terminal-kit').terminal;
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let utils = require('./../utils');

let match = /(x|y)=(\d*), (x|y)=(\d*)..(\d*)/;
let screen;
const isVisual = false;

const drawGround = (range, ground) => {
    for(let y = range[1][0]; y <= range[1][1]; y++) {
        for(let x = range[0][0]; x <= range[0][1]; x++) {
            screen.put({
                x: x - range[0][0],
                y: y,
            }, ground[y][x]);
        }
    }
    screen.draw();
}

floodBetweenWalls = (row, xPos) => {
    let xList = [xPos];
    let x = xPos - 1;
    while('|' === row[x]) {
        xList.push(x);
        x--;
    }
    if(row[x] !== '#') { return; /* we probably dropped of a cliff */ }
    x = xPos + 1;
    while('|' === row[x]) {
        xList.push(x);
        x++;
    }
    if(row[x] !== '#') { return; /* we probably dropped of a cliff */ }
    return xList;
}

floodFromPos = async (ground, pos, draw) => {
    let [x, y] = pos;
    if(!ground[y + 1]) { return; }
    if(ground[y + 1]) {
        let below = ground[y + 1][x];
        if(below === '.') {
            ground[y + 1][x] = '|';
            await draw();
            await floodFromPos(ground, [x, y + 1], draw);
        }
        below = ground[y + 1][x];
        if(below === '~' || below === '#') {
            if(ground[y][x + 1] === '.') {
                ground[y][x + 1] = '|';
                await draw();
                await floodFromPos(ground, [x + 1, y], draw);
            }
        }
        below = ground[y + 1][x];
        if(below === '~' || below === '#') {
            if(ground[y][x - 1] === '.') {
                ground[y][x - 1] = '|';
                await draw();
                await floodFromPos(ground, [x - 1, y], draw);
            }
        }
        let levelFloodX = floodBetweenWalls(ground[y], x);
        if(levelFloodX) {
            levelFloodX.forEach(lx => ground[y][lx] = '~');
            return await draw();
        }
    }
};

const countCells = (ground, range, types) => {
    return Object.values(ground)
                .filter((row, y) => y >= range[1][0])
                .reduce((cur, level) =>
                    cur + Object.values(level)
                                .reduce((sum, cell) =>
                                types.indexOf(cell) >= 0 ? sum + 1 : sum,
                                    0
                                ),
                    0
                );
}

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput('');
    let clay = [];
    let range = [[499, 501], [10, 1]];
    inputs.forEach(line => {
        let lineMatch = match.exec(line);
        if(!lineMatch) { throw new Error('Failed to match: ' + line); }
        let c1 = parseInt(lineMatch[2], 10);
        let c2a = parseInt(lineMatch[4], 10);
        let c2b = parseInt(lineMatch[5], 10);
        if(lineMatch[1] === 'x') {
            range[0][0] = Math.min(range[0][0], c1 - 1);
            range[0][1] = Math.max(range[0][1], c1 + 1);
            range[1][0] = Math.min(range[1][0], c2b, c2a);
            range[1][1] = Math.max(range[1][1], c2b, c2a);
            clay.push([[c1, Math.min(c2a, c2b)], [c1, Math.max(c2a, c2b)]]);
        } else {
            range[1][0] = Math.min(range[1][0], c1);
            range[1][1] = Math.max(range[1][1], c1);
            range[0][0] = Math.min(range[0][0], c2b - 1, c2a - 1);
            range[0][1] = Math.max(range[0][1], c2b + 1, c2a + 1);
            clay.push([[Math.min(c2a, c2b), c1], [Math.max(c2a, c2b), c1]]);
        }
    });
    range[0][1]++;

    let ground = {};
    for(let y = 0; y <= range[1][1]; y++) {
        ground[y] = {};
        for(let x = range[0][0]; x <= range[0][1]; x++) {
            if(x === 500 && y === 0) {
                ground[y][x] = '+';
            } else {
                ground[y][x] = '.';
            }
        }
    }
    clay.forEach(c => {
        for(let y = c[0][1]; y <= c[1][1]; y++) {
            for(let x = c[0][0]; x <= c[1][0]; x++) {
                ground[y][x] = '#';
            }
        }
    });

    if (isVisual) {
        term.clear();
        screen = new ScreenBuffer({
            dst: term,
            width: range[0][1] - range[0][0],
            height: range[1][1] + 1,
        });
        screen.fill({ char: ' ' });
        screen.draw();
        drawGround(range, ground);
    }

    const tick = (done, t) => {
        floodFromPos(ground, [500, 0], () => {
            return new Promise(resolve => {
                if (isVisual) {
                    drawGround(range, ground);
                    setTimeout(() => {
                        resolve();
                    }, 50);
                } else {
                    resolve();
                }
            });
        }).then(done);
    }

    const done = () => {
        utils.writeOutput(Object.values(ground).reduce((cur, level) => cur + Object.values(level).join('').replace(/\./g, ' ') + '\n', ''));

        if(!isPartB)  {
            let water = countCells(ground, range, ['|', '~']);
            term.bold('Result for part A: %s\n', water);
        } else {
            let stillWater = countCells(ground, range, ['~']);
            term.bold('Result for part B: %s\n', stillWater);
        }
    };
    tick(done, 0);
};