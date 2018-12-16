let term = require('terminal-kit').terminal;
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let utils = require('./../utils');

const readingOrder = ['top', 'left', 'right', 'bottom'];
const isOpposingUnit = (u1, u2) => u2.isUnit() && !(u1 instanceof u2.value.constructor)
class Cell {
    constructor(x, y, symbol) {
        this.x = x;
        this.y = y;
        switch (symbol) {
            case 'E': { this.value = new Elf(this); } break;
            case 'G': { this.value = new Goblin(this); } break;
            case '#': { this.value = new Wall(); } break;
            case '.':
            default: { this.value = null; } break;
        }
    }
    setNeighbours(bg) {
        this.neighbours = {
            top: bg[this.y - 1] ? bg[this.y - 1][this.x] : null,
            bottom: bg[this.y + 1] ? bg[this.y + 1][this.x] : null,
            left: bg[this.y][this.x - 1] ? bg[this.y][this.x - 1] : null,
            right: bg[this.y][this.x + 1] ? bg[this.y][this.x + 1] : null,
        }
    }
    move(size, players) {
        let targetAttackPositions = players
            .filter(p => p.isAlive() && p.isEnemy(this.value))
            .reduce((curr, enemy) => curr.concat(enemy.location.getFreeNeighbours()), []);
        if(targetAttackPositions.length < 1) { return; }

        let walkMap = new Array(size[0]).fill(0).map(() => new Array(size[1]).fill(false));
        walkMap[this.y][this.x] = 0;

        const takeSteps = (moves) => {
            let reachablePositions = targetAttackPositions.filter(c => walkMap[c.y][c.x] !== false);
            if(reachablePositions.length > 0) {
                reachablePositions.sort((a, b) => (a.y === b.y) ? a.x - b.x : a.y - b.y);
                let targetPos = reachablePositions[0];
                return moves
                    .filter(m => {
                        let lastMovePos = m.path[m.path.length - 1];
                        return lastMovePos.x === targetPos.x && lastMovePos.y === targetPos.y;
                    });
            }

            if(moves.length < 1) { return; }
            let nextMoves = [];
            moves.forEach(m => m.path[m.path.length - 1]
                .getFreeNeighbours()
                .filter(c => walkMap[c.y][c.x] === false)
                .forEach(c => {
                    walkMap[c.y][c.x] = m.path.length + 1;
                    nextMoves.push({
                        path: m.path.concat([c])
                    });
                })
            )
            return takeSteps(nextMoves);
        };

        let firstMoves = this.getFreeNeighbours().map(cell => {
            walkMap[cell.y][cell.x] = 1;
            return {
                path: [cell]
            }
        });
        let paths = takeSteps(firstMoves);
        //drawWalkMap(walkMap);
        if(!paths || paths.length < 1) { return; }
        let moveDirection = readingOrder.find(d => paths.some(p => p.path[0] === this.neighbours[d]));
        let targetCell = this.neighbours[moveDirection];
        targetCell.value = this.value;
        this.value.location = targetCell;
        this.value = null;
        return targetCell;
    }
    isUnit() {
        return this.value instanceof Unit;
    }
    canAttack() {
        return !!Object.values(this.neighbours).find(n => isOpposingUnit(this.value, n));
    }
    getFreeNeighbours() {
        return readingOrder.filter(d => this.neighbours[d].value === null).map(d => this.neighbours[d]);
    }
    executeAttack() {
        const opposingUnits = readingOrder
            .map(d => isOpposingUnit(this.value, this.neighbours[d])?this.neighbours[d].value:null)
            .filter(u => u);
        opposingUnits.sort((a, b) => a.hitPoints - b.hitPoints);
        let lowestHitpoints = opposingUnits[0].hitPoints;
        let candidates = opposingUnits.filter(u => u.hitPoints === lowestHitpoints);
        let targetCell;
        if(candidates.length < 2) {
            targetCell = candidates[0].location;
        } else {
            candidates.sort((a, b) => (a.location.y === b.location.y) ? a.location.x - b.location.x : a.location.y - b.location.y);
            targetCell = candidates[0].location;
        }
        this.value.attack(targetCell.value);
        if (!targetCell.value.isAlive()) {
            targetCell.value.location = null;
            targetCell.value = null;
        }
    }
    toString() {
        if (!this.value) { return '.'; }
        return this.value.toString();
    }
}
class Unit {
    constructor(location) {
        this.location = location;
        this.hitPoints = 200;
        this.attackPower = 3;
    }
    isAlive() { return this.hitPoints > 0; }
    attack(target) { target.hitPoints -= this.attackPower; }
}
class Elf extends Unit {
    constructor(location) {
        super(location);
        this.attackPower += Elf.elfBoost;
    }
    toString() {
        return 'E';
    }
    isEnemy(unit) { return unit instanceof Goblin; }
}
Elf.elfBoost = 0;
class Goblin extends Unit {
    toString() {
        return 'G';
    }
    isEnemy(unit) { return unit instanceof Elf; }
}

class Wall {
    constructor() { }
    toString() {
        return '#';
    }
}

const didGameEnd = players => {
    let elves = players.filter(p => p.isAlive() && p instanceof Elf);
    let goblins = players.filter(p => p.isAlive() && p instanceof Goblin);
    if(elves.length > 0 && goblins.length > 0) {
        return;
    }
    let elfSum = elves.reduce((c, elf) => c + elf.hitPoints, 0);
    let goblinSum = goblins.reduce((c, goblin) => c + goblin.hitPoints, 0);
    let diedElves = players.filter(p => !p.isAlive() && p instanceof Elf);
    return {
        goblinSum, elfSum, diedElves
    };
}

const takeTurn = (size, players) => {
    players.sort((a, b) => {
        if(!a.location) { return -1; }
        if(!b.location) { return 1; }
        if (a.location.y === b.location.y) {
            return a.location.x - b.location.x
        } else {
            return a.location.y - b.location.y
        }
    });
    let roundResult = null;
    players.some(p => {
        if(!p.isAlive()) { return; } // it died
        let result = didGameEnd(players);
        if(result) {
            roundResult = result;
            return true;
        }
        let cell = p.location;
        if (!cell.canAttack()) {
            // lets do movement here
            let newCell = cell.move(size, players);
            if (newCell && newCell.canAttack()) {
                newCell.executeAttack();
            }
        } else {
            cell.executeAttack();
        }
    });
    return roundResult;
};

const drawWalkMap = (map) => {
    map.forEach((row, y) => row.forEach((c, x) => {
        if(c !== false) {
            screen.put({x: x * 3, y}, ('' + c).padStart(2, ' ') + ' ');
        }
    }));
    screen.draw();
}
const drawBattleGround = (bg) => {
    Object.keys(bg).forEach(y => {
        Object.keys(bg[y]).forEach(x => {
            let cell = bg[y][x];
            screen.put({
                x: cell.x * 3,
                y: cell.y,
            }, ' ' + cell.toString() + ' ');
        });
    });
    screen.draw();
}

let screen;
module.exports = (isPartB) => {
    const isVisual = false;
    const inputs = utils.readNewLineSeperatedInput('');
    const size = [inputs[0].length, inputs.length];

    const run = (cbDone) => {
        const battleground = {};
        let players = [];
        inputs.forEach((line, y) => {
            battleground[y] = {};
            line.split('').forEach((cell, x) => {
                battleground[y][x] = new Cell(x, y, cell);
                if (battleground[y][x].isUnit()) {
                    players.push(battleground[y][x].value);
                }
            })
        });
        Object.keys(battleground).forEach(y => {
            Object.keys(battleground[y]).forEach(x => {
                battleground[y][x].setNeighbours(battleground);
            });
        });

        if (isVisual && !isPartB) {
            term.clear();
            screen = new ScreenBuffer({
                dst: term,
                width: size[0]*3,
                height: size[1],
            });
            screen.fill({ char: ' ' });
            screen.draw();
            drawBattleGround(battleground);
        }

        let i = 0;
        let result;
        const tick = () => {
            result = takeTurn(size, players);
            if (isVisual && !isPartB) {
                drawBattleGround(battleground);
            }
            if(!result) {
                i++;
                setTimeout(() => tick(), isPartB?0:10);
            } else {
                cbDone(i, result);
            }
        }
        tick();
    }

    if (!isPartB) {
        run((i, result) => {
            term.bold('\nResult for part A: %s, round: %s, gs: %s\n', i * result.goblinSum, i, result.goblinSum)
        });
    } else {
        let extraAttack = 0;
        const incrementAndGo = () => {
            extraAttack++;
            Elf.elfBoost = extraAttack;
            run((i, result) => {
                if(result.diedElves <= 0) {
                    term.bold('\nResult for part B: %s, round: %s, gs: %s, ap: %s\n', i * result.elfSum, i, result.elfSum, extraAttack + 3)
                } else {
                    incrementAndGo();
                }
            });
        }
        incrementAndGo();
    }
};