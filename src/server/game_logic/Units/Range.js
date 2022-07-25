const {Unit} = require("./Unit");

const PRODUCTION_TIME = 10_000;

class Range extends Unit{
    constructor(...args) {
        super(...args);
    }
}

module.exports.Range = Range;
module.exports.PRODUCTION_TIME = PRODUCTION_TIME;