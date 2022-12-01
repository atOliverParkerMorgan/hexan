"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchMaker = void 0;
// this class creates matches between players
var Player_1 = __importDefault(require("./game_logic/Player"));
var Game_1 = __importDefault(require("./game_logic/Game"));
var Utils_1 = require("../Utils");
// Singleton
var MatchMaker;
(function (MatchMaker) {
    MatchMaker.all_players_searching_1v1 = [];
    MatchMaker.all_games = [];
    MatchMaker.all_players_searching_2v2 = [];
    function add_player_1v1(nick_name) {
        var player_token = Utils_1.Utils.generate_token(nick_name);
        var player = new Player_1.default(player_token);
        MatchMaker.all_players_searching_1v1.push(player);
        return player;
    }
    MatchMaker.add_player_1v1 = add_player_1v1;
    // matches a player with another player if possible
    function get_game_1v1_with_player(player_token, map_size) {
        var current_player;
        MatchMaker.all_players_searching_1v1.filter(function (player) {
            if (player.token === player_token) {
                current_player = player;
            }
        });
        if (current_player != null) {
            var match_player_1;
            MatchMaker.all_players_searching_1v1.filter(function (player) {
                if (current_player !== player) {
                    match_player_1 = player;
                }
            });
            if (match_player_1 == undefined)
                return undefined;
            var new_game = new Game_1.default(Utils_1.Utils.generate_token(player_token), map_size, 4);
            new_game.all_players.push(current_player);
            new_game.all_players.push(match_player_1);
            return new_game;
        }
    }
    MatchMaker.get_game_1v1_with_player = get_game_1v1_with_player;
    function get_ai_game(player_token, map_size) {
        var new_game = new Game_1.default(Utils_1.Utils.generate_token(player_token), map_size, 4);
        new_game.all_players.push(new Player_1.default(player_token));
        MatchMaker.all_games.push(new_game);
        var player = new_game === null || new_game === void 0 ? void 0 : new_game.get_player(player_token);
        if (player != null) {
            new_game.place_start_city(player);
            return new_game;
        }
    }
    MatchMaker.get_ai_game = get_ai_game;
    function get_game(game_token) {
        for (var _i = 0, _a = MatchMaker.all_games; _i < _a.length; _i++) {
            var game = _a[_i];
            if (game.token === game_token) {
                return game;
            }
        }
    }
    MatchMaker.get_game = get_game;
    function add_player_2v2(nick_name) {
        var player_token = Utils_1.Utils.generate_token(nick_name);
        MatchMaker.all_players_searching_2v2.push(new Player_1.default(player_token));
        if (has_match_for_1v1()) {
            return [player_token, new Game_1.default(Utils_1.Utils.generate_token(player_token), 2500, 4)];
        }
        return player_token;
    }
    MatchMaker.add_player_2v2 = add_player_2v2;
    // find a game for a player if there is one
    function find_match_for_1v1(player_token, map_size) {
        var game = found_match_1v1(player_token);
        if (game != null) {
            var player = game === null || game === void 0 ? void 0 : game.get_player(player_token);
            if (player != null) {
                game.place_start_city(player);
                return game;
            }
        }
        if (has_match_for_1v1()) {
            var game_1 = MatchMaker.get_game_1v1_with_player(player_token, map_size);
            if (game_1 != null) {
                MatchMaker.all_games.push(game_1);
                var player = game_1 === null || game_1 === void 0 ? void 0 : game_1.get_player(player_token);
                if (player != null) {
                    game_1.place_start_city(player);
                    return game_1;
                }
            }
        }
    }
    MatchMaker.find_match_for_1v1 = find_match_for_1v1;
    function has_match_for_1v1() {
        return MatchMaker.all_players_searching_1v1.length % 2 === 0;
    }
    function found_match_1v1(player_token) {
        for (var _i = 0, all_games_1 = MatchMaker.all_games; _i < all_games_1.length; _i++) {
            var game = all_games_1[_i];
            for (var _a = 0, _b = game.all_players; _a < _b.length; _a++) {
                var player = _b[_a];
                if (player.token === player_token) {
                    return game;
                }
            }
        }
    }
    function has_match_for_2v2() {
        return MatchMaker.all_players_searching_2v2.length % 4 === 0;
    }
    MatchMaker.has_match_for_2v2 = has_match_for_2v2;
    function print_current_1v1() {
        for (var _i = 0, all_players_searching_1v1_1 = MatchMaker.all_players_searching_1v1; _i < all_players_searching_1v1_1.length; _i++) {
            var player_token = all_players_searching_1v1_1[_i];
            console.log(player_token);
        }
    }
    MatchMaker.print_current_1v1 = print_current_1v1;
})(MatchMaker = exports.MatchMaker || (exports.MatchMaker = {}));
