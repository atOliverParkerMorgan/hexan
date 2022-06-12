const {Unit} = require("./Unit");

const PRODUCTION_TIME = 10_000;

class Cavalry extends Unit{
    constructor(...args) {
        super(...args);
    }
}

module.exports.Cavalry = Cavalry;
module.exports.PRODUCTION_TIME = PRODUCTION_TIME;