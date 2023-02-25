"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const crypto_1 = require("crypto");
var Utils;
(function (Utils) {
    Utils.HEX_SIDE_SIZE = Math.pow(25000, .5);
    Utils.MOUNTAIN_TRAVEL_BIAS = 10;
    Utils.OCEAN = 0x0AA3CF;
    Utils.LAKE = 0x80C5DE;
    Utils.FOREST = 0x228B22;
    Utils.GRASS = 0x7FFF55;
    Utils.MOUNTAIN = 0xF2F2F2;
    Utils.HIDDEN = 0xE0D257;
    Utils.DISTANCE_BETWEEN_HEX = 2 * Math.pow((Math.pow(Utils.HEX_SIDE_SIZE, 2) - Math.pow((Utils.HEX_SIDE_SIZE / 2), 2)), .5);
    Utils.WORLD_WIDTH = Utils.DISTANCE_BETWEEN_HEX * Utils.HEX_SIDE_SIZE;
    Utils.WORLD_HEIGHT = Utils.HEX_SIDE_SIZE * 1.5 * Utils.HEX_SIDE_SIZE;
    // borders see @Map.add_neighbors_to_nodes()
    Utils.LEFT = 0;
    Utils.RIGHT = 1;
    Utils.TOP_LEFT = 2;
    Utils.TOP_RIGHT = 3;
    Utils.BOTTOM_LEFT = 4;
    Utils.BOTTOM_RIGHT = 5;
    Utils.HORIZONTAL = 0;
    Utils.VERTICAL = 1;
    Utils.NORMAL_MOUNTAIN = 0;
    Utils.SNOWY_MOUNTAIN = 1;
    Utils.ALLOWED_MAP_SIZES = [400, 900, 1225, 1600, 2500];
    Utils.NODE_TYPES = {
        OCEAN: 0x0AA3CF,
        LAKE: 0x80C5DE,
        FOREST: 0x228B22,
        GRASS: 0x7FFF55,
        MOUNTAIN: 0xF2F2F2,
        HIDDEN: 0xE0D257,
    };
    // game modes
    Utils.GAME_MODES = {
        GAME_MODE_1v1: "1v1",
        GAME_MODE_2v2: "2v2",
        GAME_MODE_AI: "AI",
        GAME_MODE_FRIEND: "FRIEND"
    };
    Utils.UNIT_TYPES = {
        CAVALRY: "Cavalry",
        MELEE: "Melee",
        RANGE: "Range",
        SETTLER: "Settler"
    };
    Utils.UNIT_ACTIONS = {
        FORTIFY: "Fortify",
        SETTLE: "Settle"
    };
    // unit types and their data
    // Settler
    Utils.SETTLER_UNIT = {
        name: "Settler",
        attack: 0,
        health: 100,
        range: 1,
        movement: 50,
        cost: 20,
        action: Utils.UNIT_ACTIONS.SETTLE,
        type: Utils.UNIT_TYPES.SETTLER
    };
    // Melee
    Utils.WARRIOR = {
        name: "Warrior",
        attack: 20,
        health: 120,
        range: 1,
        movement: 100,
        cost: 4,
        action: Utils.UNIT_ACTIONS.FORTIFY,
        type: Utils.UNIT_TYPES.MELEE
    };
    Utils.SPEARMAN = {
        name: "Spearman",
        attack: 5,
        health: 250,
        range: 1,
        movement: 100,
        cost: 8,
        action: Utils.UNIT_ACTIONS.FORTIFY,
        type: Utils.UNIT_TYPES.MELEE
    };
    // Range
    Utils.SLINGER = {
        name: "Slinger",
        attack: 15,
        health: 80,
        range: 1,
        movement: 120,
        cost: 5,
        action: Utils.UNIT_ACTIONS.FORTIFY,
        type: Utils.UNIT_TYPES.RANGE
    };
    Utils.ARCHER = {
        name: "Archer",
        attack: 20,
        health: 100,
        range: 2,
        movement: 120,
        cost: 8,
        action: Utils.UNIT_ACTIONS.FORTIFY,
        type: Utils.UNIT_TYPES.RANGE
    };
    // CAVALRY
    Utils.HORSEMAN = {
        name: "Horseman",
        attack: 40,
        health: 115,
        range: 1,
        movement: 200,
        cost: 8,
        action: Utils.UNIT_ACTIONS.FORTIFY,
        type: Utils.UNIT_TYPES.CAVALRY
    };
    Utils.all_player_logic = new Map();
    function generateToken(nick_name) {
        return (0, crypto_1.createHash)('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }
    Utils.generateToken = generateToken;
    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
    }
    Utils.getDistance = getDistance;
    // export function get_range_value(range: number): number{
    //     return Math.sqrt(range ** 2 + range ** 2);
    // }
    // range: <min; max>
    // @ TODO add unit functions
    function randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    Utils.randomInt = randomInt;
    // get unit cost
    function getUnitCost(name) {
        switch (name) {
            case Utils.WARRIOR.name:
                return Utils.WARRIOR.cost;
            case Utils.SPEARMAN.name:
                return Utils.SPEARMAN.cost;
            case Utils.SLINGER.name:
                return Utils.SLINGER.cost;
            case Utils.ARCHER.name:
                return Utils.ARCHER.cost;
            case Utils.HORSEMAN.name:
                return Utils.HORSEMAN.cost;
            case Utils.SETTLER_UNIT.name:
                return Utils.SETTLER_UNIT.cost;
        }
    }
    Utils.getUnitCost = getUnitCost;
})(Utils = exports.Utils || (exports.Utils = {}));
