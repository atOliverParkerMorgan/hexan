const {Unit} = require("./Unit.js");

const PRODUCTION_TIME = 10_000;

class Melee extends Unit{
    constructor(...args) {
        super(...args);
    }
}

module.exports.Melee = Melee;
module.exports.PRODUCTION_TIME = PRODUCTION_TIME;