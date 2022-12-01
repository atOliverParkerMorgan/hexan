"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const {Unit} = require("./Units/Unit.ts");
var Unit_1 = require("./Units/Unit");
var Melee_1 = __importDefault(require("./Units/Melee"));
var Range_1 = __importDefault(require("./Units/Range"));
var Cavalry_1 = __importDefault(require("./Units/Cavalry"));
var Settler_1 = __importDefault(require("./Units/Settler"));
var Technology_1 = require("./Technology/Technology");
var Player = /** @class */ (function () {
    function Player(token) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_units = [Melee_1.default.WARRIOR, Range_1.default.SLINGER, Settler_1.default.SETTLER_UNIT];
        this.total_owned_stars = 1000;
        this.star_production = 10;
        this.star_production_has_started = false;
        this.owned_technology = [];
        this.root_tech_tree_node = Technology_1.Technology.init_tech_tree();
    }
    Player.prototype.add_unit = function (x, y, name, map) {
        var new_unit;
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
    };
    Player.prototype.get_unit = function (id) {
        for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.get_id() === id)
                return unit;
        }
    };
    Player.prototype.owns_this_unit = function (id) {
        return this.get_unit(id) != null;
    };
    // returns true if the unit was successfully removed; false if not
    Player.prototype.remove_unit = function (id) {
        var remove_unit = this.get_unit(id);
        if (remove_unit == null) {
            return false;
        }
        this.units.splice(this.units.indexOf(remove_unit));
        return true;
    };
    Player.prototype.get_unit_type = function (id) {
        var _a;
        return (_a = this.get_unit(id)) === null || _a === void 0 ? void 0 : _a.type;
    };
    // used to send simplified unit data structure threw socket.io
    Player.prototype.get_unit_data = function () {
        var all_unit_data = [];
        for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
            var unit = _a[_i];
            var unit_data = unit.get_data();
            if (unit_data == undefined)
                continue;
            all_unit_data.push(unit_data);
        }
        return all_unit_data;
    };
    Player.prototype.attack_unit = function (unit_friendly, unit_enemy, enemy_player, map) {
        if (unit_friendly.type !== Unit_1.Unit.RANGE) {
            unit_friendly.health -= unit_enemy.attack;
        }
        unit_enemy.health -= unit_friendly.attack;
        var friendly_died = unit_friendly.health <= 0;
        var enemy_died = unit_enemy.health <= 0;
        if (friendly_died) {
            map.all_nodes[unit_friendly.y][unit_friendly.x].unit = null;
            this.units.splice(this.units.indexOf(unit_friendly));
        }
        if (enemy_died) {
            map.all_nodes[unit_enemy.y][unit_enemy.x].unit = null;
            enemy_player.units.splice(enemy_player.units.indexOf(unit_enemy));
        }
        return [friendly_died, enemy_died];
    };
    // The client and server run two separate timers to produce stars
    // this eliminates otherwise necessary server-client communication (the server would have to constantly update the client stars)
    Player.prototype.produce_stars = function () {
        var _this = this;
        setInterval(function () {
            _this.total_owned_stars += _this.star_production / 120;
        }, 500);
        this.star_production_has_started = true;
    };
    Player.prototype.is_payment_valid = function (payment) {
        return this.total_owned_stars - payment >= 0;
    };
    Player.prototype.pay_stars = function (payment) {
        this.total_owned_stars -= payment;
    };
    Player.prototype.increase_production = function (star_increment) {
        this.star_production += star_increment;
    };
    Player.prototype.get_data = function () {
        return {
            // units that this player can produce
            production_unit_types: this.production_units,
        };
    };
    return Player;
}());
exports.default = Player;
