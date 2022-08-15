import {createHash} from "crypto";

export namespace Utils{
    export const HOST = "http://localhost:8000";

    export const GAME_MODE_1v1: string = "1v1";
    export const GAME_MODE_2v2: string = "2v2";
    export const GAME_MODE_AI: string = "AI";
    export const GAME_MODE_FRIEND: string = "FRIEND";

    export function generate_token(nick_name: string){
        return createHash('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }

}