"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
const ServerSocket_1 = require("../../ServerSocket");
const Path_1 = __importDefault(require("../Map/Path"));
class Unit {
    constructor(x, y, id, map, unit_init_data) {
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
    move_and_send_response(path, game, player, socket) {
        // remove first element
        path.shift();
        this.move_along_path(game, player, socket, path);
    }
    // move this Unit along a valid path provided by the client
    move_along_path(game, player, socket, path) {
        // used at the end of the path
        let MOVEMENT_PER_A_MINUTE = 1;
        // movement per a minute calculation
        if (path.length !== 0)
            MOVEMENT_PER_A_MINUTE = path[0].get_movement_time() / (this.movement / 100);
        setTimeout(() => {
            var _a;
            if (path.length === 0) {
                return;
            }
            const current_node = path[0];
            if (current_node.is_water() && !player.owned_technology.includes("Ship Building")) {
                ServerSocket_1.ServerSocket.something_wrong_response(socket, player.token, "INVALID MOVE", "You cannot move over water tiles without owning the Ship Building technology");
                return;
            }
            // check if movement is valid or if move can be translated as attack
            if (current_node.unit != null) {
                if (player.owns_this_unit(current_node.unit.id)) {
                    ServerSocket_1.ServerSocket.something_wrong_response(socket, player.token, "INVALID MOVE", "You cannot move over a friendly unit you can only attack an enemy unit.");
                    return;
                }
            }
            // for range attack units
            const destination = path[path.length - 1];
            if (destination.unit != null) {
                if (!player.owns_this_unit(destination.unit.id) && this.range >= path.length) {
                    let path_cords = [];
                    path.map((node) => {
                        path_cords.push([node.x, node.y]);
                    });
                    ServerSocket_1.ServerSocket.send_unit_attack(socket, game, player, destination.unit.id, this.id, new Path_1.default(game, path_cords));
                    return;
                }
            }
            // movement
            game.map.all_nodes[this.y][this.x].unit = null;
            current_node.unit = this;
            this.is_on_water = current_node.is_water();
            this.x = current_node.x;
            this.y = current_node.y;
            let all_discovered_nodes = [];
            for (const node of current_node.neighbors) {
                if (node != null) {
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token));
                }
            }
            all_discovered_nodes.push(current_node.get_data(player.token));
            // find previously unseen enemy units
            for (const enemy_player of game.get_enemy_players(player.token)) {
                for (const node of all_discovered_nodes) {
                    if (node.unit == null)
                        continue;
                    for (const unit of enemy_player.units) {
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
            let city_node = game.map.all_nodes[this.y][this.x];
            if (city_node.city != null && ((_a = city_node === null || city_node === void 0 ? void 0 : city_node.city) === null || _a === void 0 ? void 0 : _a.owner.token) != player.token) {
                city_node.city.owner = player;
                let is_conquered = false;
                game.all_players.map((in_game_player) => {
                    if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                        ServerSocket_1.ServerSocket.send_conquered_city(socket, game, in_game_player, city_node.city, this);
                        is_conquered = true;
                    }
                });
                if (is_conquered) {
                    return;
                }
            }
            // show unit to player if the unit steps on a discovered node
            game.all_players.map((in_game_player) => {
                if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                    if (in_game_player.token === player.token) {
                        ServerSocket_1.ServerSocket.send_unit_movement_to_owner(socket, this, all_discovered_nodes, in_game_player);
                    }
                    else {
                        ServerSocket_1.ServerSocket.send_unit_movement_to_all(socket, this, in_game_player);
                    }
                }
                else {
                    if (in_game_player.token !== player.token) {
                        ServerSocket_1.ServerSocket.send_data_to_all(socket, {
                            response_type: ServerSocket_1.ServerSocket.response_types.ENEMY_UNIT_DISAPPEARED,
                            data: {
                                unit: this.get_data(),
                            }
                        }, in_game_player.token);
                    }
                }
            });
            path.shift();
            this.move_along_path(game, player, socket, path);
        }, MOVEMENT_PER_A_MINUTE);
    }
    get_id() {
        return this.id;
    }
    get_x() {
        return this.x;
    }
    get_y() {
        return this.y;
    }
    get_data() {
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
    }
}
exports.Unit = Unit;
// types of units
Unit.CAVALRY = "Cavalry";
Unit.MELEE = "Melee";
Unit.RANGE = "Range";
Unit.SETTLER = "Settler";
// action that designated units can take
Unit.FORTIFY = "Fortify";
Unit.SETTLE = "Settle";
