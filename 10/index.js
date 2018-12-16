let term = require('terminal-kit').terminal;
let ScreenBuffer = require('terminal-kit').ScreenBuffer;
let utils = require('./../utils');

const regex = /position=< *([-\d]*), *([-\d]*)> velocity=< *([-\d]*), *([-\d]*)>/;

class Star {
    constructor(x, y, xSpeed, ySpeed) {
        this.pos = [parseInt(x, 10), parseInt(y, 10)];
        this.speed = [parseInt(xSpeed, 10), parseInt(ySpeed, 10)];
    }
    tick() {
        this.pos[0] += this.speed[0];
        this.pos[1] += this.speed[1];
    }
    static parse(input) {
        let match = regex.exec(input);
        if(match) { return new Star(match[1], match[2], match[3], match[4]); }

        term('Unable to parse: %s\n', input);
    }
}

const getBoundingBox = (stars) => {
    return stars.reduce((current, star) => {
        if(star.pos[0] < current.x[0]) { current.x[0] = star.pos[0]; }
        if(star.pos[0] > current.x[1]) { current.x[1] = star.pos[0]; }
        if(star.pos[1] < current.y[0]) { current.y[0] = star.pos[1]; }
        if(star.pos[1] > current.y[1]) { current.y[1] = star.pos[1]; }
        return current;
    }, {x: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY], y: [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]});
}

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput('');
    const stars = inputs
        .map(input => Star.parse(input));

    let running = true;
    let c = 0;
    let bb = getBoundingBox(stars);
    const screen = new ScreenBuffer({
        dst: term,
        width: 100,
        height: 100,
    });

    const tick = () => {
        bb = getBoundingBox(stars);
        while(Math.abs(bb.x[1] - bb.x[0]) > 200 ||
              Math.abs(bb.y[1] - bb.y[0]) > 50) {
            stars.forEach(star => star.tick());
            c++;
            bb = getBoundingBox(stars);
        }
        screen.fill({
            char: ' '
        });
        screen.draw();
        screen.resize({
            width: Math.abs(bb.x[1] - bb.x[0]),
            height: Math.abs(bb.y[1] - bb.y[0]),
        });
        stars.forEach(star => {
            screen.put({
                x: star.pos[0] - bb.x[0],
                y: star.pos[1] - bb.y[0],
            }, '#');
        });
        screen.draw();
        term('\nTick: %s\n', c);

        stars.forEach(star => star.tick());
        c++;
    };

    const terminate = () => {
        term.grabInput( false ) ;
        setTimeout( function() { process.exit() } , 100 ) ;
    }
	term.grabInput(true);
    setTimeout( function() { term.clear(); }, 100);
    term.on( 'key' , function( name , matches , data ) {
        if ( name === 'CTRL_C' ) {
            terminate() ;
        } else {
            tick();
        }
    });
};