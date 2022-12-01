"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSocket = void 0;
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var Path_js_1 = __importDefault(require("./game_logic/Map/Path.js"));
var MatchMaker_1 = require("./MatchMaker");
// init sever
var httpServer = (0, http_1.createServer)();
var io = new socket_io_1.Server(httpServer);
// singleton
var ServerSocket;
(function (ServerSocket) {
    ServerSocket.PORT_SOCKET = 8082;
    ServerSocket.all_games = [];
    ServerSocket.is_listening = false;
    ServerSocket.response_types = {
        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        INVALID_MOVE: "INVALID_MOVE",
        // match making
        FOUND_1v1_OPPONENT: "FOUND_1v1_OPPONENT",
        FOUND_2v2_OPPONENTS: "FOUND_2v2_OPPONENTS"
    };
    ServerSocket.request_types = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNITS: "MOVE_UNITS",
        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    function init() {
        if (!ServerSocket.is_listening) {
            httpServer.listen(ServerSocket.PORT_SOCKET);
            ServerSocket.is_listening = true;
        }
    }
    ServerSocket.connect = init;
    function get_game(game_token) {
        for (var _i = 0, _a = ServerSocket.all_games; _i < _a.length; _i++) {
            var game = _a[_i];
            console.log("GAME TOKEN: ", game.token);
            if (game.token === game_token) {
                return game;
            }
        }
    }
    ServerSocket.get_game = get_game;
    function send_data(socket, data, player_token) {
        socket.emit(player_token, data);
    }
    ServerSocket.send_data = send_data;
    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    function add_response_listener() {
        io.on("connection", function (socket) {
            socket.on("get-data", function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // get request data from public
                var request_type = args[0].request_type;
                var request_data = args[0].data;
                var game = ServerSocket.get_game(request_data.game_token);
                if (game != null) {
                    var player = game.get_player(request_data.player_token);
                    if (player != null) {
                        // switch for different responses
                        switch (request_type) {
                            case ServerSocket.request_types.GET_UNITS:
                                socket.emit(player.token, {
                                    response_type: ServerSocket.response_types.UNITS_RESPONSE,
                                    data: {
                                        units: player.units
                                    },
                                });
                                break;
                            case ServerSocket.request_types.GET_MENU_INFO:
                                // get city information and possible units to produce
                                var request_city = void 0;
                                for (var _a = 0, _b = game.get_cities_that_player_owns(player); _a < _b.length; _a++) {
                                    var city = _b[_a];
                                    if (city.name === request_data.city.name) {
                                        request_city = city;
                                        break;
                                    }
                                }
                                socket.emit(player.token, {
                                    response_type: ServerSocket.response_types.MENU_INFO_RESPONSE,
                                    data: {
                                        city: request_city,
                                    }
                                });
                                break;
                            default:
                                socket.emit(player.token, {
                                    response_type: ServerSocket.response_types.ALL_RESPONSE,
                                    data: game.get_data(player)
                                });
                        }
                    }
                }
            });
        });
    }
    ServerSocket.add_response_listener = add_response_listener;
    // acts as a setter - changes game_state according to clients request and game rules.
    function add_request_listener() {
        io.on("connection", function (socket) {
            // receive a message from the public
            socket.on("send-data", function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var request_type = args[0].request_type;
                var request_data = args[0].data;
                var game = ServerSocket.get_game(request_data.game_token);
                if (game != null) {
                    var player = game.get_player(request_data.player_token);
                    if (player != null) {
                        // switch for different request types
                        switch (request_type) {
                            case ServerSocket.request_types.FIND_1v1_OPPONENT:
                                MatchMaker_1.MatchMaker.has_match_for_1v1();
                                break;
                            case ServerSocket.request_types.PRODUCE_UNIT:
                                var city = game.get_city(request_data.city_name, player);
                                var unit_type = request_data.unit_type;
                                if (city != null) {
                                    city.start_production(1000, socket, unit_type);
                                }
                                break;
                            case ServerSocket.request_types.MOVE_UNITS:
                                for (var _a = 0, _b = request_data.unit_ids; _a < _b.length; _a++) {
                                    var id = _b[_a];
                                    var unit = player.get_unit(id);
                                    var path = new Path_js_1.default(game, request_data.path);
                                    if (!path.is_valid() || unit == null) {
                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.INVALID_MOVE,
                                            data: {
                                                unit: unit
                                            }
                                        }, player.token);
                                        break;
                                    }
                                    unit.move_and_send_response(path.path, game, player, socket);
                                }
                                break;
                        }
                    }
                }
            });
        });
    }
    ServerSocket.add_request_listener = add_request_listener;
})(ServerSocket = exports.ServerSocket || (exports.ServerSocket = {}));
