var path = require('path');
var process = require('process');
var fs = require('fs');
var _ = require('lodash');

let dataLoadingTime = 0;

let messureDataLoading = (func) => {
  const start = service.ms();
  const result = func();
  dataLoadingTime = service.ms() - start;
  return result;
};

let service = {
  readInput: (fileName) =>
    messureDataLoading(() =>
      fs.readFileSync(path.join(service.getDayPath(), fileName || 'input'), {encoding: 'utf-8'})
    ),
  readGridInput: (fileName) =>
    messureDataLoading(() =>
      _.map(service.readNewLineSeperatedInput(fileName), value => value.split(/\t|\s/))
    ),
  readNewLineSeperatedInput: (fileName) =>
    messureDataLoading(() =>
      _.map(service.readInput(fileName).split(/\r\n|\n|\r/), value => value.trim())
    ),
  readCommaSeperatedInput: (fileName) =>
    messureDataLoading(() =>
      _.map(service.readInput(fileName).split(','), value => value.trim())
    ),
  ms: () => new Date().getTime(),
  loadingTime: () => dataLoadingTime,
  getDayPath: () => {
    let day = ('0' + process.argv[2]).substr(-2);
    return path.join(process.cwd(), day);
  },
  moveRight: (coord) => {
    return [coord[0] + 1, coord[1]];
  },
  moveLeft: (coord) => {
    return [coord[0] - 1, coord[1]];
  },
  moveUp: (coord) => {
    return [coord[0], coord[1] + 1];
  },
  moveDown: (coord) => {
    return [coord[0], coord[1] - 1];
  }
};

module.exports = service;