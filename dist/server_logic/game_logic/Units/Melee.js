"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Unit_1 = require("./Unit");
class Melee extends Unit_1.Unit {
    constructor(x, y, id, map, unit_init_data) {
        super(x, y, id, map, unit_init_data);
    }
}
Melee.WARRIOR = {
    name: "Warrior",
    attack: 25,
    health: 100,
    range: 1,
    movement: 1000,
    cost: 4,
    action: Unit_1.Unit.FORTIFY,
    type: Unit_1.Unit.MELEE
};
Melee.SPEARMAN = {
    name: "Spearman",
    attack: 40,
    health: 100,
    range: 1,
    movement: 100,
    cost: 4,
    action: Unit_1.Unit.FORTIFY,
    type: Unit_1.Unit.MELEE
};
exports.default = Melee;
