"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSocket_1 = require("../ServerSocket");
const Path_1 = __importDefault(require("../Map/Path"));
const app_1 = require("../../../app");
const MatchMaker_1 = require("../MatchMaker");
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
    moveAndSendResponse(path, game, player, socket) {
        // remove first element
        path.shift();
        this.moveAlongPath(game, player, socket, path);
    }
    // move this Unit along a valid path provided by the client
    moveAlongPath(game, player, socket, path) {
        // used at the end of the path
        let MOVEMENT_PER_A_MINUTE = 1;
        // movement per a minute calculation
        if (path.length !== 0)
            MOVEMENT_PER_A_MINUTE = path[0].getMovementTime() / (this.movement / 100);
        setTimeout(() => {
            var _a;
            if (path.length === 0) {
                return;
            }
            const current_node = path[0];
            if (current_node.isWater() && !player.owned_technology.includes("Ship Building")) {
                ServerSocket_1.ServerSocket.somethingWrongResponse(socket, player.token, "INVALID MOVE", "You cannot move over water tiles without owning the Ship Building technology");
                return;
            }
            // check if movement is valid or if move can be translated as attack
            if (current_node.unit != null) {
                if (player.ownsThisUnit(current_node.unit.id)) {
                    ServerSocket_1.ServerSocket.somethingWrongResponse(socket, player.token, "INVALID MOVE", "You cannot move over a friendly unit you can only attack an enemy unit.");
                    return;
                }
            }
            // for range attack units
            const destination = path[path.length - 1];
            if (destination.unit != null) {
                if (!player.ownsThisUnit(destination.unit.id) && this.range >= path.length) {
                    let path_cords = [];
                    path.map((node) => {
                        path_cords.push([node.x, node.y]);
                    });
                    ServerSocket_1.ServerSocket.sendUnitAttack(socket, game, player, destination.unit.id, this.id, new Path_1.default(game, path_cords));
                    return;
                }
            }
            // movement
            game.map.all_nodes[this.y][this.x].unit = null;
            current_node.unit = this;
            this.is_on_water = current_node.isWater();
            this.x = current_node.x;
            this.y = current_node.y;
            let all_discovered_nodes = [];
            for (const node of current_node.neighbors) {
                if (node != null) {
                    game.map.makeNeighbourNodesShown(player, node);
                    all_discovered_nodes.push(node.getData(player.token));
                }
            }
            all_discovered_nodes.push(current_node.getData(player.token));
            // find previously unseen enemy units
            for (const enemy_player of game.getEnemyPlayers(player.token)) {
                for (const node of all_discovered_nodes) {
                    if (node.unit == null)
                        continue;
                    for (const unit of enemy_player.units) {
                        if (node.x === unit.x && node.y === unit.y) {
                            // found new enemy unit by moving
                            ServerSocket_1.ServerSocket.sendData(socket, ServerSocket_1.ServerSocket.response_types.ENEMY_FOUND_RESPONSE, {
                                unit: unit.getData(),
                            });
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
                        ServerSocket_1.ServerSocket.sendConqueredCity(socket, game, in_game_player, city_node.city, this);
                        is_conquered = true;
                    }
                });
                if (is_conquered) {
                    // if win condition disconnect players
                    app_1.App.io.sockets.sockets.get(game.getEnemyPlayers(player.token)[0].token).disconnect();
                    socket.disconnect();
                    MatchMaker_1.MatchMaker.all_games.delete(game.token);
                    return;
                }
            }
            // show unit to player if the unit steps on a discovered node
            game.all_players.map((in_game_player) => {
                if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                    if (in_game_player.token === player.token) {
                        ServerSocket_1.ServerSocket.sendUnitMovementToOwner(socket, this, all_discovered_nodes, in_game_player);
                    }
                    else {
                        ServerSocket_1.ServerSocket.sendUnitMovementToAll(socket, this, in_game_player, game.token);
                    }
                }
                else {
                    if (in_game_player.token !== player.token) {
                        ServerSocket_1.ServerSocket.sendDataToAll(socket, game.token, ServerSocket_1.ServerSocket.response_types.ENEMY_UNIT_DISAPPEARED, {
                            unit: this.getData(),
                        });
                    }
                }
            });
            path.shift();
            this.moveAlongPath(game, player, socket, path);
        }, MOVEMENT_PER_A_MINUTE);
    }
    getId() {
        return this.id;
    }
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    // get rid of methods when sending object threw socket
    getData() {
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
exports.default = Unit;
