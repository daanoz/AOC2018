let term = require('terminal-kit').terminal;
let fs = require('fs');
let path = require('path');
let utils = require('./utils');

term('Advent of Code 2018 \n');

if(!process.argv[2]) { return term.red('No day specified\n'); }

let folder = utils.getDayPath();
if(!fs.existsSync(folder)) { return term.red('Day %s does not exist\n', process.argv[2]); }

let isPartB = process.argv[3] === 'part2';
term('Running part %s of Day %s\n\n', isPartB?'B':'A', process.argv[2]);

let daySolver = require(folder);
daySolver(isPartB);