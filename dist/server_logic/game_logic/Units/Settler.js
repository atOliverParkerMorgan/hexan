"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Unit_1 = require("./Unit");
class Settler extends Unit_1.Unit {
    constructor(x, y, id, map) {
        super(x, y, id, map, Settler.SETTLER_UNIT);
    }
    settle(owner, game) {
        const city_node = game.map.get_node(super.get_x(), super.get_y());
        if (city_node == null)
            return;
        game.add_city(owner, city_node);
    }
    can_settle() {
        return true;
    }
}
Settler.SETTLER_UNIT = {
    name: "Settler",
    attack: 0,
    health: 100,
    range: 0,
    movement: 100,
    cost: 20,
    action: Unit_1.Unit.SETTLE,
    type: Unit_1.Unit.SETTLER
};
exports.default = Settler;
