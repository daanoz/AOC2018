let term = require('terminal-kit').terminal;
let utils = require('./../utils');

class Guard {
    constructor(id) {
        this.id = id;
        this.minutesASleep = [];
    }
    addRange(start, end) {
        if(!start) { return; }
        let minRange = (end.getTime() - start.getTime()) / 1000 / 60;
        if(minRange > 60) {
            term('Guard slept to long! %s mins', minRange);
            return;
        }
        for(var m = start.getMinutes(); m < end.getMinutes(); m++) {
            this.minutesASleep.push(m);
        }
    }
    getTotalSleep() {
        return this.minutesASleep.length;
    }
    findMaxMinute() {
        let seen = {};
        return this.minutesASleep.reduce((mostfreq, item) => {
            seen[item] = !seen[item] ? 1 : ++seen[item];
            if (seen[item] > mostfreq.count) {
                mostfreq.min = item;
                ++mostfreq.count;
            }
            return mostfreq;
        }, { min: '', count: 0 });
    }
}

const gaurdStartRegex = /^\[1518-(\d*)-(\d*) (\d*):(\d*)\] Guard #(\d*) begins shift$/i;
const fallsASleepRegex = /^\[1518-(\d*)-(\d*) (\d*):(\d*)\] falls asleep$/i;
const wakesUpRegex = /^\[1518-(\d*)-(\d*) (\d*):(\d*)\] wakes up$/i;
const Types = {
    START: 1,
    ASLEEP: 2,
    WAKEUP: 3
};
class Record {
    constructor(month, day, hour, minute, type, id) {
        this.month = parseInt(month, 10);
        this.day = parseInt(day, 10);
        this.hour = parseInt(hour, 10);
        this.minute = parseInt(minute, 10);
        this.type = type;
        this.id = id;
        this.dummyDate = new Date(
            1990,
            (this.month + 1), // JavaScript :(
            this.day,
            this.hour,
            this.minute
        );
    }
    static parse(input) {
        let match = gaurdStartRegex.exec(input);
        if(match) { return new Record(match[1], match[2], match[3], match[4], Types.START, match[5]); }

        match = fallsASleepRegex.exec(input);
        if(match) { return new Record(match[1], match[2], match[3], match[4], Types.ASLEEP, match[5]); }

        match = wakesUpRegex.exec(input);
        if(match) { return new Record(match[1], match[2], match[3], match[4], Types.WAKEUP, match[5]); }

        term('Unable to parse: %s\n', input);
    }
}

module.exports = (isPartB) => {
    const inputs = utils.readNewLineSeperatedInput();
    const records = inputs
        .map(input => Record.parse(input))
        .sort((a, b) => a.dummyDate.getTime() - b.dummyDate.getTime());

    const guards = {};
    let currentGuard;
    let currentStartSleep = null;
    records.forEach(record => {
        if(record.type === Types.START) {
            if(!guards[record.id]) { guards[record.id] = new Guard(record.id); }
            currentGuard = guards[record.id];
        } else if(record.type === Types.ASLEEP) {
            currentStartSleep = record.dummyDate;
        } else if(record.type === Types.WAKEUP) {
            currentGuard.addRange(currentStartSleep, record.dummyDate);
            currentStartSleep = null;
        }
    });

    if(!isPartB) {
        let guard = Object.values(guards).sort((a, b) => a.getTotalSleep() - b.getTotalSleep()).reverse()[0];
        let max = guard.findMaxMinute();
        term.bold('Result for part A: %s\n', parseInt(guard.id, 10) * max.min);
    } else {
        let maxGuard = null;
        let max = { count: 0 };
        Object.values(guards).forEach(guard => {
            result = guard.findMaxMinute();
            if(result.count > max.count) {
                max = result;
                maxGuard = guard;
            }
        })
        term.bold('Result for part B: %s\n', parseInt(maxGuard.id, 10) * max.min);
    }
};