import { createServer } from 'http';
import { Server, Socket } from "socket.io";
import Path from "./game_logic/Map/Path.js";
import {MatchMaker} from "./MatchMaker";
import City from "./game_logic/City/City";
import {Unit} from "./game_logic/Units/Unit";
import Player from "./game_logic/Player";
import {Node} from "./game_logic/Map/Node";
import {NodeInterface} from "./game_logic/Map/NodeInterface";
import {epilogue} from "concurrently/dist/bin/epilogue";
import exp from "constants";
import {Utils} from "../Utils";

const httpServer = createServer();
const io = new Server(httpServer);

// singleton
export namespace ServerSocket {
    export const PORT_SOCKET: number = 3000;
    export let is_listening: boolean =  false;

    export const response_types: { ALL_RESPONSE: string; MAP_RESPONSE: string; UNIT_MOVED_RESPONSE: string;
        INVALID_MOVE_RESPONSE: string; UNITS_RESPONSE: string; UNIT_RESPONSE: string, ENEMY_UNIT_MOVED_RESPONSE: string,
        NEW_CITY: string, CANNOT_SETTLE: string, STARS_DATA_RESPONSE: string, ENEMY_UNIT_DISAPPEARED: string, ATTACK_UNIT_RESPONSE: string,
        MENU_INFO_RESPONSE: string, HARVEST_NODE_RESPONSE: string, HARVEST_NODE: string, INVALID_ATTACK_RESPONSE: string, INSUFFICIENT_FUNDS_RESPONSE: string} =  {

        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        UNIT_RESPONSE: "UNIT_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",

        ATTACK_UNIT_RESPONSE: "ATTACK_UNIT_RESPONSE",

        NEW_CITY: "NEW_CITY",
        CANNOT_SETTLE: "CANNOT_SETTLE",

        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",

        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_NODE: "HARVEST_NODE",

        INVALID_ATTACK_RESPONSE: "INVALID_ATTACK_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        INSUFFICIENT_FUNDS_RESPONSE: "INSUFFICIENT_FUNDS_RESPONSE",
    };
    export const request_types: {readonly GET_MAP: string, readonly GET_UNITS: string,
                                          readonly GET_ALL: string, readonly GET_MENU_INFO: string,
                                          readonly GET_STARS_DATA: string, readonly PRODUCE_UNIT: string,
                                          readonly MOVE_UNITS: string, readonly HARVEST_NODE: string, readonly SETTLE: string,
                                          readonly ATTACK_UNIT: string, readonly FIND_1v1_OPPONENT: string, readonly FIND_2v2_OPPONENTS: string} = {

        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        GET_STARS_DATA: "GET_STARS_DATA",

        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNITS: "MOVE_UNITS",
        HARVEST_NODE: "HARVEST_NODE",
        SETTLE: "SETTLE",

        ATTACK_UNIT: "ATTACK_UNIT",

        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };

    export function init(): void {
            if (!ServerSocket.is_listening) {
                httpServer.listen(PORT_SOCKET);
                ServerSocket.is_listening = true;
            }
    }

    export function send_data(socket: Socket, data: any, player_token: string): void{
        socket.emit(player_token, data);
    }

    export function send_data_to_all(socket: Socket, data: any, player_token: string): void{
        socket.broadcast.emit(player_token, data);
    }

    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    export function add_response_listener(): void{
        io.on("connection", (socket: Socket) => {
            socket.on("get_data", (...args: any[]) => {
                try {
                    // get request data from public
                    const request_type = args[0].request_type;
                    const request_data = args[0].data;
                    console.log(`REQUEST TYPE: ${request_type}`)
                   // console.log(`got some data player_token: ${request_data.player_token}`)

                    const game = MatchMaker.get_game(request_data.game_token);

                    if (game != null) {
                        const player = game.get_player(request_data.player_token);
                        if (player != null) {
                            // switch for different responses
                            switch (request_type) {

                                case ServerSocket.request_types.GET_UNITS:
                                    let all_units = [];
                                    for (const unit of player.units) {
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
                                    let request_city;
                                    for (const city of game.get_cities_that_player_owns(player)) {
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
                                    })
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
                }catch (e){
                    console.log(e);
                }
            });
     });
}

    // acts as a setter - changes game_state according to clients request and game rules.
    export function add_request_listener(): void{
        io.on("connection", (socket: Socket) => {
            // receive a message from the public
            socket.on("send-data", (...args: any[]) => {
                // try {
                    const request_type: string = args[0].request_type;
                    const request_data = args[0].data;

                    const game = MatchMaker.get_game(request_data.game_token);

                    if (game != null) {
                        const player = game.get_player(request_data.player_token);
                        if (player != null) {
                            // switch for different request types
                            switch (request_type) {
                                case ServerSocket.request_types.PRODUCE_UNIT:
                                    const city = game.get_city(request_data.city_name, player);
                                    const unit_type = request_data.unit_type;
                                    if (city != null) {
                                        city.produce_unit_and_send_response(socket, unit_type);
                                    }
                                    break;

                                case ServerSocket.request_types.MOVE_UNITS:

                                    const unit = player.get_unit(request_data.unit_id);
                                    const path = new Path(game, request_data.path);

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
                                    const friendly_unit = player.get_unit(request_data.unit_id);
                                    const enemy_unit = player.get_unit(request_data.attacked_unit_id)
                                    const attack_path = new Path(game, request_data.path);

                                    if(friendly_unit != null)
                                    console.log(`friendly unit range: ${friendly_unit.range}`)
                                    if(enemy_unit != null)
                                    console.log(`enemy unit range: ${enemy_unit.range}`)

                                    console.log(`attack path: ${attack_path.path.length}`)

                                    if(friendly_unit == null || enemy_unit == null){

                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                                        }, player.token);

                                    }
                                    // attack path length is the request range of the attack
                                    else if(friendly_unit.range >= attack_path.path.length - 1){
                                            let enemy_player = game.get_enemy_player_by_unit(enemy_unit);
                                            console.log("here1")
                                            if(enemy_player == null){
                                                ServerSocket.send_data(socket, {
                                                    response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                                                }, player.token);
                                                return
                                            }
                                                console.log("here2")
                                            const did_units_die = player.attack_unit(friendly_unit, enemy_unit, enemy_player);

                                            ServerSocket.send_data_to_all(socket, {
                                                response_type: ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
                                                data: {
                                                    unit_1: friendly_unit,
                                                    is_unit_1_dead: did_units_die[0],
                                                    unit_2: enemy_unit,
                                                    is_unit_2_dead: did_units_die[1]
                                                }
                                            }, enemy_player.token);

                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
                                            data: {
                                                unit_1: friendly_unit,
                                                is_unit_1_dead: did_units_die[0],
                                                unit_2: enemy_unit,
                                                is_unit_2_dead: did_units_die[1]
                                            }
                                        }, player.token);

                                    }
                                    // unit out of range
                                    else{
                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                                            data: {
                                                message: "invalid range"
                                            }
                                        }, player.token);
                                    }

                                    break;

                                case ServerSocket.request_types.SETTLE:
                                    let city_node = game.map.get_node(request_data.x, request_data.y);
                                    let can_settle: boolean = game.can_settle(player, city_node, request_data.id)
                                    if (can_settle) {
                                        game.add_city(player, city_node);
                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.NEW_CITY,
                                            data: {
                                                city_x: request_data.x,
                                                city_y: request_data.y,
                                                city_node: game.map.get_node(request_data.x, request_data.y)?.get_data(player.token)
                                            }

                                        }, player.token);
                                    } else {
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
                                    game.map.get_node(request_data.node_x, request_data.node_y)?.harvest(player, socket);
                                    break;

                            }
                        }
                    }
                // }catch (e){
                //     console.log("error invalid input")
                // }
            });
        });
    }

    export function send_unit_produced_response( socket: Socket, city: City, unit: Unit){
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.UNIT_RESPONSE,
                data: {
                    unit: unit.get_data(),
                    // update client stars
                    total_owned_stars: city.owner.total_owned_stars
                }
            },
            city.owner.token);
    }

    export function send_node_harvested_response( socket: Socket, node: Node, player: Player){
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.HARVEST_NODE_RESPONSE,
                data: {
                    node: node.get_data(player.token),
                    // update client stars
                    total_owned_stars: player.total_owned_stars,
                    star_production: player.star_production
                }
            },
            player.token);
    }

    export function insufficient_funds_response(socket: Socket, player: Player, title: string, message: string){
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INSUFFICIENT_FUNDS_RESPONSE,
                data: {
                    title: title,
                    message: message
                }
            },
            player.token);
    }

    export function invalid_move_response(socket: Socket, player: Player, title: string, message: string){
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_MOVE_RESPONSE,
                data: {
                    title: title,
                    message: message
                }
            },
            player.token);
    }

    export function send_unit_movement_to_owner(socket: Socket, unit: Unit, all_discovered_nodes: NodeInterface[], in_game_player: Player){
        ServerSocket.send_data(socket,
            {
                response_type: ServerSocket.response_types.UNIT_MOVED_RESPONSE,
                data: {
                    unit: unit.get_data(),
                    nodes: all_discovered_nodes,
                }
            }, in_game_player.token)
    }
    export function send_unit_movement_to_all(socket: Socket, unit: Unit, in_game_player: Player){
        ServerSocket.send_data_to_all(socket,
            {
                response_type: ServerSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE,
                data: {
                    unit: unit.get_data(),
                }
            }, in_game_player.token)
    }


}