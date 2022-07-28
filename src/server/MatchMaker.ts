// this class creates matches between players
import Player from "./game_logic/Player";

export namespace MatchMaker {
    export let all_players_searching_1v1 : Player[] = [];
    export let all_players_searching_2v2 : Player[] = [];

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
}