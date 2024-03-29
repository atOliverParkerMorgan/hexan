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
const AiPlayerLogic_1 = __importDefault(require("./AI/AiPlayerLogic"));
// Singleton
var MatchMaker;
(function (MatchMaker) {
    MatchMaker.all_players_searching_1v1 = new Map();
    MatchMaker.all_players_searching_2v2 = new Map();
    MatchMaker.friend_codes = new Map();
    MatchMaker.all_games = new Map();
    function addPlayer1v1(socket, map_size) {
        if (!Utils_1.Utils.ALLOWED_MAP_SIZES.includes(map_size)) {
            return;
        }
        MatchMaker.all_players_searching_1v1.set(socket.id, new Player_1.default(socket.id, map_size, false));
        findMatchFor1v1(socket, map_size);
    }
    MatchMaker.addPlayer1v1 = addPlayer1v1;
    function generateFriendToken(socket_id) {
        return socket_id.substring(0, 5);
    }
    MatchMaker.generateFriendToken = generateFriendToken;
    function saveFriendToken(socket_id, map_size) {
        if (map_size == null)
            return;
        if (!Utils_1.Utils.ALLOWED_MAP_SIZES.includes(map_size))
            return;
        MatchMaker.friend_codes.set(MatchMaker.generateFriendToken(socket_id), new Player_1.default(socket_id, map_size, false));
    }
    MatchMaker.saveFriendToken = saveFriendToken;
    function getGameWithFriendCode(socket, friend_code) {
        if (friend_code == null) {
            return null;
        }
        if (friend_code.length != 5) {
            return null;
        }
        if (friend_code == MatchMaker.generateFriendToken(socket.id)) {
            return null;
        }
        const friend_player = MatchMaker.friend_codes.get(friend_code);
        if (friend_player == null) {
            return null;
        }
        const current_player = new Player_1.default(socket.id, friend_player.map_size, false);
        const game = new Game_1.default(Utils_1.Utils.generateToken(friend_player.token), friend_player.map_size, 4, Utils_1.Utils.GAME_MODES.GAME_MODE_1v1);
        game.all_players.push(friend_player);
        game.all_players.push(current_player);
        MatchMaker.all_games.set(game.token, game);
        game.placeStartCity1v1(friend_player, true);
        game.placeStartCity1v1(current_player, false);
        MatchMaker.friend_codes.delete(friend_code);
        MatchMaker.friend_codes.delete(current_player.token.substring(0, 5));
        return game;
    }
    MatchMaker.getGameWithFriendCode = getGameWithFriendCode;
    // matches a player with another player if possible
    function getGame1v1WithPlayer(player_token, map_size) {
        let current_player = MatchMaker.all_players_searching_1v1.get(player_token);
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
            if (match_player.map_size !== current_player.map_size)
                return undefined;
            const new_game = new Game_1.default(Utils_1.Utils.generateToken(player_token), map_size, 4, Utils_1.Utils.GAME_MODES.GAME_MODE_1v1);
            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player);
            return new_game;
        }
    }
    MatchMaker.getGame1v1WithPlayer = getGame1v1WithPlayer;
    function findAiGame(socket, map_size) {
        const game = new Game_1.default(Utils_1.Utils.generateToken(socket.id), map_size, 4, Utils_1.Utils.GAME_MODES.GAME_MODE_AI);
        const player = new Player_1.default(socket.id, map_size, false);
        if (!Utils_1.Utils.ALLOWED_MAP_SIZES.includes(map_size)) {
            return;
        }
        const player_ai = new Player_1.default(socket.id, map_size, true);
        Utils_1.Utils.all_player_logic.set(socket.id, new AiPlayerLogic_1.default(player_ai, game, socket));
        game.all_players.push(player);
        MatchMaker.all_games.set(game.token, game);
        game.placeStartCity1v1(player, false);
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
        MatchMaker.all_players_searching_2v2.set(player_token, new Player_1.default(player_token, map_size, false));
        if (hasMatchFor1v1()) {
            return [player_token, new Game_1.default(Utils_1.Utils.generateToken(player_token), 2500, 4, Utils_1.Utils.GAME_MODES.GAME_MODE_2v2)];
        }
        return player_token;
    }
    MatchMaker.addPlayer2v2 = addPlayer2v2;
    // find a game for a player if there is one
    function findMatchFor1v1(socket, map_size) {
        if (hasMatchFor1v1()) {
            const game = MatchMaker.getGame1v1WithPlayer(socket.id, map_size);
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
                game.placeStartCity1v1(player, true);
                game.placeStartCity1v1(enemy_player, false);
                MatchMaker.all_players_searching_1v1.delete(player.token);
                MatchMaker.all_players_searching_1v1.delete(enemy_player.token);
                MatchMaker.friend_codes.delete(player.token.substring(0, 5));
                MatchMaker.friend_codes.delete(enemy_player.token.substring(0, 5));
                ServerSocket_1.ServerSocket.sendData(socket, ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                    game_token: game.token
                });
                ServerSocket_1.ServerSocket.sendDataToPlayer(socket, enemy_player.token, ServerSocket_1.ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                    game_token: game.token
                });
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
