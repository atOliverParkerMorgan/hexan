import {createHash} from "crypto";
import UnitInitData from "./Units/UnitInitData";


export namespace Utils{

    export const HEX_SIDE_SIZE = 25000 ** .5;
    export const MOUNTAIN_TRAVEL_BIAS = 10;

    export const OCEAN: number = 0x0AA3CF;
    export const LAKE: number = 0x80C5DE;
    export const FOREST: number = 0x228B22;
    export const GRASS: number = 0x7FFF55;
    export const MOUNTAIN: number = 0xF2F2F2;
    export const HIDDEN: number = 0xE0D257;
    export const DISTANCE_BETWEEN_HEX = 2 * (Utils.HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
    export const WORLD_WIDTH = DISTANCE_BETWEEN_HEX * Utils.HEX_SIDE_SIZE;
    export const WORLD_HEIGHT = Utils.HEX_SIDE_SIZE * 1.5 * Utils.HEX_SIDE_SIZE;

        // borders see @Map.add_neighbors_to_nodes()
    export const LEFT: number = 0;
    export const RIGHT: number = 1;
    export const TOP_LEFT: number = 2;
    export const TOP_RIGHT: number = 3;
    export const BOTTOM_LEFT: number = 4;
    export const BOTTOM_RIGHT: number = 5;

    export const HORIZONTAL: number = 0;
    export const VERTICAL: number = 1;

    export const NORMAL_MOUNTAIN: number = 0;
    export const SNOWY_MOUNTAIN: number = 1;

    export const ALLOWED_MAP_SIZES: number[] = [400, 900, 1225, 1600, 2500];

    export const NODE_TYPES = {
        OCEAN: 0x0AA3CF,
        LAKE: 0x80C5DE,
        FOREST: 0x228B22,
        GRASS: 0x7FFF55,
        MOUNTAIN: 0xF2F2F2,
        HIDDEN: 0xE0D257,
    }

    // game modes
    export const GAME_MODES = {
        GAME_MODE_1v1: "1v1",
        GAME_MODE_2v2: "2v2",
        GAME_MODE_AI: "AI",
        GAME_MODE_FRIEND: "FRIEND"
    }

    export const UNIT_TYPES = {
        CAVALRY: "Cavalry",
        MELEE: "Melee",
        RANGE: "Range",
        SETTLER: "Settler"
    }

    export const UNIT_ACTIONS = {
        FORTIFY: "Fortify",
        SETTLE: "Settle"
    }

    // unit types and their data

    // Settler
    export const SETTLER_UNIT: UnitInitData = {
        name: "Settler",

        attack: 0,
        health: 100,
        range: 1,
        movement: 100,
        cost: 20,

        action: UNIT_ACTIONS.SETTLE,
        type: UNIT_TYPES.SETTLER
    }

    // Melee
    export const WARRIOR: UnitInitData = {
            name: "Warrior",

            attack: 25,
            health: 100,
            range: 1,
            movement: 100,
            cost: 4,

            action: UNIT_ACTIONS.FORTIFY,
            type: UNIT_TYPES.MELEE
        }

    export const  SPEARMAN: UnitInitData = {
            name: "Spearman",

            attack: 40,
            health: 100,
            range: 1,
            movement: 100,
            cost: 4,

            action: UNIT_ACTIONS.FORTIFY,
            type: UNIT_TYPES.MELEE
        }

    // Range
    export const SLINGER: UnitInitData = {
            name: "Slinger",

            attack: 10,
            health: 100,
            range: 2,
            movement: 120,
            cost: 6,

            action: UNIT_ACTIONS.FORTIFY,
            type: UNIT_TYPES.RANGE
        }
    export const  ARCHER: UnitInitData = {
            name: "Archer",

            attack: 10,
            health: 100,
            range: 2,
            movement: 120,
            cost: 6,

            action: UNIT_ACTIONS.FORTIFY,
            type: UNIT_TYPES.RANGE
        }

    // CAVALRY
    export const  HORSEMAN: UnitInitData = {
        name: "Horseman",
        attack: 20,
        health: 100,
        range: 1,
        movement: 25,
        cost: 8,

        action: UNIT_ACTIONS.FORTIFY,
        type: UNIT_TYPES.CAVALRY
    }


    export function generateToken(nick_name: string){
        return createHash('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }

    export function getDistance(x1: number, y1: number, x2: number, y2: number): number{
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    // export function get_range_value(range: number): number{
    //     return Math.sqrt(range ** 2 + range ** 2);
    // }

    // range: <min; max>
    // @ TODO add unit functions
    export function randomInt(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // get unit cost
    export function getUnitCost(name: string): number | undefined{
        switch (name){
            case WARRIOR.name:
                return WARRIOR.cost;
            case SPEARMAN.name:
                return SPEARMAN.cost;
            case SLINGER.name:
                return  SLINGER.cost;
            case ARCHER.name:
                return  ARCHER.cost;
            case HORSEMAN.name:
                return HORSEMAN.cost;
            case SETTLER_UNIT.name:
                return SETTLER_UNIT.cost;
        }
    }
}