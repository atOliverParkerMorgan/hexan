"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Unit_1 = require("./Units/Unit");
const Melee_1 = __importDefault(require("./Units/Melee"));
const Range_1 = __importDefault(require("./Units/Range"));
const Cavalry_1 = __importDefault(require("./Units/Cavalry"));
const Settler_1 = __importDefault(require("./Units/Settler"));
const Technology_1 = require("./Technology/Technology");
class Player {
    constructor(token, map_size) {
        this.token = token;
        this.map_size = map_size;
        this.units = [];
        // units that this player can produce
        this.production_units = [Melee_1.default.WARRIOR, Range_1.default.SLINGER, Settler_1.default.SETTLER_UNIT];
        this.is_ready = false;
        this.total_owned_stars = 1000;
        this.star_production = 10;
        this.star_production_has_started = false;
        this.owned_technology = [];
        this.root_tech_tree_node = Technology_1.Technology.init_tech_tree();
    }
    add_unit(x, y, name, map) {
        let new_unit;
        switch (name) {
            case Melee_1.default.WARRIOR.name:
                new_unit = new Melee_1.default(x, y, Math.random().toString(), map, Melee_1.default.WARRIOR);
                break;
            case Melee_1.default.SPEARMAN.name:
                new_unit = new Melee_1.default(x, y, Math.random().toString(), map, Melee_1.default.SPEARMAN);
                break;
            case Range_1.default.SLINGER.name:
                new_unit = new Range_1.default(x, y, Math.random().toString(), map, Range_1.default.SLINGER);
                break;
            case Range_1.default.ARCHER.name:
                new_unit = new Range_1.default(x, y, Math.random().toString(), map, Range_1.default.ARCHER);
                break;
            case Cavalry_1.default.HORSEMAN.name:
                new_unit = new Cavalry_1.default(x, y, Math.random().toString(), map, Cavalry_1.default.HORSEMAN);
                break;
            case Unit_1.Unit.SETTLER:
                new_unit = new Settler_1.default(x, y, Math.random().toString(), map);
                break;
        }
        this.units.push(new_unit);
        return new_unit;
    }
    get_unit(id) {
        for (const unit of this.units) {
            if (unit.get_id() === id)
                return unit;
        }
    }
    owns_this_unit(id) {
        return this.get_unit(id) != null;
    }
    // returns true if the unit was successfully removed; false if not
    remove_unit(id) {
        let remove_unit = this.get_unit(id);
        if (remove_unit == null) {
            return false;
        }
        this.units.splice(this.units.indexOf(remove_unit), 1);
        return true;
    }
    get_unit_type(id) {
        var _a;
        return (_a = this.get_unit(id)) === null || _a === void 0 ? void 0 : _a.type;
    }
    // used to send simplified unit data structure threw socket.io
    get_unit_data() {
        let all_unit_data = [];
        for (const unit of this.units) {
            const unit_data = unit.get_data();
            if (unit_data == undefined)
                continue;
            all_unit_data.push(unit_data);
        }
        return all_unit_data;
    }
    attack_unit(unit_friendly, unit_enemy, enemy_player, map) {
        if (unit_friendly.type !== Unit_1.Unit.RANGE) {
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
    produce_stars() {
        setInterval(() => {
            this.total_owned_stars += this.star_production / 120;
        }, 500);
        this.star_production_has_started = true;
    }
    is_payment_valid(payment) {
        return this.total_owned_stars - payment >= 0;
    }
    pay_stars(payment) {
        this.total_owned_stars -= payment;
    }
    increase_production(star_increment) {
        this.star_production += star_increment;
    }
    get_data() {
        return {
            // units that this player can produce
            production_unit_types: this.production_units,
        };
    }
}
exports.default = Player;
