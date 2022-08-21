import {createHash} from "crypto";
import Map from "./server_logic/game_logic/Map/Map";

export namespace Utils{
    export const HOST = "http://localhost:8000";

    export const GAME_MODE_1v1: string = "1v1";
    export const GAME_MODE_2v2: string = "2v2";
    export const GAME_MODE_AI: string = "AI";
    export const GAME_MODE_FRIEND: string = "FRIEND";

    export function generate_token(nick_name: string){
        return createHash('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }

    // range: <min; max>
    // @ TODO add unit functions
    export function random_int(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}