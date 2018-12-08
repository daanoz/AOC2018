let term = require('terminal-kit').terminal;
let utils = require('./../utils');

let readTree = (data, metaData) => {
    let childCount = data[0];
    let metadataCount = data[1];
    let childData = data.slice(2);
    let value = 0;
    let childNodeValues = [];
    for(let c = 0; c < childCount; c++) {
        let result = readTree(childData, metaData);
        childData = result.childData;
        childNodeValues.push(result.value);
    }
    if(metadataCount && metadataCount > 0) {
        let nodeMetaData = childData.slice(0, metadataCount);
        metaData.push(...nodeMetaData)
        childData = childData.slice(metadataCount);
        if(childCount <= 0) {
            value += nodeMetaData.reduce((sum, current) => sum + current, 0);
        } else {
            nodeMetaData.forEach(index => {
                if(index <= childCount) {
                    value += childNodeValues[index - 1];
                }
            });
        }
    }
    return {
        childData,
        value
    };
}

module.exports = (isPartB) => {
    let input = utils.readInput('').trim().split(' ');
    input = input.map(i => parseInt(i, 10));

    let metaData = [];
    let result = readTree(input, metaData);

    term.bold('Result for part A: %s\n', metaData.reduce((sum, current) => sum + current, 0));
    term.bold('Result for part B: %s\n', result.value);
};