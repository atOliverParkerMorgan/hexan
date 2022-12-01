"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
var crypto_1 = require("crypto");
var Melee_1 = __importDefault(require("./server_logic/game_logic/Units/Melee"));
var Range_1 = __importDefault(require("./server_logic/game_logic/Units/Range"));
var Cavalry_1 = __importDefault(require("./server_logic/game_logic/Units/Cavalry"));
var Settler_1 = __importDefault(require("./server_logic/game_logic/Units/Settler"));
var Unit_1 = require("./server_logic/game_logic/Units/Unit");
var Utils;
(function (Utils) {
    Utils.HOSTNAME = "mysterious-sea-69962.herokuapp.com";
    Utils.GAME_MODE_1v1 = "1v1";
    Utils.GAME_MODE_2v2 = "2v2";
    Utils.GAME_MODE_AI = "AI";
    Utils.GAME_MODE_FRIEND = "FRIEND";
    function generate_token(nick_name) {
        return (0, crypto_1.createHash)('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }
    Utils.generate_token = generate_token;
    function get_distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }
    Utils.get_distance = get_distance;
    // export function get_range_value(range: number): number{
    //     return Math.sqrt(range ** 2 + range ** 2);
    // }
    // range: <min; max>
    // @ TODO add unit functions
    function random_int(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Utils.random_int = random_int;
    // get unit cost
    function get_unit_cost(name) {
        switch (name) {
            case Melee_1.default.WARRIOR.name:
                return Melee_1.default.WARRIOR.cost;
            case Melee_1.default.SPEARMAN.name:
                return Melee_1.default.SPEARMAN.cost;
            case Range_1.default.SLINGER.name:
                return Range_1.default.SLINGER.cost;
            case Range_1.default.ARCHER.name:
                return Range_1.default.ARCHER.cost;
            case Cavalry_1.default.HORSEMAN.name:
                return Cavalry_1.default.HORSEMAN.cost;
            case Unit_1.Unit.SETTLER:
                return Settler_1.default.SETTLER_UNIT.cost;
        }
    }
    Utils.get_unit_cost = get_unit_cost;
})(Utils = exports.Utils || (exports.Utils = {}));
