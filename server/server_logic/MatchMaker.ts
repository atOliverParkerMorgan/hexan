// this class creates matches between players
import Player from "./game_logic/Player";
import {createHash} from "crypto";
import Game from "./game_logic/Game";
import {ServerSocket} from "./ServerSocket";
import cons from "consolidate";

// Singleton
export namespace MatchMaker {
    export let all_players_searching_1v1: Player[] = [];
    export let all_games_1v1: Game[] = [];
    export let all_players_searching_2v2: Player[] = [];

    export function add_player_1v1(nick_name: string): Player{
        const player_token = generate_token(nick_name);
        const player = new Player(player_token)
        all_players_searching_1v1.push(player);
        return player;
    }

    // matches a player with another player if possible
    export function get_game_1v1_with_player(player_token: string, map_size: number): Game | undefined{
        let current_player: Player | undefined;
        all_players_searching_1v1.filter((player: Player)=>{
            if(player.token === player_token){
                current_player = player;
            }
        })
        if(current_player != null){
            let match_player: Player | undefined;
            all_players_searching_1v1.filter((player: Player)=>{
                if(current_player !== player){
                    match_player = player;
                }
            })

            if(match_player == undefined) return undefined;

            const new_game = new Game(generate_token(player_token), map_size, 4);

            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player);

            return new_game;
        }
    }

    export function get_1v1_game (game_token: string): Game | undefined{
        for (const game of MatchMaker.all_games_1v1) {
            if (game.token === game_token) {
                return game;
            }
        }
    }

    export function add_player_2v2(nick_name: string){
        const player_token = generate_token(nick_name);
        all_players_searching_2v2.push(new Player(player_token));
        if(has_match_for_1v1()){
            return [player_token, new Game(generate_token(player_token), 2500, 4)]
        }
        return player_token;
    }

    export function find_match_for_1v1(player_token: string, map_size: number): Game | undefined{

        const game = found_match_1v1(player_token);
        if(game != null){

            const player: Player | undefined = game?.get_player(player_token);
            if(player != null) {
                game.place_start_city(player);
                return game;
            }
        }

        if(has_match_for_1v1()) {

            const game: Game | undefined = MatchMaker.get_game_1v1_with_player(player_token, map_size);
            if(game != null){

                all_games_1v1.push(game);

                const player: Player | undefined = game?.get_player(player_token);
                if(player != null) {
                    game.place_start_city(player);
                    return game;
                }
            }
        }
    }

    function has_match_for_1v1(): boolean{
        return all_players_searching_1v1.length % 2 === 0;
    }

    function found_match_1v1(player_token: string): Game | undefined{
        for(const game of all_games_1v1){
            for(const player of game.all_players){
                if(player.token === player_token){
                    return game;
                }
            }
        }
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