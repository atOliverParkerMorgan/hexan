"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Technology_1 = __importDefault(require("./Technology/Technology"));
const Utils_1 = require("./Utils");
const Unit_1 = __importDefault(require("./Units/Unit"));
class Player {
    constructor(token, map_size) {
        this.token = token;
        this.map_size = map_size;
        this.units = [];
        // units that this player can produce
        this.production_units = [Utils_1.Utils.WARRIOR, Utils_1.Utils.SLINGER, Utils_1.Utils.SETTLER_UNIT];
        this.total_owned_stars = 1000;
        this.star_production = 10;
        this.star_production_has_started = false;
        this.owned_technology = [];
        this.root_tech_tree_node = Technology_1.default.init_tech_tree();
    }
    addUnit(x, y, name, map) {
        let new_unit;
        switch (name) {
            case Utils_1.Utils.WARRIOR.name:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.WARRIOR);
                break;
            case Utils_1.Utils.SPEARMAN.name:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.SPEARMAN);
                break;
            case Utils_1.Utils.SLINGER.name:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.SLINGER);
                break;
            case Utils_1.Utils.ARCHER.name:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.ARCHER);
                break;
            case Utils_1.Utils.HORSEMAN.name:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.HORSEMAN);
                break;
            case Utils_1.Utils.UNIT_TYPES.SETTLER:
                new_unit = new Unit_1.default(x, y, Math.random().toString(), map, Utils_1.Utils.SETTLER_UNIT);
                break;
        }
        this.units.push(new_unit);
        return new_unit;
    }
    getUnit(id) {
        for (const unit of this.units) {
            if (unit.getId() === id)
                return unit;
        }
    }
    ownsThisUnit(id) {
        return this.getUnit(id) != null;
    }
    // returns true if the unit was successfully removed; false if not
    removeUnit(id) {
        let remove_unit = this.getUnit(id);
        if (remove_unit == null) {
            return false;
        }
        this.units.splice(this.units.indexOf(remove_unit), 1);
        return true;
    }
    getUnitType(id) {
        var _a;
        return (_a = this.getUnit(id)) === null || _a === void 0 ? void 0 : _a.type;
    }
    // used to send simplified unit data structure threw socket.io
    getUnitData() {
        let all_unit_data = [];
        for (const unit of this.units) {
            const unit_data = unit.getData();
            if (unit_data == undefined)
                continue;
            all_unit_data.push(unit_data);
        }
        return all_unit_data;
    }
    attackUnit(unit_friendly, unit_enemy, enemy_player, map) {
        if (unit_friendly.type !== Utils_1.Utils.UNIT_TYPES.RANGE) {
            unit_friendly.health -= unit_enemy.attack;
        }
        unit_enemy.health -= unit_friendly.attack;
        const friendly_died = unit_friendly.health <= 0;
        const enemy_died = unit_enemy.health <= 0;
        if (friendly_died) {
            map.all_nodes[unit_friendly.y][unit_friendly.x].unit = null;
            this.units.splice(this.units.indexOf(unit_friendly), 1);
        }
        if (enemy_died) {
            map.all_nodes[unit_enemy.y][unit_enemy.x].unit = null;
            enemy_player.units.splice(enemy_player.units.indexOf(unit_enemy), 1);
        }
        return [friendly_died, enemy_died];
    }
    // The client and server run two separate timers to produce stars
    // this eliminates otherwise necessary server-client communication (the server would have to constantly update the client stars)
    produceStars() {
        setInterval(() => {
            this.total_owned_stars += this.star_production / 120;
        }, 500);
        this.star_production_has_started = true;
    }
    isPaymentValid(payment) {
        return this.total_owned_stars - payment >= 0;
    }
    payStars(payment) {
        this.total_owned_stars -= payment;
    }
    increaseProduction(star_increment) {
        this.star_production += star_increment;
    }
    getData() {
        return {
            // units that this player can produce
            production_unit_types: this.production_units,
        };
    }
}
exports.default = Player;
