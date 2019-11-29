let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const matcher = /(-?\d*),(-?\d*),(-?\d*),(-?\d*)/;


module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput('');
    const points = [];
    inputs.forEach(input => {
        let match = matcher.exec(input);
        if(!match) { throw new Error('Unable to match: ' + match); }
        points.push([
            parseInt(match[1], 10),
            parseInt(match[2], 10),
            parseInt(match[3], 10),
            parseInt(match[4], 10),
        ]);
    });

    const visited = {};

    const dist = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) + Math.abs(a[3] - b[3]);
    const dfs = (ind) => {
      visited[ind] = true;
      for (let i = 0; i < points.length; ++i) {
        if (!visited[i] && dist(points[ind], points[i]) <= 3) {
          dfs(i);
        }
      }
    }
  
    let cnt = 0;
    for (let i = 0; i < points.length; ++i) {
      if (!visited[i]) {
        ++cnt;
        dfs(i);
      }
    }

    if(!isPartB)  {
        term.bold('Result for part A: %s\n', cnt);
    } else {
        term.bold('Result for part B: %s\n', 0);
    }
};