import {createHash} from "crypto";
import Map from "./server_logic/game_logic/Map/Map";
import Melee from "./server_logic/game_logic/Units/Melee";
import Range from "./server_logic/game_logic/Units/Range";
import Cavalry from "./server_logic/game_logic/Units/Cavalry";
import Settler from "./server_logic/game_logic/Units/Settler";
import {Unit} from "./server_logic/game_logic/Units/Unit";

export namespace Utils{
    export const HOST = "http://localhost:8000";

    export const GAME_MODE_1v1: string = "1v1";
    export const GAME_MODE_2v2: string = "2v2";
    export const GAME_MODE_AI: string = "AI";
    export const GAME_MODE_FRIEND: string = "FRIEND";

    export function generate_token(nick_name: string){
        return createHash('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }

    export function get_distance(x1: number, y1: number, x2: number, y2: number): number{
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    export function get_range_value(range: number): number{
        return Math.sqrt(range ** 2 + range ** 2);
    }

    // range: <min; max>
    // @ TODO add unit functions
    export function random_int(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // get unit cost
    export function get_unit_cost(name: string): number | undefined{
        switch (name){
            case Melee.WARRIOR.name:
                return Melee.WARRIOR.cost;
            case Range.SLINGER.name:
                return  Range.SLINGER.cost;
            case Cavalry.HORSEMAN.name:
                return Cavalry.HORSEMAN.cost;
            case Unit.SETTLER:
                return Settler.SETTLER_UNIT.cost;
        }
    }

}