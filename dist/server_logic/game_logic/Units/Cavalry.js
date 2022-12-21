"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Unit_1 = require("./Unit");
class Cavalry extends Unit_1.Unit {
    constructor(x, y, id, map, unit_init_data) {
        super(x, y, id, map, unit_init_data);
    }
}
Cavalry.HORSEMAN = {
    name: "Horseman",
    attack: 20,
    health: 100,
    range: 1,
    movement: 25,
    cost: 8,
    action: Unit_1.Unit.FORTIFY,
    type: Unit_1.Unit.CAVALRY
};
exports.default = Cavalry;
