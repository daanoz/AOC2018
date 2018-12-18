let term = require('terminal-kit').terminal;
let fs = require('fs');
let path = require('path');
let utils = require('./utils');

term('Advent of Code 2018 \n');

if(!process.argv[2]) { return term.red('No day specified\n'); }

let folder = utils.getDayPath();
if(!fs.existsSync(folder)) { return term.red('Day %s does not exist\n', process.argv[2]); }

let isPartB = false;
if(process.argv[3]) {
    isPartB = process.argv[3].toLowerCase() === 'part2' ||
              process.argv[3].toLowerCase() === 'partb';
}
let doVerbose = false;
if(process.argv.indexOf('visual') >= 0 ) {
    doVerbose = true;
}
term('Running part %s of Day %s\n\n', isPartB?'B':'A', process.argv[2]);

let daySolver = require(folder);
let start = utils.ms();
daySolver(isPartB, doVerbose);
let duration = utils.ms() - start;
term.green('Ran in %ss, without data loading: %ss\n', duration / 1000, (duration - utils.loadingTime()) / 1000);