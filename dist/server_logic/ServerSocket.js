"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSocket = void 0;
var Path_1 = __importDefault(require("./game_logic/Map/Path"));
var MatchMaker_1 = require("./MatchMaker");
var app_1 = require("../app");
// singleton
var ServerSocket;
(function (ServerSocket) {
    ServerSocket.PORT_SOCKET = 10000;
    ServerSocket.is_listening = false;
    ServerSocket.response_types = {
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        UNIT_RESPONSE: "UNIT_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",
        ENEMY_FOUND_RESPONSE: "ENEMY_FOUND_RESPONSE",
        ATTACK_UNIT_RESPONSE: "ATTACK_UNIT_RESPONSE",
        HARVEST_COST_RESPONSE: "HARVEST_COST_RESPONSE",
        NEW_CITY: "NEW_CITY",
        CANNOT_SETTLE: "CANNOT_SETTLE",
        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_NODE: "HARVEST_NODE",
        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",
        INVALID_ATTACK_RESPONSE: "INVALID_ATTACK_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE"
    };
    ServerSocket.request_types = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        GET_STARS_DATA: "GET_STARS_DATA",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        PURCHASE_TECHNOLOGY: "PURCHASE_TECHNOLOGY",
        MOVE_UNITS: "MOVE_UNITS",
        HARVEST_NODE: "HARVEST_NODE",
        HARVEST_COST: "HARVEST_COST",
        SETTLE: "SETTLE",
        ATTACK_UNIT: "ATTACK_UNIT",
        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    function init() {
        if (!ServerSocket.is_listening) {
            app_1.App.httpServer.listen(ServerSocket.PORT_SOCKET);
            ServerSocket.is_listening = true;
        }
    }
    ServerSocket.init = init;
    function send_data(socket, data, player_token) {
        socket.emit(player_token, data);
    }
    ServerSocket.send_data = send_data;
    function send_data_to_all(socket, data, player_token) {
        socket.broadcast.emit(player_token, data);
    }
    ServerSocket.send_data_to_all = send_data_to_all;
    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    function add_response_listener() {
        app_1.App.io.on("connect_error", function (err) {
            console.log("connect_error due to ".concat(err.message));
        });
        app_1.App.io.on("connection", function (socket) {
            socket.on("get_data", function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                try {
                    // get request data from public
                    var request_type = args[0].request_type;
                    var request_data = args[0].data;
                    console.log("REQUEST TYPE: ".concat(request_type));
                    var game = MatchMaker_1.MatchMaker.get_game(request_data.game_token);
                    if (game != null) {
                        var player = game.get_player(request_data.player_token);
                        if (player != null) {
                            // switch for different responses
                            switch (request_type) {
                                case ServerSocket.request_types.GET_UNITS:
                                    var all_units = [];
                                    for (var _a = 0, _b = player.units; _a < _b.length; _a++) {
                                        var unit = _b[_a];
                                        all_units.push(unit.get_data());
                                    }
                                    socket.emit(player.token, {
                                        response_type: ServerSocket.response_types.UNITS_RESPONSE,
                                        data: {
                                            units: all_units
                                        },
                                    });
                                    break;
                                case ServerSocket.request_types.GET_MENU_INFO:
                                    // get city information and possible units to produce
                                    var request_city = void 0;
                                    for (var _c = 0, _d = game.get_cities_that_player_owns(player); _c < _d.length; _c++) {
                                        var city = _d[_c];
                                        if (city.name === request_data.city.name) {
                                            request_city = city;
                                            break;
                                        }
                                    }
                                    socket.emit(player.token, {
                                        response_type: ServerSocket.response_types.MENU_INFO_RESPONSE,
                                        data: {
                                            city_data: request_city,
                                            production_units: player.production_units
                                        }
                                    });
                                    break;
                                case ServerSocket.request_types.GET_STARS_DATA:
                                    if (!player.star_production_has_started) {
                                        player.produce_stars();
                                    }
                                    socket.emit(player.token, {
                                        response_type: ServerSocket.response_types.STARS_DATA_RESPONSE,
                                        data: {
                                            star_production: player.star_production,
                                            total_owned_stars: player.total_owned_stars,
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
                }
                catch (e) {
                    console.log(e);
                }
            });
        });
    }
    ServerSocket.add_response_listener = add_response_listener;
    // acts as a setter - changes game_state according to clients request and game rules.
    function add_request_listener() {
        app_1.App.io.on("connection", function (socket) {
            // receive a message from the public
            socket.on("send-data", function () {
                var _a, _b;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                // try {
                var request_type = args[0].request_type;
                var request_data = args[0].data;
                var game = MatchMaker_1.MatchMaker.get_game(request_data.game_token);
                if (game != null) {
                    var player = game.get_player(request_data.player_token);
                    if (player != null) {
                        // switch for different request types
                        switch (request_type) {
                            case ServerSocket.request_types.PRODUCE_UNIT:
                                var city = game.get_city(request_data.city_name, player);
                                var unit_type = request_data.unit_type;
                                if (city != null) {
                                    city.produce_unit_and_send_response(socket, unit_type, game.map);
                                }
                                break;
                            case ServerSocket.request_types.MOVE_UNITS:
                                var unit = player.get_unit(request_data.unit_id);
                                var path = new Path_1.default(game, request_data.path);
                                if (!path.is_valid() || unit == null) {
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.INVALID_MOVE_RESPONSE,
                                        data: {
                                            unit: unit
                                        }
                                    }, player.token);
                                    break;
                                }
                                unit.move_and_send_response(path.path, game, player, socket);
                                break;
                            case ServerSocket.request_types.ATTACK_UNIT:
                                ServerSocket.send_unit_attack(socket, game, player, request_data.attacked_unit_id, request_data.unit_id, new Path_1.default(game, request_data.path));
                                break;
                            case ServerSocket.request_types.SETTLE:
                                var city_node = game.map.get_node(request_data.x, request_data.y);
                                var can_settle = game.can_settle(player, city_node, request_data.id);
                                if (can_settle) {
                                    game.add_city(player, city_node);
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.NEW_CITY,
                                        data: {
                                            city_x: request_data.x,
                                            city_y: request_data.y,
                                            city_node: (_a = game.map.get_node(request_data.x, request_data.y)) === null || _a === void 0 ? void 0 : _a.get_data(player.token)
                                        }
                                    }, player.token);
                                }
                                else {
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.CANNOT_SETTLE,
                                        data: {
                                            x: request_data.x,
                                            y: request_data.y,
                                        }
                                    }, player.token);
                                }
                                break;
                            case ServerSocket.request_types.HARVEST_NODE:
                                (_b = game.map.get_node(request_data.node_x, request_data.node_y)) === null || _b === void 0 ? void 0 : _b.harvest(player, game, socket);
                                break;
                            case ServerSocket.request_types.PURCHASE_TECHNOLOGY:
                                if (game.purchase_technology(request_data.player_token, request_data.tech_name)) {
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE,
                                        data: {
                                            root_tech_tree_node: player.root_tech_tree_node,
                                            total_owned_stars: player.total_owned_stars
                                        }
                                    }, player.token);
                                }
                                else {
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
                                        data: {
                                            title: "Cannot purchase " + request_data.tech_name,
                                            message: "You don't have enough stars to purchase this technology"
                                        }
                                    }, player.token);
                                }
                        }
                    }
                }
                // }catch (e){
                //     console.log("error invalid input")
                // }
            });
        });
    }
    ServerSocket.add_request_listener = add_request_listener;
    function send_unit_produced_response(socket, city, unit) {
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.UNIT_RESPONSE,
            data: {
                unit: unit.get_data(),
                // update client stars
                total_owned_stars: city.owner.total_owned_stars
            }
        }, city.owner.token);
    }
    ServerSocket.send_unit_produced_response = send_unit_produced_response;
    function send_node_harvested_response(socket, node, player) {
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.HARVEST_NODE_RESPONSE,
            data: {
                node: node.get_data(player.token),
                // update client stars
                total_owned_stars: player.total_owned_stars,
                star_production: player.star_production
            }
        }, player.token);
    }
    ServerSocket.send_node_harvested_response = send_node_harvested_response;
    function something_wrong_response(socket, player, title, message) {
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
            data: {
                title: title,
                message: message
            }
        }, player.token);
    }
    ServerSocket.something_wrong_response = something_wrong_response;
    function invalid_move_response(socket, player, title, message) {
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.INVALID_MOVE_RESPONSE,
            data: {
                title: title,
                message: message
            }
        }, player.token);
    }
    ServerSocket.invalid_move_response = invalid_move_response;
    function send_unit_movement_to_owner(socket, unit, all_discovered_nodes, in_game_player) {
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.UNIT_MOVED_RESPONSE,
            data: {
                unit: unit.get_data(),
                nodes: all_discovered_nodes,
            }
        }, in_game_player.token);
    }
    ServerSocket.send_unit_movement_to_owner = send_unit_movement_to_owner;
    function send_unit_movement_to_all(socket, unit, in_game_player) {
        ServerSocket.send_data_to_all(socket, {
            response_type: ServerSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE,
            data: {
                unit: unit.get_data(),
            }
        }, in_game_player.token);
    }
    ServerSocket.send_unit_movement_to_all = send_unit_movement_to_all;
    function send_update_harvest_cost(socket, nodes, harvest_cost, player) {
        var node_cords = [];
        nodes.map(function (node) {
            node_cords.push([node.x, node.y]);
        });
        ServerSocket.send_data(socket, {
            response_type: ServerSocket.response_types.HARVEST_COST_RESPONSE,
            data: {
                node_cords: node_cords,
                harvest_cost: harvest_cost,
            }
        }, player.token);
    }
    ServerSocket.send_update_harvest_cost = send_update_harvest_cost;
    function send_unit_attack(socket, game, player, attacked_unit_id, unit_id, path) {
        var enemy_player = game.get_enemy_player_by_unit(attacked_unit_id);
        if (enemy_player == null) {
            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);
            return;
        }
        var friendly_unit = player.get_unit(unit_id);
        var enemy_unit = enemy_player.get_unit(attacked_unit_id);
        if (friendly_unit == null || enemy_unit == null) {
            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);
        }
        // attack path length is the request range of the attack
        else if (friendly_unit.range >= path.path.length - 1) {
            var are_units_dead = player.attack_unit(friendly_unit, enemy_unit, enemy_player, game.map);
            var is_friendly_unit_dead = are_units_dead[0];
            var is_enemy_unit_dead = are_units_dead[1];
            if (!is_friendly_unit_dead && is_enemy_unit_dead) {
                friendly_unit.move_and_send_response(path.path, game, player, socket);
            }
            // send to enemy
            ServerSocket.send_data_to_all(socket, {
                response_type: ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
                data: {
                    unit_1: friendly_unit,
                    is_unit_1_dead: is_friendly_unit_dead,
                    unit_2: enemy_unit,
                    is_unit_2_dead: is_enemy_unit_dead
                }
            }, enemy_player.token);
            // send to me
            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
                data: {
                    unit_1: friendly_unit,
                    is_unit_1_dead: is_friendly_unit_dead,
                    unit_2: enemy_unit,
                    is_unit_2_dead: is_enemy_unit_dead
                }
            }, player.token);
        }
        // unit out of range
        else {
            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                data: {
                    message: "invalid range"
                }
            }, player.token);
        }
    }
    ServerSocket.send_unit_attack = send_unit_attack;
})(ServerSocket = exports.ServerSocket || (exports.ServerSocket = {}));
