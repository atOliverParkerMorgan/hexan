// this class creates matches between players
import Player from "./Player";
import Game from "./Game";
import {Utils} from "./Utils";
import {ServerSocket} from "./ServerSocket";
import {Socket} from "socket.io";
import GameInterface from "../Interfaces/GameInterface";
import AiPlayerLogic from "./AI/AiPlayerLogic";

// Singleton
export namespace MatchMaker {

    export let all_players_searching_1v1 = new Map<string, Player>();
    export let all_players_searching_2v2 = new Map<string, Player>();

    export let friend_codes = new Map<string, Player>();
    export let all_games= new Map<string, Game>();

    export function addPlayer1v1(socket: Socket, map_size: number){
        if(!Utils.ALLOWED_MAP_SIZES.includes(map_size)){
            return;
        }

        all_players_searching_1v1.set(socket.id, new Player(socket.id, map_size, false));
        findMatchFor1v1(socket, map_size);
    }

    export function generateFriendToken(socket_id: string): string{
        return socket_id.substring(0, 5);
    }

    export function saveFriendToken(socket_id: string, map_size: number | null){
        if(map_size == null) return;
        if(!Utils.ALLOWED_MAP_SIZES.includes(map_size)) return;
        friend_codes.set(MatchMaker.generateFriendToken(socket_id), new Player(socket_id, map_size, false)
        )
    }

    export function getGameWithFriendCode(socket: any, friend_code: string | null): GameInterface | null{
        if(friend_code == null){
            return null;
        }

        if(friend_code.length != 5){
            return null;
        }

        if(friend_code == MatchMaker.generateFriendToken(socket.id)){
            return null;
        }

        const friend_player: Player | undefined = friend_codes.get(friend_code);

        if(friend_player == null){
            return null;
        }

        const current_player: Player | undefined = new Player(socket.id, friend_player.map_size, false)

        const game: Game | undefined = new Game(Utils.generateToken(friend_player.token), friend_player.map_size,
            4, Utils.GAME_MODES.GAME_MODE_1v1);


        game.all_players.push(friend_player);
        game.all_players.push(current_player);

        all_games.set(game.token, game);

        game.placeStartCity1v1(friend_player, true);
        game.placeStartCity1v1(current_player, false);

        friend_codes.delete(friend_code);
        friend_codes.delete(current_player.token.substring(0, 5));

        return game;
    }

    // matches a player with another player if possible
    export function getGame1v1WithPlayer(player_token: string, map_size: number): Game | undefined{
        let current_player: Player | undefined = all_players_searching_1v1.get(player_token);
        if(current_player != null){
            let match_player: Player | undefined;
            for(let player of all_players_searching_1v1.values()) {
                if (current_player !== player) {
                    match_player = player;
                    break;
                }
            }

            if(match_player == undefined) return undefined;
            if(match_player.map_size !== current_player.map_size) return undefined;

            const new_game = new Game(Utils.generateToken(player_token), map_size, 4, Utils.GAME_MODES.GAME_MODE_1v1);

            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player);

            return new_game;
        }
    }

    export function findAiGame(socket: Socket, map_size: number){
        const game = new Game(Utils.generateToken(socket.id), map_size, 4, Utils.GAME_MODES.GAME_MODE_AI);
        const player = new Player(socket.id, map_size, false);

        if(!Utils.ALLOWED_MAP_SIZES.includes(map_size)){
            return;
        }
        const player_ai = new Player(socket.id, map_size, true);
        Utils.all_player_logic.set(socket.id, new AiPlayerLogic(player_ai, game, socket))
        game.all_players.push(player);
        all_games.set(game.token, game);
        game.placeStartCity1v1(player, false);

        ServerSocket.sendData(socket, ServerSocket.response_types.FOUND_GAME_RESPONSE,
            {
                game_token: game.token
            });

    }

    export function getGame (game_token: string): Game | undefined{
        return all_games.get(game_token);
    }

    export function addPlayer2v2(nick_name: string, map_size: number){
        const player_token = Utils.generateToken(nick_name);
        all_players_searching_2v2.set(player_token, new Player(player_token, map_size, false));
        if(hasMatchFor1v1()){
            return [player_token, new Game(Utils.generateToken(player_token), 2500, 4, Utils.GAME_MODES.GAME_MODE_2v2)]
        }
        return player_token;
    }

    // find a game for a player if there is one
    export function findMatchFor1v1(socket: Socket, map_size: number){
        if(hasMatchFor1v1()) {
            const game: Game | undefined = MatchMaker.getGame1v1WithPlayer(socket.id, map_size);
            if(game != null){
                all_games.set(game.token, game);

                const player: Player | undefined = game?.getPlayer(socket.id);
                const enemy_player: Player | undefined  = game?.getEnemyPlayers(socket.id)[0];

                if(player == null || enemy_player == null) {
                    ServerSocket.somethingWrongResponse(socket, socket.id, "COULDN'T FIND MATCH", "Something went wrong can't find match");

                    ServerSocket.sendDataToPlayer(socket, enemy_player?.token, ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
                        {
                            title: "COULDN'T FIND MATCH",
                            message: "Something went wrong can't find match"
                        });

                    return

                }

                game.placeStartCity1v1(player, true);
                game.placeStartCity1v1(enemy_player, false);

                console.log("")

                all_players_searching_1v1.delete(player.token);
                all_players_searching_1v1.delete(enemy_player.token);

                friend_codes.delete(player.token.substring(0, 5));
                friend_codes.delete(enemy_player.token.substring(0, 5));

                ServerSocket.sendData(socket, ServerSocket.response_types.FOUND_GAME_RESPONSE,
                    {
                        game_token: game.token
                    })

                ServerSocket.sendDataToPlayer(socket, enemy_player.token, ServerSocket.response_types.FOUND_GAME_RESPONSE,
                    {
                        game_token: game.token
                    });
            }
        }
    }

    function hasMatchFor1v1(): boolean{
        return all_players_searching_1v1.size % 2 ===0 && all_players_searching_1v1.size  !== 0;
    }


    export function getPlayerSearching1v1(player_token: string): Player | undefined{
       return all_players_searching_1v1.get(player_token);
    }

    export function hasMatchFor2v2(): boolean{
        return all_players_searching_2v2.size % 4 === 0;
    }

    export function printCurrent1v1(): void{
        for(const player_token of all_players_searching_1v1){
            console.log(player_token);
        }
    }
}