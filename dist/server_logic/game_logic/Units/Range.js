"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Unit_1 = require("./Unit");
class Range extends Unit_1.Unit {
    constructor(x, y, id, map, unit_init_data) {
        super(x, y, id, map, unit_init_data);
    }
}
Range.SLINGER = {
    name: "Slinger",
    attack: 10,
    health: 100,
    range: 2,
    movement: 120,
    cost: 6,
    action: Unit_1.Unit.FORTIFY,
    type: Unit_1.Unit.RANGE
};
Range.ARCHER = {
    name: "Archer",
    attack: 10,
    health: 100,
    range: 2,
    movement: 120,
    cost: 6,
    action: Unit_1.Unit.FORTIFY,
    type: Unit_1.Unit.RANGE
};
exports.default = Range;
