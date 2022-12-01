"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var ServerSocket_1 = require("../server_logic/ServerSocket");
var Player_1 = __importDefault(require("../server_logic/game_logic/Player"));
var MatchMaker_1 = require("../server_logic/MatchMaker");
var Utils_1 = require("../Utils");
var IndexController = /** @class */ (function () {
    function IndexController() {
        var _this = this;
        this.REQUEST_TYPES = {
            GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
            FIND_MATCH: "FIND_MATCH"
        };
        this.player_token = "";
        this.router = express_1.default.Router();
        // return rendered index view
        this.handle_get_request = function (req, res, next) {
            res.render('index');
        };
        // creates a new Game object and send the appropriate response
        this.handle_post_request = function (req, res, next) {
            var nick_name = req.body.nick_name;
            var player_token = req.body.player_token; // null if the request is GENERATE_PLAYER_TOKEN
            var map_size = req.body.map_size;
            var game_mode = req.body.game_mode;
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
                        player = new Player_1.default(Utils_1.Utils.generate_token(nick_name));
                        res.status(200).send(JSON.stringify({ player_token: player.token }));
                        break;
                    case Utils_1.Utils.GAME_MODE_1v1:
                        player = MatchMaker_1.MatchMaker.add_player_1v1(nick_name);
                        res.status(200).send(JSON.stringify({ player_token: player.token }));
                        break;
                }
            }
            else if (request_type === _this.REQUEST_TYPES.FIND_MATCH) {
                if (game_mode != null) {
                    var game = void 0;
                    switch (game_mode) {
                        case Utils_1.Utils.GAME_MODE_AI:
                            game = MatchMaker_1.MatchMaker.get_ai_game(player_token, map_size);
                            if (game == undefined) {
                                res.statusMessage = "Couldn't load AI";
                                res.status(500).send();
                            }
                            else {
                                // connect ServerSocket
                                ServerSocket_1.ServerSocket.init();
                                ServerSocket_1.ServerSocket.add_request_listener();
                                ServerSocket_1.ServerSocket.add_response_listener();
                                res.status(200).send(JSON.stringify({ game_token: game.token }));
                            }
                            break;
                        case Utils_1.Utils.GAME_MODE_1v1:
                            game = MatchMaker_1.MatchMaker.find_match_for_1v1(player_token, map_size);
                            if (game == undefined) {
                                res.statusMessage = "No match found";
                                res.status(204).send();
                            }
                            else {
                                // connect ServerSocket
                                ServerSocket_1.ServerSocket.init();
                                ServerSocket_1.ServerSocket.add_request_listener();
                                ServerSocket_1.ServerSocket.add_response_listener();
                                res.status(200).send(JSON.stringify({ game_token: game.token }));
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
