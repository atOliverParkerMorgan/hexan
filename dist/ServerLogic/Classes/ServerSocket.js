"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSocket = void 0;
const Path_1 = __importDefault(require("./Map/Path"));
const MatchMaker_1 = require("./MatchMaker");
const app_1 = require("../../app");
const Utils_1 = require("./Utils");
// singleton
var ServerSocket;
(function (ServerSocket) {
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
        NEW_ENEMY_CITY: "NEW_ENEMY_CITY",
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",
        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_NODE: "HARVEST_NODE",
        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",
        INVALID_ATTACK_RESPONSE: "INVALID_ATTACK_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE",
        PLAYER_DISCONNECTED: "PLAYER_DISCONNECTED",
        END_GAME_RESPONSE: "END_GAME_RESPONSE",
        FOUND_GAME_RESPONSE: "FOUND_GAME_RESPONSE",
        FRIEND_CODE_NOT_FOUND: "FRIEND_CODE_NOT_FOUND",
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
        FIND_AI_OPPONENT: "FIND_AI_OPPONENT",
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
        GENERATE_FRIEND_TOKEN: "GENERATE_FRIEND_TOKEN",
        CONNECT_WITH_FRIEND: "CONNECT_WITH_FRIEND"
    };
    function sendData(socket, response_type, response_data) {
        socket.emit(response_type, response_data);
    }
    ServerSocket.sendData = sendData;
    function sendDataToAll(socket, game_token, response_type, response_data) {
        socket.broadcast.to(game_token).emit(response_type, response_data);
    }
    ServerSocket.sendDataToAll = sendDataToAll;
    function sendDataToPlayer(socket, player_token, response_type, response_data) {
        socket.to(player_token).emit(response_type, response_data);
    }
    ServerSocket.sendDataToPlayer = sendDataToPlayer;
    function addListener() {
        app_1.App.io.on("connect_error", (err) => {
            console.error(`connect_error due to ${err.message}`);
        });
        app_1.App.io.on("connection", (socket) => {
            socket.on('disconnect', function () {
                // MatchMaker.friend_codes.delete(socket.id.substring(0, 5));
                MatchMaker_1.MatchMaker.all_players_searching_1v1.delete(socket.id);
                MatchMaker_1.MatchMaker.all_players_searching_2v2.delete(socket.id);
                // disconnect player
                for (const game of MatchMaker_1.MatchMaker.all_games.values()) {
                    const player = game.getPlayer(socket.id);
                    if (player != null) {
                        game.killPlayer(player);
                        if (game.game_mode === Utils_1.Utils.GAME_MODES.GAME_MODE_1v1) {
                            ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.END_GAME_RESPONSE, {
                                won: true,
                                title: "YOU WON",
                                message: "Your opponent disconnected. You won!",
                                title_style: "w3-green"
                            });
                        }
                    }
                }
            });
            socket.on(ServerSocket.request_types.GET_UNITS, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const player = game_and_player_array[1];
                let all_units = [];
                for (const unit of player.units) {
                    all_units.push(unit.getData());
                }
                ServerSocket.sendData(socket, ServerSocket.response_types.UNITS_RESPONSE, {
                    units: all_units
                });
            });
            socket.on(ServerSocket.request_types.GET_MENU_INFO, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                // get city information and possible units to produce
                let request_city;
                for (const city of game.getCitiesThatPlayerOwns(player)) {
                    if (city.name === request_data.city.name) {
                        request_city = city;
                        break;
                    }
                }
                ServerSocket.sendData(socket, ServerSocket.response_types.MENU_INFO_RESPONSE, {
                    city_data: request_city,
                    production_units: player.production_units
                });
            });
            socket.on(ServerSocket.request_types.GET_STARS_DATA, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const player = game_and_player_array[1];
                if (!player.star_production_has_started) {
                    player.produceStars();
                }
                ServerSocket.sendData(socket, ServerSocket.response_types.STARS_DATA_RESPONSE, {
                    star_production: player.star_production,
                    total_owned_stars: player.total_owned_stars,
                });
            });
            socket.on(ServerSocket.request_types.GET_ALL, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                if (!socket.rooms.has(game.token)) {
                    socket.join(game.token);
                }
                ServerSocket.sendData(socket, ServerSocket.response_types.ALL_RESPONSE, game.getData(player));
            });
            socket.on(ServerSocket.request_types.FIND_1v1_OPPONENT, (...args) => {
                const request_data = args[0];
                MatchMaker_1.MatchMaker.addPlayer1v1(socket, request_data.map_size);
            });
            socket.on(ServerSocket.request_types.GENERATE_FRIEND_TOKEN, (...args) => {
                const request_data = args[0];
                MatchMaker_1.MatchMaker.saveFriendToken(socket.id, request_data.map_size);
            });
            socket.on(ServerSocket.request_types.CONNECT_WITH_FRIEND, (...args) => {
                const request_data = args[0];
                const found_game = MatchMaker_1.MatchMaker.getGameWithFriendCode(socket, request_data.friend_code);
                if (found_game == null) {
                    ServerSocket.sendData(socket, ServerSocket.response_types.FRIEND_CODE_NOT_FOUND, {});
                }
                else {
                    ServerSocket.sendDataToPlayer(socket, found_game.getEnemyPlayers(socket.id)[0].token, ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                        game_token: found_game.token
                    });
                    ServerSocket.sendData(socket, ServerSocket.response_types.FOUND_GAME_RESPONSE, {
                        game_token: found_game.token
                    });
                }
            });
            socket.on(ServerSocket.request_types.FIND_AI_OPPONENT, (...args) => {
                const request_data = args[0];
                MatchMaker_1.MatchMaker.findAiGame(socket, request_data.map_size);
            });
            socket.on(ServerSocket.request_types.PRODUCE_UNIT, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                const city = game.getCity(request_data.city_name, player);
                const unit_type = request_data.unit_type;
                if (city != null) {
                    city.produceUnitAndSendResponse(socket, unit_type, game);
                }
            });
            socket.on(ServerSocket.request_types.MOVE_UNITS, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                const unit = player.getUnit(request_data.unit_id);
                const path = new Path_1.default(game, request_data.path);
                if (!path.isValid() || unit == null) {
                    ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_MOVE_RESPONSE, {
                        unit: unit
                    });
                    return;
                }
                unit.moveAndSendResponse(path.path, game, player, socket);
            });
            socket.on(ServerSocket.request_types.SETTLE, (...args) => {
                var _a, _b;
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                let city_node = game.map.getNode(request_data.x, request_data.y);
                //
                let can_settle = game.settle(player, city_node, request_data.id, game.map);
                if (can_settle) {
                    game.addCity(player, city_node);
                    ServerSocket.sendData(socket, ServerSocket.response_types.NEW_CITY, {
                        city_x: request_data.x,
                        city_y: request_data.y,
                        city_node: (_a = game.map.getNode(request_data.x, request_data.y)) === null || _a === void 0 ? void 0 : _a.getData(player.token)
                    });
                    // send information to enemy player if this node is discovered
                    for (const enemy_player of game.getEnemyPlayers(player.token)) {
                        if (city_node.is_shown.includes(enemy_player.token)) {
                            ServerSocket.sendDataToPlayer(socket, enemy_player.token, ServerSocket.response_types.NEW_ENEMY_CITY, {
                                city_x: request_data.x,
                                city_y: request_data.y,
                                city_node: (_b = game.map.getNode(request_data.x, request_data.y)) === null || _b === void 0 ? void 0 : _b.getData(enemy_player.token)
                            });
                        }
                    }
                }
                else {
                    ServerSocket.somethingWrongResponse(socket, "", "CAN'T SETTLE", "You can't settle this node");
                }
            });
            socket.on(ServerSocket.request_types.HARVEST_NODE, (...args) => {
                var _a;
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                (_a = game.map.getNode(request_data.node_x, request_data.node_y)) === null || _a === void 0 ? void 0 : _a.harvest(player, game, socket);
            });
            socket.on(ServerSocket.request_types.PURCHASE_TECHNOLOGY, (...args) => {
                const request_data = args[0];
                const game_and_player_array = isGameValid(socket, request_data);
                if (game_and_player_array == null)
                    return;
                const game = game_and_player_array[0];
                const player = game_and_player_array[1];
                if (game.purchaseTechnology(request_data.player_token, request_data.tech_name)) {
                    ServerSocket.sendData(socket, ServerSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE, {
                        root_tech_tree_node: player.root_tech_tree_node,
                        total_owned_stars: player.total_owned_stars
                    });
                }
                else {
                    ServerSocket.sendData(socket, ServerSocket.response_types.SOMETHING_WRONG_RESPONSE, {
                        title: "Cannot purchase " + request_data.tech_name,
                        message: "You don't have enough stars to purchase this technology or it's too advanced to purchase."
                    });
                }
            });
        });
    }
    ServerSocket.addListener = addListener;
    function sendUnitProducedResponse(socket, city, unit, player, game_token) {
        if (city.owner.token === player.token) {
            ServerSocket.sendData(socket, ServerSocket.response_types.UNIT_RESPONSE, {
                unit: unit.getData(),
                // update client stars
                total_owned_stars: city.owner.total_owned_stars
            });
        }
        else {
            ServerSocket.sendDataToAll(socket, game_token, ServerSocket.response_types.UNIT_RESPONSE, {
                unit: unit.getData(),
                // update client stars
                total_owned_stars: -1
            });
        }
    }
    ServerSocket.sendUnitProducedResponse = sendUnitProducedResponse;
    function sendNodeHarvestedResponse(socket, node, player) {
        ServerSocket.sendData(socket, ServerSocket.response_types.HARVEST_NODE_RESPONSE, {
            node: node.getData(player.token),
            // update client stars
            total_owned_stars: player.total_owned_stars,
            star_production: player.star_production
        });
    }
    ServerSocket.sendNodeHarvestedResponse = sendNodeHarvestedResponse;
    function somethingWrongResponse(socket, player_token, title, message) {
        ServerSocket.sendData(socket, ServerSocket.response_types.SOMETHING_WRONG_RESPONSE, {
            title: title,
            message: message
        });
    }
    ServerSocket.somethingWrongResponse = somethingWrongResponse;
    function invalidMoveResponse(socket, player, title, message) {
        ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_MOVE_RESPONSE, {
            title: title,
            message: message
        });
    }
    ServerSocket.invalidMoveResponse = invalidMoveResponse;
    function sendUnitMovementToOwner(socket, unit, all_discovered_nodes, in_game_player) {
        ServerSocket.sendData(socket, ServerSocket.response_types.UNIT_MOVED_RESPONSE, {
            unit: unit.getData(),
            nodes: all_discovered_nodes,
        });
    }
    ServerSocket.sendUnitMovementToOwner = sendUnitMovementToOwner;
    function sendUnitMovementToAll(socket, unit, in_game_player, game_token) {
        ServerSocket.sendDataToAll(socket, game_token, ServerSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE, {
            unit: unit.getData(),
        });
    }
    ServerSocket.sendUnitMovementToAll = sendUnitMovementToAll;
    function sendUpdateHarvestCost(socket, nodes, harvest_cost, player) {
        let node_cords = [];
        nodes.map((node) => {
            node_cords.push([node.x, node.y]);
        });
        ServerSocket.sendData(socket, ServerSocket.response_types.HARVEST_COST_RESPONSE, {
            node_cords: node_cords,
            harvest_cost: harvest_cost,
        });
    }
    ServerSocket.sendUpdateHarvestCost = sendUpdateHarvestCost;
    function sendConqueredCity(socket, game, player, city, unit) {
        if (player.token === city.owner.token) {
            if (!game.playerIsAlive(game.getEnemyPlayers(player.token)[0])) {
                ServerSocket.sendData(socket, ServerSocket.response_types.END_GAME_RESPONSE, {
                    won: true,
                    title: "YOU WON",
                    message: "Congrats annihilate all your enemies and won!",
                    title_style: "w3-green"
                });
            }
            ServerSocket.sendData(socket, ServerSocket.response_types.CONQUERED_CITY_RESPONSE, {
                city: city.getData(player.token),
                unit: unit.getData()
            });
        }
        else {
            if (!game.playerIsAlive(player)) {
                ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.END_GAME_RESPONSE, {
                    won: false,
                    title: "YOU LOST",
                    message: "Oh no your last city got conquered. This is the end for you.",
                    title_style: "w3-red"
                });
            }
            ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.CONQUERED_CITY_RESPONSE, {
                city: city.getData(player.token),
                unit: unit.getData()
            });
        }
    }
    ServerSocket.sendConqueredCity = sendConqueredCity;
    function isGameValid(socket, request_data) {
        const game = MatchMaker_1.MatchMaker.getGame(request_data.game_token);
        if (game == null) {
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Game doesn't exist", "Error couldn't find your game!");
            return null;
        }
        // check if player exists
        const player = game.getPlayer(request_data.player_token);
        if (player == null) {
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Player doesn't exist", "Error could find you!");
            return null;
        }
        return [game, player];
    }
    function sendGameOver(socket, game, player_won, player_lost) {
        ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.END_GAME_RESPONSE, {
            won: false
        });
        ServerSocket.sendData(socket, ServerSocket.response_types.END_GAME_RESPONSE, {
            won: true
        });
    }
    ServerSocket.sendGameOver = sendGameOver;
    function sendUnitAttack(socket, game, player, attacked_unit_id, unit_id, path) {
        const enemy_player = game.getEnemyPlayerByUnit(attacked_unit_id);
        if (enemy_player == null) {
            ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_ATTACK_RESPONSE, {});
            return;
        }
        const friendly_unit = player.getUnit(unit_id);
        const enemy_unit = enemy_player.getUnit(attacked_unit_id);
        if (friendly_unit == null || enemy_unit == null) {
            ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_ATTACK_RESPONSE, {});
            return;
        }
        // attack path length is the request range of the attack
        const are_units_dead = player.attackUnit(friendly_unit, enemy_unit, enemy_player, game.map);
        const is_friendly_unit_dead = are_units_dead[0];
        const is_enemy_unit_dead = are_units_dead[1];
        if (!is_friendly_unit_dead && is_enemy_unit_dead) {
            friendly_unit.moveAndSendResponse(path.path, game, player, socket);
        }
        // send to enemy
        ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.ATTACK_UNIT_RESPONSE, {
            unit_1: friendly_unit,
            is_unit_1_dead: is_friendly_unit_dead,
            unit_2: enemy_unit,
            is_unit_2_dead: is_enemy_unit_dead
        });
        // send to me
        ServerSocket.sendData(socket, ServerSocket.response_types.ATTACK_UNIT_RESPONSE, {
            unit_1: enemy_unit,
            is_unit_1_dead: is_enemy_unit_dead,
            unit_2: friendly_unit,
            is_unit_2_dead: is_friendly_unit_dead
        });
    }
    ServerSocket.sendUnitAttack = sendUnitAttack;
})(ServerSocket = exports.ServerSocket || (exports.ServerSocket = {}));
