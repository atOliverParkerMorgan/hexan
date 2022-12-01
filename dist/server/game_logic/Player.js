"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const {Unit} = require("./Units/Unit.ts");
var Unit_1 = __importDefault(require("./Units/Unit"));
var Melee_1 = __importDefault(require("./Units/Melee"));
var Range_1 = __importDefault(require("./Units/Range"));
var Cavalry_1 = __importDefault(require("./Units/Cavalry"));
var Player = /** @class */ (function () {
    function Player(token) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_unit_types = [Unit_1.default.MELEE, Unit_1.default.RANGE];
        this.current_unit_id = 0;
    }
    Player.prototype.add_unit = function (x, y, type) {
        switch (type) {
            case Unit_1.default.MELEE:
                this.units.push(new Melee_1.default(x, y, this.token + this.current_unit_id, type, 1500));
                break;
            case Unit_1.default.CAVALRY:
                this.units.push(new Cavalry_1.default(x, y, this.token + this.current_unit_id, type, 900));
                break;
            case Unit_1.default.RANGE:
                this.units.push(new Range_1.default(x, y, this.token + this.current_unit_id, type, 1300));
                break;
        }
        this.current_unit_id++;
    };
    Player.prototype.get_unit = function (id) {
        for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.get_id() === id)
                return unit;
        }
    };
    // used to send simplified unit data structure threw socket.io
    Player.prototype.get_unit_data = function () {
        var unit_data = [];
        for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
            var unit = _a[_i];
            unit_data.push(unit.get_data());
        }
        return unit_data;
    };
    return Player;
}());
exports.default = Player;
