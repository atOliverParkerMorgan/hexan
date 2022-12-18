"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var MatchMaker_1 = require("../server_logic/MatchMaker");
var Utils_1 = require("../Utils");
var IndexController = /** @class */ (function () {
    function IndexController() {
        var _this = this;
        this.REQUEST_TYPES = {
            GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
            FIND_MATCH: "FIND_MATCH",
            START_GAME: "START_GAME"
        };
        this.player_token = "";
        this.router = express_1.default.Router();
        // return rendered index view
        this.handle_get_request = function (req, res) {
            res.render('index');
        };
        // creates a new Game object and send the appropriate response
        this.handle_post_request = function (req, res) {
            var nick_name = req.body.nick_name;
            var player_token = req.body.player_token; // null if the request is GENERATE_PLAYER_TOKEN
            var map_size = req.body.map_size;
            var game_mode = req.body.game_mode;
            var game_token = req.body.game_token;
            var request_type = req.body.request_type;
            // const current_player: Player = MatchMaker.add_player_1v1(nick_name);
            // handle invalid request bodies
            if (nick_name === "" || nick_name == null) {
                res.statusMessage = "Error, try getting yourself a nickname";
                res.status(422).send();
            }
            // handle game modes
            else if (game_mode !== Utils_1.Utils.GAME_MODE_1v1 && game_mode !== Utils_1.Utils.GAME_MODE_2v2 && game_mode !== Utils_1.Utils.GAME_MODE_AI && game_mode !== Utils_1.Utils.GAME_MODE_FRIEND) {
                res.statusMessage = "Error, try a valid game mode";
                res.status(422).send();
            }
            else if (request_type === _this.REQUEST_TYPES.GENERATE_PLAYER_TOKEN) {
                var player = void 0;
                switch (game_mode) {
                    case Utils_1.Utils.GAME_MODE_AI:
                        // generate ai player
                        player = MatchMaker_1.MatchMaker.add_player_ai(nick_name);
                        res.status(200).send(JSON.stringify({ player_token: player.token }));
                        break;
                    case Utils_1.Utils.GAME_MODE_1v1:
                        player = MatchMaker_1.MatchMaker.add_player_1v1(nick_name);
                        res.status(200).send(JSON.stringify({ player_token: player.token }));
                        break;
                    default:
                        res.statusMessage = "Error something went wrong";
                        res.status(500).send();
                }
            }
            else if (request_type === _this.REQUEST_TYPES.START_GAME) {
                if (game_mode != null) {
                    switch (game_mode) {
                        case Utils_1.Utils.GAME_MODE_1v1:
                            var game = MatchMaker_1.MatchMaker.get_game(game_token);
                            var current_player = game === null || game === void 0 ? void 0 : game.get_player(player_token);
                            if (current_player == null) {
                                res.statusMessage = "Error something went wrong";
                                res.status(500).send();
                            }
                            else if (game == null) {
                                res.statusMessage = "Enemy aborted query";
                                res.status(201).send();
                            }
                            else {
                                current_player.is_ready = true;
                                if (game.get_enemy_players(current_player.token)[0].is_ready)
                                    res.status(200).send(JSON.stringify({ game_token: game.token }));
                                else {
                                    res.statusMessage = "Enemy player didn't accept yet";
                                    res.status(204).send();
                                }
                            }
                            break;
                        case Utils_1.Utils.GAME_MODE_2v2:
                            break;
                        default:
                            res.statusMessage = "Invalid request, not accepted";
                            res.status(400).send();
                    }
                }
            }
            else if (request_type === _this.REQUEST_TYPES.FIND_MATCH) {
                if (game_mode != null && player_token != null && map_size != null) {
                    var game_1;
                    switch (game_mode) {
                        case Utils_1.Utils.GAME_MODE_AI:
                            game_1 = MatchMaker_1.MatchMaker.get_ai_game(player_token, map_size);
                            if (game_1 == undefined) {
                                res.statusMessage = "Couldn't load AI";
                                res.status(500).send();
                            }
                            else {
                                res.status(200).send(JSON.stringify({ game_token: game_1.token }));
                            }
                            break;
                        case Utils_1.Utils.GAME_MODE_1v1:
                            game_1 = MatchMaker_1.MatchMaker.find_match_for_1v1(player_token, map_size);
                            console.log("found game", game_1 != null);
                            console.log("all_players length", MatchMaker_1.MatchMaker.all_players_searching_1v1.length);
                            if (game_1 == undefined) {
                                res.statusMessage = "No match found";
                                res.status(204).send();
                            }
                            else {
                                setTimeout(function () {
                                    game_1 = MatchMaker_1.MatchMaker.get_game(game_token);
                                    var player = game_1 === null || game_1 === void 0 ? void 0 : game_1.get_player(player_token);
                                    if (player == null)
                                        return;
                                    if (!player.is_ready) {
                                        MatchMaker_1.MatchMaker.all_players_searching_1v1.splice(MatchMaker_1.MatchMaker.all_players_searching_1v1.indexOf(player), 1);
                                        MatchMaker_1.MatchMaker.all_games.splice(MatchMaker_1.MatchMaker.all_games.indexOf(game_1), 1);
                                    }
                                }, 10000);
                                res.status(200).send(JSON.stringify({ game_token: game_1.token }));
                            }
                            break;
                        default:
                            res.statusMessage = "Invalid request, not accepted";
                            res.status(400).send();
                    }
                }
                else {
                    res.statusMessage = "Invalid request, not accepted";
                    res.status(400).send();
                }
            }
            else {
                res.statusMessage = "Not found";
                res.status(404).send();
            }
        };
        this.initializeRoutes();
    }
    IndexController.prototype.initializeRoutes = function () {
        this.router.get("/", this.handle_get_request);
        this.router.post("/", this.handle_post_request);
    };
    return IndexController;
}());
exports.default = IndexController;
