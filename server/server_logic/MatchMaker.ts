// this class creates matches between players
import Player from "./game_logic/Player";
import {createHash} from "crypto";
import Game from "./game_logic/Game";
import {ServerSocket} from "./ServerSocket";

export namespace MatchMaker {
    export let all_players_searching_1v1 : Player[] = [];
    export let all_players_searching_2v2 : Player[] = [];

    export function add_player_1v1(nick_name: string): Player{
        const player_token =  generate_token(nick_name);
        const player = new Player(player_token)
        all_players_searching_1v1.push(player);
        return player;
    }

    export function add_player_2v2(nick_name: string){
        const player_token = generate_token(nick_name);
        all_players_searching_2v2.push(new Player(player_token));
        if(has_match_for_1v1()){
            return [player_token, new Game(generate_token(player_token), 2500, 4)]
        }
        return player_token;
    }

    export function has_match_for_1v1(): boolean{
        return all_players_searching_1v1.length > 0;
    }

    export function has_match_for_2v2(): boolean{
        return all_players_searching_2v2.length % 4 === 0;
    }

    export function print_current_1v1(): void{
        for(const player_token of all_players_searching_1v1){
            console.log(player_token);
        }
    }

    export function generate_token(nick_name: string){
        return createHash('sha256').update(nick_name + String(Math.random() + performance.now())).digest('hex');
    }
}