let term = require('terminal-kit').terminal;
let utils = require('./../utils');
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let directions = utils.movement.directions;
class Cart {
    constructor(x, y, direction, id) {
        this.x = x;
        this.y = y;
        this.id = id;
        switch(direction) {
            case '<': this.direction = directions.left; break;
            case '>': this.direction = directions.right; break;
            case '^': this.direction = directions.up; break;
            case 'v': this.direction = directions.down; break;
        }
        this.turns = ['left', 'straight', 'right'];
        this.nextTurn = 0;
        this.crashed = false;
    }
    move(track) {
        if(this.crashed) { return; }
        let [newX, newY] = utils.movement.move([this.x, this.y], this.direction);
        if(!track[newY]) {
            throw 'Unknown track occured:  for cart: ' + this.id + ' at [' + this.x + ',' + this.y + ', ' + this.direction + ']';
        }
        let nextTrack = track[newY][newX];
        switch(nextTrack) {
            case '-':
            case '|': { /* ignore */ } break;
            case '/': {
                if(this.direction === directions.left || this.direction === directions.right) {
                    this.direction = utils.movement.turnLeft(this.direction);
                } else {
                    this.direction = utils.movement.turnRight(this.direction);
                }
            } break;
            case '\\': {
                if(this.direction === directions.left || this.direction === directions.right) {
                    this.direction = utils.movement.turnRight(this.direction);
                } else {
                    this.direction = utils.movement.turnLeft(this.direction);
                }
            } break;
            case '+': {
                switch(this.turns[this.nextTurn % this.turns.length]) {
                    case 'left': this.direction = utils.movement.turnLeft(this.direction); break;
                    case 'right': this.direction = utils.movement.turnRight(this.direction); break;
                }
                this.nextTurn++;
            } break;
            default: {
                throw 'Unknown track occured: ' + nextTrack + ' for cart: ' + this.id + ' at [' + this.x + ',' + this.y + ', ' + this.direction + ']';
            }
        }

        this.x = newX;
        this.y = newY;
    }
}

const drawTrack = (track, carts, screen) => {
    track.forEach((line, y) => {
        line.split('').forEach((cell, x) => {
            screen.put({
                x: x,
                y: y,
            }, cell);
        });
    });
    carts.forEach(cart => {
        if(!cart.crashed) {
            screen.put({
                x: cart.x,
                y: cart.y,
            }, cart.direction[0]);
        }
    });
    screen.draw();
}

const findCrashes = carts => {
    let positions = [];
    return carts.filter(cart => {
        if(cart.crashed) { return false; }
        let pos = `${cart.x},${cart.y}`;
        if(positions.indexOf(pos) >= 0) {
            return pos;
        }
        positions.push(pos);
        return false;
    });
}

module.exports = async (isPartB) => {
    const visual = false;
    let screen;
    const track = utils.readInput().split(/\r\n|\n|\r/);

    const carts = [];
    let width = 0;
    track.forEach((line, y) => {
        let lineChars = line.split('');
        lineChars.forEach((cell, x) => {
            if(['>','<','v','^'].indexOf(cell) >= 0) {
                carts.push(new Cart(x, y, cell, carts.length));
                if(['>','<'].indexOf(cell) >= 0) {
                    lineChars[x] = '-';
                } else {
                    lineChars[x] = '|';
                }
            }
        });
        if (lineChars.length > width) {
            width = lineChars.length;
        }
        track[y] = lineChars.join('');
    });
    if(visual) {
        term.clear();
        screen = new ScreenBuffer({
            dst: term,
            width: width,
            height: track.length,
        });
        screen.fill({char: ' '});
        screen.draw();
        drawTrack(track, carts, screen);
    }

    const doTick = async (count) => {
        await utils.sleep(visual?100:0);
        if(count > 50000) { return `no collision detected, ${carts.length} remaining!`; }
        carts.sort((a, b) => {
            if (a.x == b.x) return a.y - b.y;
            return a.x - b.x;
        });
        let collision = null;
        carts.forEach(cart => {
            cart.move(track)
            let collisions = findCrashes(carts);
            if(collisions.length > 0) {
                collision = collisions[0];
                carts.forEach(cart => {
                    if(!cart.crashed) {
                        if(collisions.find(collision => (cart.x === collision.x && cart.y === collision.y))) {
                            cart.crashed = true;
                        }
                    }
                });
            }
        });
        if(collision) {
            if(!isPartB) {
                return `${collision.x},${collision.y}`;
            } else {
                let moveingCarts = carts.filter(cart => !cart.crashed);
                if(moveingCarts.length < 2) {
                    return `${moveingCarts[0].x},${moveingCarts[0].y}`;
                }
            }
        }
        if(visual) { drawTrack(track, carts, screen); }
        return doTick(count + 1);
    }

    doTick(0).then((collision) => {
        if(!isPartB)  {
            term.bold('\nResult for part A: %s\n', collision);
        } else {
            term.bold('\nResult for part B: %s\n', collision);
        }
    })
};