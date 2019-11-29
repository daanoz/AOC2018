let term = require('terminal-kit').terminal;
let utils = require('./../utils');

const parseInput = (input) =>
    input
        .replace(/\r/g, '')
        .split('\n\n')
        .map(chunk => chunk.trim().split('\n').slice(1))
		.map(army => 
    		army.map(line => {
                // let match = line.match(/^(\d+) units each with (\d+) hit points (\(.+\) )?with an attack that does (\d+) (\w+) damage at initiative (\d+)$/);
                // if(!match) { return; }
                // console.log(line, match);
				let [units, hp, resistances, atk, type, initiative] = line
					.match(/^(\d+) units each with (\d+) hit points (\(.+\) )?with an attack that does (\d+) (\w+) damage at initiative (\d+)$/)
					.slice(1);
				[units, hp, atk, initiative] = [units, hp, atk, initiative].map(n => parseInt(n));
				const [weaknesses=[]] = ((resistances || '').match(/weak to ([\w, ]+)/) || []).slice(1).map(str => str.split(', '));
				const [immunities=[]] = ((resistances || '').match(/immune to ([\w, ]+)/) || []).slice(1).map(str => str.split(', '));
				return { units, hp, atk, type, initiative, weaknesses, immunities };
			}));


const power = (unit, target) => (unit.atk * unit.units) * (target.weaknesses.includes(unit.type) ? 2 : 1);

const simulate = (immune, infection) => {
	immune.forEach(u => u.army = 'immune');
	infection.forEach(u => u.army = 'infection');
	const aliveImmune = () => immune.filter(({ units }) => units > 0);
	const aliveInfection = () => infection.filter(({ units }) => units > 0);
	const units = () => [...aliveImmune(), ...aliveInfection()];

	while (aliveImmune().length > 0 && aliveInfection().length > 0) {
		let availableImmune = aliveImmune();
		let availableInfection = aliveInfection();
		const targets = [];
		const addTarget = (unit, enemies) => {
			const target = {
				unit,
				target: enemies
					.filter(e => !e.immunities.includes(unit.type))
                    .sort((a, b) => {
                        let aDMG = power(unit, a);
                        let bDMG = power(unit, b);
                        if(aDMG !== bDMG) { return bDMG - aDMG; }
                        let aAP = a.atk * b.units;
                        let bAP = a.atk * b.units;
                        if(aAP !== bAP) { return bAP - aAP; }
                        return b.initiative - a.initiative;
                    })[0]
			};
			if (target.target) {
				targets.push(target);
				availableImmune = availableImmune.filter(u => u !== target.target);
				availableInfection = availableInfection.filter(u => u !== target.target);
			}
		};
		units()
			.sort((a, b) => {
                let aAP = a.atk * b.units;
                let bAP = a.atk * b.units;
                if(aAP !== bAP) { return bAP - aAP; }
                return b.initiative - a.initiative;
            })
			.forEach(u => addTarget(u, u.army === 'immune' ? availableInfection : availableImmune));

		let kills = 0;
		targets
            .sort((a, b) => {
                return b.unit.initiative - a.unit.initiative;
            })
			.forEach(({ unit, target }) => {
				if (unit.units <= 0) return;
				const deaths = Math.min(Math.floor(power(unit, target) / target.hp), unit.units);
				kills += deaths;
				target.units -= deaths;
			});

		if (kills === 0) return { army: 'draw' };
	}

	return { units: units().reduce((count, { units }) => count + units, 0), army: units()[0].army };
};

// export default {
// 	part1() {
		
// 		return simulate(immune, infection).units;
// 	},
// 	part2() {
// 		return function*() {
// 			for (let boost = 1; boost < Infinity; boost++) {
// 				yield `Testing Boost: ${boost}`;
// 				const [immune, infection] = parseInput();
// 				immune.forEach(u => u.atk += boost);
// 				const { units, army } = simulate(immune, infection);
// 				if (army === 'immune') return yield units;
// 			}
// 		};
// 	},
// 	interval: 0
// };

module.exports = (isPartB, visual) => {
    const inputs = utils.readInput('');

    if(!isPartB)  {
        const [immune, infection] = parseInput(inputs);
        term.bold('Result for part A: %s\n', simulate(immune, infection).units);
    } else {

        const go = () => {
            for (let boost = 1; boost < Infinity; boost++) {
                term('With increment %s\n', boost);
                const [immune, infection] = parseInput(inputs);
                immune.forEach(u => u.atk += boost);
                const { units, army } = simulate(immune, infection);
                if (army === 'immune') {
                    return units;
                };
            }
        }

        // to high 1280
        // to high 1290
        // to high 1291
        // incorrect 1164
        term.bold('Result for part B: %s\n', go());
    }
};