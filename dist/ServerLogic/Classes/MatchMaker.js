"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchMaker = void 0;
// this class creates matches between players
const Player_1 = __importDefault(require("./Player"));
const Game_1 = __importDefault(require("./Game"));
const Utils_1 = require("./Utils");
const ServerSocket_1 = require("./ServerSocket");
// Singleton
var MatchMaker;
(function (MatchMaker) {
    MatchMaker.all_players_searching_1v1 = new Map();
    MatchMaker.all_players_searching_2v2 = new Map();
    MatchMaker.all_games = new Map();
    function addPlayer1v1(socket, map_size) {
        MatchMaker.all_players_searching_1v1.set(socket.id, new Player_1.default(socket.id, map_size));
        findMatchFor1v1(socket, map_size);
    }
    MatchMaker.addPlayer1v1 = addPlayer1v1;
    // matches a player with another player if possible
    function getGame1v1WithPlayer(player_token, map_size) {
        let current_player = MatchMaker.all_players_searching_1v1.get(player_token);
        console.log("current player: ", current_player != null);
        if (current_player != null) {
            let match_player;
            for (let player of MatchMaker.all_players_searching_1v1.values()) {
                if (current_player !== player) {
                    match_player = player;
                    break;
                }
            }
            if (match_player == undefined)
                return undefined;
            const new_game = new Game_1.default(Utils_1.Utils.generateToken(player_token), map_size, 4);
            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player);
            return new_game;
        }
    }
    MatchMaker.getGame1v1WithPlayer = getGame1v1WithPlayer;
    function findAiGame(socket, map_size) {
        const game = new Game_1.default(Utils_1.Utils.generateToken(socket.id), map_size, 4);
        const player = new Player_1.default(socket.id, map_size);
        game.all_players.push(player);
        MatchMaker.all_games.set(game.token, game);
        game.placeStartCity(player);
        ServerSocket_1.ServerSocket.sendData(socket, ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE, {
            game_token: game.token
        });
    }
    MatchMaker.findAiGame = findAiGame;
    function getGame(game_token) {
        return MatchMaker.all_games.get(game_token);
    }
    MatchMaker.getGame = getGame;
    function addPlayer2v2(nick_name, map_size) {
        const player_token = Utils_1.Utils.generateToken(nick_name);
        MatchMaker.all_players_searching_2v2.set(player_token, new Player_1.default(player_token, map_size));
        if (hasMatchFor1v1()) {
            return [player_token, new Game_1.default(Utils_1.Utils.generateToken(player_token), 2500, 4)];
        }
        return player_token;
    }
    MatchMaker.addPlayer2v2 = addPlayer2v2;
    // find a game for a player if there is one
    function findMatchFor1v1(socket, map_size) {
        console.log("finding player1v1: " + MatchMaker.all_players_searching_1v1.size);
        if (hasMatchFor1v1()) {
            const game = MatchMaker.getGame1v1WithPlayer(socket.id, map_size);
            console.log("game ", game != null);
            if (game != null) {
                MatchMaker.all_games.set(game.token, game);
                const player = game === null || game === void 0 ? void 0 : game.getPlayer(socket.id);
                const enemy_player = game === null || game === void 0 ? void 0 : game.getEnemyPlayers(socket.id)[0];
                if (player == null || enemy_player == null) {
                    ServerSocket_1.ServerSocket.somethingWrongResponse(socket, socket.id, "COULDN'T FIND MATCH", "Something went wrong can't find match");
                    ServerSocket_1.ServerSocket.sendDataToPlayer(socket, enemy_player === null || enemy_player === void 0 ? void 0 : enemy_player.token, ServerSocket_1.ServerSocket.response_types.SOMETHING_WRONG_RESPONSE, {
                        title: "COULDN'T FIND MATCH",
                        message: "Something went wrong can't find match"
                    });
                    return;
                }
                game.placeStartCity(player);
                game.placeStartCity(enemy_player);
                MatchMaker.all_players_searching_1v1.delete(player.token);
                MatchMaker.all_players_searching_1v1.delete(enemy_player.token);
                ServerSocket_1.ServerSocket.sendData(socket, ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                    game_token: game.token
                });
                ServerSocket_1.ServerSocket.sendDataToPlayer(socket, enemy_player.token, ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                    game_token: game.token
                });
            }
            else {
                console.log("error");
            }
        }
    }
    MatchMaker.findMatchFor1v1 = findMatchFor1v1;
    function hasMatchFor1v1() {
        return MatchMaker.all_players_searching_1v1.size % 2 === 0 && MatchMaker.all_players_searching_1v1.size !== 0;
    }
    function getPlayerSearching1v1(player_token) {
        return MatchMaker.all_players_searching_1v1.get(player_token);
    }
    MatchMaker.getPlayerSearching1v1 = getPlayerSearching1v1;
    function hasMatchFor2v2() {
        return MatchMaker.all_players_searching_2v2.size % 4 === 0;
    }
    MatchMaker.hasMatchFor2v2 = hasMatchFor2v2;
    function printCurrent1v1() {
        for (const player_token of MatchMaker.all_players_searching_1v1) {
            console.log(player_token);
        }
    }
    MatchMaker.printCurrent1v1 = printCurrent1v1;
})(MatchMaker = exports.MatchMaker || (exports.MatchMaker = {}));
