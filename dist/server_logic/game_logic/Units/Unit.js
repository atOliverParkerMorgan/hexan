"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
var ServerSocket_1 = require("../../ServerSocket");
var Path_1 = __importDefault(require("../Map/Path"));
var Unit = /** @class */ (function () {
    function Unit(x, y, id, map, unit_init_data) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = unit_init_data.type;
        this.action = unit_init_data.action;
        this.is_visible_to_enemy = false;
        this.is_on_water = false;
        this.attack = unit_init_data.attack;
        this.health = unit_init_data.health;
        this.movement = unit_init_data.movement;
        this.range = unit_init_data.range;
        this.name = unit_init_data.name;
        this.cost = unit_init_data.cost;
        map.all_nodes[this.y][this.x].unit = this;
    }
    // send response to public if the unit has successfully moved
    Unit.prototype.move_and_send_response = function (path, game, player, socket) {
        // remove first element
        path.shift();
        this.move_along_path(game, player, socket, path);
    };
    // move this Unit along a valid path provided by the client
    Unit.prototype.move_along_path = function (game, player, socket, path) {
        var _this = this;
        // used at the end of the path
        var MOVEMENT_PER_A_MINUTE = 1;
        // movement per a minute calculation
        if (path.length !== 0)
            MOVEMENT_PER_A_MINUTE = path[0].get_movement_time() / (this.movement / 100);
        setTimeout(function () {
            if (path.length === 0) {
                return;
            }
            var current_node = path[0];
            if (current_node.is_water() && !player.owned_technology.includes("Ship Building")) {
                ServerSocket_1.ServerSocket.something_wrong_response(socket, player, "INVALID MOVE", "You cannot move over water tiles without owning the Ship Building technology");
                return;
            }
            // check if movement is valid or if move can be translated as attack
            if (current_node.unit != null) {
                if (player.owns_this_unit(current_node.unit.id)) {
                    ServerSocket_1.ServerSocket.something_wrong_response(socket, player, "INVALID MOVE", "You cannot move over a friendly unit or city you can only attack");
                    return;
                }
            }
            // for range attack units
            var destination = path[path.length - 1];
            if (destination.unit != null) {
                if (!player.owns_this_unit(destination.unit.id) && _this.range >= path.length) {
                    var path_cords_1 = [];
                    path.map(function (node) {
                        path_cords_1.push([node.x, node.y]);
                    });
                    ServerSocket_1.ServerSocket.send_unit_attack(socket, game, player, destination.unit.id, _this.id, new Path_1.default(game, path_cords_1));
                    return;
                }
            }
            // movement
            game.map.all_nodes[_this.y][_this.x].unit = null;
            current_node.unit = _this;
            _this.is_on_water = current_node.is_water();
            _this.x = current_node.x;
            _this.y = current_node.y;
            var all_discovered_nodes = [];
            for (var _i = 0, _a = current_node.neighbors; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node != null) {
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token));
                }
            }
            all_discovered_nodes.push(current_node.get_data(player.token));
            // find previously unseen enemy units
            for (var _b = 0, _c = game.get_enemy_players(player.token); _b < _c.length; _b++) {
                var enemy_player = _c[_b];
                for (var _d = 0, all_discovered_nodes_1 = all_discovered_nodes; _d < all_discovered_nodes_1.length; _d++) {
                    var node = all_discovered_nodes_1[_d];
                    if (node.unit == null)
                        continue;
                    for (var _e = 0, _f = enemy_player.units; _e < _f.length; _e++) {
                        var unit = _f[_e];
                        if (node.x === unit.x && node.y === unit.y) {
                            // found new enemy unit by moving
                            ServerSocket_1.ServerSocket.send_data(socket, {
                                response_type: ServerSocket_1.ServerSocket.response_types.ENEMY_FOUND_RESPONSE,
                                data: {
                                    unit: unit.get_data(),
                                }
                            }, player.token);
                        }
                    }
                }
            }
            // show unit to player if the unit steps on a discovered node
            game.all_players.map(function (in_game_player) {
                if (game.map.all_nodes[_this.y][_this.x].is_shown.includes(in_game_player.token)) {
                    var node_city = game.map.all_nodes[_this.y][_this.x].city;
                    if (node_city != null && (node_city === null || node_city === void 0 ? void 0 : node_city.owner.token) != player.token) {
                        node_city.owner = player;
                        ServerSocket_1.ServerSocket.send_conquered_city(socket, game, in_game_player, node_city);
                    }
                    if (in_game_player.token === player.token) {
                        ServerSocket_1.ServerSocket.send_unit_movement_to_owner(socket, _this, all_discovered_nodes, in_game_player);
                    }
                    else {
                        ServerSocket_1.ServerSocket.send_unit_movement_to_all(socket, _this, in_game_player);
                    }
                }
                else {
                    if (in_game_player.token !== player.token) {
                        ServerSocket_1.ServerSocket.send_data_to_all(socket, {
                            response_type: ServerSocket_1.ServerSocket.response_types.ENEMY_UNIT_DISAPPEARED,
                            data: {
                                unit: _this.get_data(),
                            }
                        }, in_game_player.token);
                    }
                }
            });
            path.shift();
            _this.move_along_path(game, player, socket, path);
        }, MOVEMENT_PER_A_MINUTE);
    };
    Unit.prototype.get_id = function () {
        return this.id;
    };
    Unit.prototype.get_x = function () {
        return this.x;
    };
    Unit.prototype.get_y = function () {
        return this.y;
    };
    Unit.prototype.get_data = function () {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            type: this.type,
            action: this.action,
            is_on_water: this.is_on_water,
            attack: this.attack,
            health: this.health,
            range: this.range,
            movement: this.movement,
            name: this.name,
            cost: this.cost,
        };
    };
    // types of units
    Unit.CAVALRY = "Cavalry";
    Unit.MELEE = "Melee";
    Unit.RANGE = "Range";
    Unit.SETTLER = "Settler";
    // action that designated units can take
    Unit.FORTIFY = "Fortify";
    Unit.SETTLE = "Settle";
    Unit.BUILD = "Build";
    return Unit;
}());
exports.Unit = Unit;
