let term = require('terminal-kit').terminal;
let utils = require('./../utils');

let matcher = /pos=<([\d-]*),([\d-]*),([\d-]*)>, r=([\d-]*)/;

const mDist = (a, b) => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
}

class Bot {
    constructor(x, y, z, range) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.coord = [this.x, this.y, this.z];
        this.range = range;
    }
    distanceTo(bot) {
        return mDist(bot, this.asCoord());
    }
    isInRange(bot) {
        return this.distanceTo(bot) <= this.range;
    }
    asCoord() { 
        return this.coord;
    }
}

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput('');

    let bots = [];
    inputs.forEach(input => {
        let match = matcher.exec(input);
        if(!match) { throw new Error('Unable to match ' + input); }
        bots.push(new Bot(
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10),
            parseInt(match[4], 10)
        ));
    });

    if(!isPartB)  {
        let largestRangeBot = bots.reduce((curr, bot) => (curr === null || curr.range < bot.range) ? bot : curr, null);
        let inRangeBots = bots.filter(bot => largestRangeBot.isInRange(bot.asCoord()));
        term.bold('Result for part A: %s\n', inRangeBots.length);
    } else {
        const center = [0, 0, 0];
        const inRangeOf = (coord) => {
            let c = 0;
            for(let i = 0; i < bots.length; i++) {
                if(bots[i].isInRange(coord)) { c++ }
            }
            return c;
        };
        let bestHit = {c: [0, 0, 0], d: 0};
        let maxCount = 0;
        let decreasingDelta = Math.pow(2, 26);
        let xCoords = bots.map(b => b.x);
        let yCoords = bots.map(b => b.y);
        let zCoords = bots.map(b => b.z);

        while(decreasingDelta >= 1) {
            let time = new Date();
            term('[%s:%s:%s] Scanning with: %s, bestHit: %s\n', 
                time.getHours(), ('' + time.getMinutes()).padStart(2, '0'), ('' + time.getSeconds()).padStart(2, '0'), 
                decreasingDelta, bestHit.d);

            for(let xS = Math.min(...xCoords); xS <= Math.max(...xCoords); xS+=decreasingDelta) {
                for(let yS = Math.min(...yCoords); yS <= Math.max(...yCoords); yS+=decreasingDelta) {
                    for(let zS = Math.min(...zCoords); zS <= Math.max(...zCoords); zS+=decreasingDelta) {
                        let testCoord = [xS, yS, zS];
                        let rangeCount = inRangeOf(testCoord);
                        if(rangeCount > maxCount) {
                            bestHit = {c: testCoord, d: mDist(testCoord, center)};
                            maxCount = rangeCount;
                        } else if (rangeCount === maxCount && bestHit.d <= mDist(testCoord, center)) {
                            bestHit = {c: testCoord, d: mDist(testCoord, center)};
                        }
                    }
                }
            }
            xCoords = [bestHit.c[0] - decreasingDelta, bestHit.c[0] + decreasingDelta];
            yCoords = [bestHit.c[1] - decreasingDelta, bestHit.c[1] + decreasingDelta];
            zCoords = [bestHit.c[2] - decreasingDelta, bestHit.c[2] + decreasingDelta];
            decreasingDelta /= 2;
        }
        term.bold('Result for part B: %s\n', bestHit.d);
    }
};