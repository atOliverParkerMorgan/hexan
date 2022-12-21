"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchMaker = void 0;
// this class creates matches between players
const Player_1 = __importDefault(require("./game_logic/Player"));
const Game_1 = __importDefault(require("./game_logic/Game"));
const Utils_1 = require("../Utils");
const ServerSocket_1 = require("./ServerSocket");
// Singleton
var MatchMaker;
(function (MatchMaker) {
    MatchMaker.all_players_searching_1v1 = new Map();
    MatchMaker.all_players_searching_2v2 = new Map();
    MatchMaker.all_games = new Map();
    function add_player_1v1(socket, map_size) {
        MatchMaker.all_players_searching_1v1.set(socket.id, new Player_1.default(socket.id, map_size));
        find_match_for_1v1(socket, map_size);
    }
    MatchMaker.add_player_1v1 = add_player_1v1;
    // matches a player with another player if possible
    function get_game_1v1_with_player(player_token, map_size) {
        let current_player = MatchMaker.all_players_searching_1v1.get(player_token);
        if (current_player != null) {
            let match_player;
            for (let player of MatchMaker.all_players_searching_1v1.values()) {
                if (current_player !== player) {
                    match_player = player;
                }
            }
            if (match_player == undefined)
                return undefined;
            const new_game = new Game_1.default(Utils_1.Utils.generate_token(player_token), map_size, 4);
            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player);
            return new_game;
        }
    }
    MatchMaker.get_game_1v1_with_player = get_game_1v1_with_player;
    function find_ai_game(socket, map_size) {
        const game = new Game_1.default(Utils_1.Utils.generate_token(socket.id), map_size, 4);
        game.all_players.push(new Player_1.default(socket.id, map_size));
        MatchMaker.all_games.set(game.token, game);
        const player = game === null || game === void 0 ? void 0 : game.get_player(socket.id);
        if (player != null) {
            game.place_start_city(player);
            ServerSocket_1.ServerSocket.send_data(socket, {
                response_type: ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE,
                data: {
                    game_token: game.token
                }
            }, player.token);
        }
    }
    MatchMaker.find_ai_game = find_ai_game;
    function get_game(game_token) {
        return MatchMaker.all_games.get(game_token);
    }
    MatchMaker.get_game = get_game;
    function add_player_2v2(nick_name, map_size) {
        const player_token = Utils_1.Utils.generate_token(nick_name);
        MatchMaker.all_players_searching_2v2.set(player_token, new Player_1.default(player_token, map_size));
        if (has_match_for_1v1()) {
            return [player_token, new Game_1.default(Utils_1.Utils.generate_token(player_token), 2500, 4)];
        }
        return player_token;
    }
    MatchMaker.add_player_2v2 = add_player_2v2;
    // find a game for a player if there is one
    function find_match_for_1v1(socket, map_size) {
        const game = found_match_1v1(socket.id);
        if (game != null) {
            const player = game === null || game === void 0 ? void 0 : game.get_player(socket.id);
            if (player != null) {
                game.place_start_city(player);
                ServerSocket_1.ServerSocket.send_data(socket, {
                    response_type: ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE,
                    data: {
                        game_token: game.token
                    }
                }, player.token);
                ServerSocket_1.ServerSocket.send_data_to_all(socket, {
                    response_type: ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE,
                    data: {
                        game_token: game.token
                    }
                }, player.token);
            }
        }
        if (has_match_for_1v1()) {
            const game = MatchMaker.get_game_1v1_with_player(socket.id, map_size);
            if (game != null) {
                MatchMaker.all_games.set(game.token, game);
                const player = game === null || game === void 0 ? void 0 : game.get_player(socket.id);
                if (player != null) {
                    game.place_start_city(player);
                    ServerSocket_1.ServerSocket.send_data(socket, {
                        response_type: ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE,
                        data: {
                            game_token: game.token
                        }
                    }, player.token);
                    ServerSocket_1.ServerSocket.send_data_to_all(socket, {
                        response_type: ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE,
                        data: {
                            game_token: game.token
                        }
                    }, player.token);
                }
            }
        }
    }
    MatchMaker.find_match_for_1v1 = find_match_for_1v1;
    function has_match_for_1v1() {
        return MatchMaker.all_players_searching_1v1.size % 2 === 0;
    }
    function found_match_1v1(player_token) {
        for (const game of MatchMaker.all_games.values()) {
            for (const player of game.all_players) {
                if (player.token === player_token) {
                    return game;
                }
            }
        }
    }
    function get_player_searching_1v1(player_token) {
        return MatchMaker.all_players_searching_1v1.get(player_token);
    }
    MatchMaker.get_player_searching_1v1 = get_player_searching_1v1;
    function has_match_for_2v2() {
        return MatchMaker.all_players_searching_2v2.size % 4 === 0;
    }
    MatchMaker.has_match_for_2v2 = has_match_for_2v2;
    function print_current_1v1() {
        for (const player_token of MatchMaker.all_players_searching_1v1) {
            console.log(player_token);
        }
    }
    MatchMaker.print_current_1v1 = print_current_1v1;
})(MatchMaker = exports.MatchMaker || (exports.MatchMaker = {}));
