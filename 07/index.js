let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const regex = /Step ([A-Z]) must be finished before step ([A-Z]) can begin./i;

module.exports = (isPartB) => {
    let isExample = false;
    let inputs = utils.readNewLineSeperatedInput(isExample?'example':'');

    let hasToBeBefore = {};
    let hasToBeAfter = {};
    inputs.forEach(input => {
        let match = regex.exec(input);
        if(!match) { term('Failed to match: %s', input); return; }
        if(!hasToBeBefore[match[1]]) { hasToBeBefore[match[1]] = []; }
        hasToBeBefore[match[1]].push(match[2]);
        if(!hasToBeAfter[match[2]]) { hasToBeAfter[match[2]] = []; }
        hasToBeAfter[match[2]].push(match[1]);
    });

    let startParts = Object.keys(hasToBeBefore).sort();
    let startPoints = startParts.reduce((list, item) => {
        if(!hasToBeAfter[item]) { list.push(item); }
        return list;
    }, []).sort();
    let count = startParts.length;
    let order = [];

    const findNextJob = (activeJobs) => {
        activeJobs = activeJobs || [];
        let options = [...startPoints];
        Object.keys(hasToBeAfter).forEach(letter => {
            let before = hasToBeAfter[letter];
            if(before.every(item => order.indexOf(item) >= 0)) {
                options.push(letter);
            }
        });
        options = options.filter(option => activeJobs.indexOf(option) < 0);
        if(options.length < 1) {
            return;
        }
        options.sort();
        let job = options[0];
        if(hasToBeAfter[job]) {
            delete hasToBeAfter[job];
        } else {
            startPoints.splice(startPoints.indexOf(job), 1);
        }
        return job;
    }

    if(!isPartB) {
        while(order.length < count + 1) {
            order.push(findNextJob());
        }
        term.bold('Result for part A: %s\n', order.join(''));
    } else {
        let workers = Array(isExample?2:5).fill().map(() => ({
            currentJob: '',
            timeremaining: 0
        }));
        let time = 0;
        while(order.length < count + 1) {
            let activeJobs = workers.filter(w => w.currentJob).map(w => w.currentJob);
            workers.forEach(worker => {
                if(!worker.currentJob) {
                    let nextJob = findNextJob(activeJobs);
                    if(nextJob) {
                        activeJobs.push(nextJob);
                        worker.currentJob = nextJob;
                        worker.timeremaining = (isExample?0:60) + (nextJob.charCodeAt(0) - 64);
                    }
                }
            });

            term('Time: %s, ActiveJobs: %s\n', time, workers.map(w => w.currentJob));

            let workerDoneFirst = workers.reduce((current, worker) => {
                if(worker.currentJob && worker.timeremaining < current.timeremaining) {
                    return worker;
                }
                return current;
            }, {timeremaining: Number.POSITIVE_INFINITY});
            let timeDelta = workerDoneFirst.timeremaining;
            time += timeDelta;
            workers.forEach(worker => {
                if(worker.currentJob) {
                    worker.timeremaining -= timeDelta;
                    if(worker.timeremaining <= 0) {
                        order.push(worker.currentJob);
                        worker.currentJob = '';
                        worker.timeremaining = 0;
                    }
                }
            });
        }

        term.bold('Result for part B: %s\n', time);
    }
};