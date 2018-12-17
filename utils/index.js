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
  writeOutput: (data, fileName) =>
      fs.writeFileSync (path.join(service.getDayPath(), fileName || 'output'), data, {encoding: 'utf-8'}),
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
  sleep: (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

const directions = {
  left: 'LEFT',
  right: 'RIGHT',
  up: 'UP',
  down: 'DOWN',
};
let movementService = {
  gridOrientationSouth: true,
  moveRight: (coord) => {
    return [coord[0] + 1, coord[1]];
  },
  moveLeft: (coord) => {
    return [coord[0] - 1, coord[1]];
  },
  moveUp: (coord) => {
    return [coord[0], movementService.gridOrientationSouth ? coord[1] - 1 : coord[1] + 1];
  },
  moveDown: (coord) => {
    return [coord[0], movementService.gridOrientationSouth ? coord[1] + 1 : coord[1] - 1];
  },
  move: (coord, direction) => {
    switch(direction) {
      case directions.up: return movementService.moveUp(coord);
      case directions.down: return movementService.moveDown(coord);
      case directions.left: return movementService.moveLeft(coord);
      case directions.right: return movementService.moveRight(coord);
      default: throw 'Unknown direction: ' + direction;
    }
  },
  turnLeft: (direction) => {
    switch(direction) {
      case directions.up: return directions.left;
      case directions.down: return directions.right;
      case directions.left: return directions.down;
      case directions.right: return directions.up;
      default: throw 'Unknown direction: ' + direction;
    }
  },
  turnRight: (direction) => {
    switch(direction) {
      case directions.up: return directions.right;
      case directions.down: return directions.left;
      case directions.left: return directions.up;
      case directions.right: return directions.down;
      default: throw 'Unknown direction: ' + direction;
    }
  },
  directions: directions
};

service.movement = movementService;


module.exports = service;