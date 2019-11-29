let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const matcher = /(\d*) units each with (\d*) hit points \(?(?:(weak|immune) to ([^\);]*);?)?(?: (weak|immune) to ([^\);]*);?)?\)? ?with an attack that does (\d*) (.*) damage at initiative (\d*)/;

class Group {
    constructor(id, type, match) {
        this.id = id;
        this.type = type;
        this.match = match;
        this.units = parseInt(match[1], 10);
        this.hitpoints = parseInt(match[2], 10);
        let immuneList = match[3] === 'immune' ? 4 : (match[5] === 'immune' ? 6 : undefined);
        let weakList = match[3] === 'weak' ? 4 : (match[5] === 'weak' ? 6 : undefined);
        this.immune = immuneList ? match[immuneList].split(', ') : [];
        this.weak = weakList ? match[weakList].split(', ') : [];
        this.damage = parseInt(match[7], 10);
        this.damageType = match[8];
        this.initiative = parseInt(match[9], 10);
    }
    clone(damgeIncrement) {
        let g = new Group(this.id, this.type, this.match);
        if(damgeIncrement) {
            g.damage += damgeIncrement;
        }
        return g;
    }
    effectivePower() {
        return this.units * this.damage;
    }
    isAlive() {
        return this.units > 0;
    }
    reset() {
        this.attack = null;
        this.targetedBy = null;
    }
    setAttack(attack) {
        if(attack) {
            this.attack = attack;
            attack.target.targetedBy = this;
        }
    }
    doAttack() {
        if(this.attack) {
            let lostUnits = Math.floor(this.damageAmountTo(this.attack.target) / this.attack.target.hitpoints);
            this.attack.target.units -= lostUnits;
            return lostUnits;
        }
        return 0;
    }
    damageAmountTo(opposingGroup) {
        if(opposingGroup.immune.indexOf(this.damageType) >= 0) {
            return 0;
        }
        let potentialDamage = this.effectivePower();
        if(opposingGroup.weak.indexOf(this.damageType) >= 0) {
            potentialDamage *= 2;
        }
        return potentialDamage;
    }
}

const runBattle = (immuneSystem, infection, visual) => {
    const getOpposition = (type) => {
        if(type === 'infection') {
            return immuneSystem;
        } else {
            return infection;
        }
    }
    let groups = immuneSystem.concat(infection);
    let battleHasEnded = false;
    while(!battleHasEnded) {
        /* visual */ if(visual) { console.log('Immune System:'); immuneSystem.forEach(g => console.log(`Group ${g.id} contains ${g.units} units`)); console.log('Infection:'); infection.forEach(g => console.log(`Group ${g.id} contains ${g.units} units`)); console.log(''); }

        groups.forEach(g => g.reset());
        groups.sort((a, b) => {
            let aEP = a.effectivePower();
            let bEP = b.effectivePower();
            if(aEP === bEP) {
                return b.initiative - a.initiative;
            }
            return bEP - aEP;
        });
        groups.forEach(g => {
            if(!g.isAlive()) { return; }
            let targets = getOpposition(g.type)
                .filter(t => !t.targetedBy)
                .map(t => {
                    return {
                        target: t,
                        damage: g.damageAmountTo(t)
                    }
                })
                .sort((a, b) => {
                    if(a.damage === b.damage) {
                        if(a.target.effectivePower() === b.target.effectivePower()) {
                            return b.target.initiative - a.target.initiative;
                        }
                        return b.target.effectivePower() - a.target.effectivePower();
                    }
                    return b.damage - a.damage;
                });
            /* visual */ if(visual) { targets.forEach(t => console.log(`${g.type} group ${g.id} would deal defending group ${t.target.id} ${t.damage}`)); }
            let bestAttack = targets[0];
            g.setAttack(bestAttack);
        });
        /* visual */ if(visual) { console.log(''); }
        groups.sort((a, b) => {
            return b.initiative - a.initiative;
        });
        let killSum = 0;
        groups.forEach(g => {
            if(!g.isAlive()) { return; }
            let kills = g.doAttack();
            killSum += kills;
            if(kills > 0) {
                /* visual */ if(visual) { console.log(`${g.type} group ${g.id} attacks defending group ${g.attack.target.id}, killing ${kills} units`);  }
            }
        });
        /* visual */ if(visual) { console.log(''); }
        immuneSystem = immuneSystem.filter(g => g.isAlive());
        infection = infection.filter(g => g.isAlive());
        groups = immuneSystem.concat(infection);
        if(immuneSystem.length < 1 || infection.length < 1 || killSum === 0) {
            battleHasEnded = true;
        }
    }
    let remainingUnits = groups.reduce((sum, g) => sum + g.units, 0);
    return {
        remainingUnits,
        immuneSystem: immuneSystem.length,
        infection: infection.length,
        groups
    }
}

module.exports = (isPartB, visual) => {
    const inputs = utils.readNewLineSeperatedInput('');
    let immuneSystem = [];
    let infection = [];
    let currentGroup;
    let type = '';
    inputs.forEach(input => {
        if(input === '') { return; }
        if(input.startsWith('Immune System')) { currentGroup = immuneSystem; type = 'immuneSystem'; return; }
        if(input.startsWith('Infection')) { currentGroup = infection; type = 'infection'; return; }
        const match = matcher.exec(input);
        if(!match) { throw new Error('Unable to match: ' + input); }
        currentGroup.push(new Group(currentGroup.length + 1, type, match));
    });

    if(!isPartB)  {
        const result = runBattle(immuneSystem.map(g => g.clone()), infection.map(g => g.clone()), visual);
        term.bold('Result for part A: %s\n', result.remainingUnits);
    } else {
        let increment = 1;
        let result = { immuneSystem: 0, infection : 1};
        while(result.immuneSystem < 1 || result.infection > 0) {
            result = runBattle(immuneSystem.map(g => g.clone(increment)), infection.map(g => g.clone()), visual);
            term('With increment %s, immuneSystem has: %s left, infection has: %s left\n', increment, result.immuneSystem, result.infection);
            increment++;
        }
        // to high 1280
        // to high 1290
        // to high 1291
        // correct 760
        console.log(result);
        term.bold('Result for part B: %s\n', result.remainingUnits);
    }
};