import {createServer} from 'http';
import {Server, Socket} from "socket.io";
import Path from "./game_logic/Map/Path";
import {MatchMaker} from "./MatchMaker";
import City from "./game_logic/City/City";
import {Unit} from "./game_logic/Units/Unit";
import Player from "./game_logic/Player";
import {Node} from "./game_logic/Map/Node";
import {NodeInterface} from "./game_logic/Map/NodeInterface";
import Game from "./game_logic/Game";
import {App} from "../app";


// singleton
export namespace ServerSocket {
    export const PORT_SOCKET: number = 3000;
    export let is_listening: boolean =  false;

    export const response_types: { ALL_RESPONSE: string; MAP_RESPONSE: string; UNIT_MOVED_RESPONSE: string;
        INVALID_MOVE_RESPONSE: string; UNITS_RESPONSE: string; UNIT_RESPONSE: string, ENEMY_UNIT_MOVED_RESPONSE: string,
        NEW_CITY: string, CANNOT_SETTLE: string, STARS_DATA_RESPONSE: string, ENEMY_UNIT_DISAPPEARED: string, ENEMY_FOUND_RESPONSE: string, ATTACK_UNIT_RESPONSE: string,
        HARVEST_COST_RESPONSE: string, MENU_INFO_RESPONSE: string, HARVEST_NODE_RESPONSE: string, HARVEST_NODE: string, PURCHASED_TECHNOLOGY_RESPONSE:string,
        INVALID_ATTACK_RESPONSE: string, SOMETHING_WRONG_RESPONSE: string} =  {

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
    export const request_types: {
        readonly GET_MAP: string, readonly GET_UNITS: string,
        readonly GET_ALL: string, readonly GET_MENU_INFO: string,
        readonly GET_STARS_DATA: string, readonly PRODUCE_UNIT: string, readonly PURCHASE_TECHNOLOGY: string,
        readonly MOVE_UNITS: string, readonly HARVEST_NODE: string, readonly SETTLE: string,
        readonly ATTACK_UNIT: string, readonly FIND_1v1_OPPONENT: string, readonly FIND_2v2_OPPONENTS: string, HARVEST_COST: string} = {

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

    export function init(): void {
            if (!ServerSocket.is_listening) {
                App.httpServer.listen(PORT_SOCKET);
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

        App.io.on("connect_error", (err) => {
            console.log(`connect_error due to ${err.message}`);
        });

        App.io.on("connection", (socket: Socket) => {
            socket.on("get_data", (...args: any[]) => {
                try {
                    // get request data from public
                    const request_type = args[0].request_type;
                    const request_data = args[0].data;
                    console.log(`REQUEST TYPE: ${request_type}`)

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
                                            city_data: request_city,
                                            production_units: player.production_units
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
        App.io.on("connection", (socket: Socket) => {
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
                                        city.produce_unit_and_send_response(socket, unit_type, game.map);
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
                                    ServerSocket.send_unit_attack(socket, game, player, request_data.attacked_unit_id, request_data.unit_id,  new Path(game, request_data.path));
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
                                    game.map.get_node(request_data.node_x, request_data.node_y)?.harvest(player, game, socket);
                                    break;

                                case ServerSocket.request_types.PURCHASE_TECHNOLOGY:
                                    if(game.purchase_technology(request_data.player_token, request_data.tech_name)){
                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE,
                                            data: {
                                                root_tech_tree_node: player.root_tech_tree_node,
                                                total_owned_stars: player.total_owned_stars
                                            }
                                        }, player.token);
                                    }else{
                                        ServerSocket.send_data(socket, {
                                            response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
                                            data: {
                                                title: "Cannot purchase "+ request_data.tech_name,
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

    export function something_wrong_response(socket: Socket, player: Player, title: string, message: string){
        ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
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

    export function send_update_harvest_cost(socket:Socket, nodes: Node[], harvest_cost: number, player: Player){
        let node_cords: number[][] = []
        nodes.map((node)=>{
            node_cords.push([node.x, node.y])
        })

        ServerSocket.send_data(socket, {
            response_type: response_types.HARVEST_COST_RESPONSE,
            data:{
                node_cords: node_cords,
                harvest_cost: harvest_cost,
            }
        }, player.token)
    }

    export function send_unit_attack(socket: Socket, game: Game, player: Player, attacked_unit_id: string, unit_id: string, path: Path){
        const enemy_player = game.get_enemy_player_by_unit(attacked_unit_id);

        if(enemy_player == null){

            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);
            return;
        }

        const friendly_unit = player.get_unit(unit_id);
        const enemy_unit = enemy_player.get_unit(attacked_unit_id)

        if(friendly_unit == null || enemy_unit == null){

            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);

        }
        // attack path length is the request range of the attack
        else if(friendly_unit.range >= path.path.length - 1){

            const are_units_dead = player.attack_unit(friendly_unit, enemy_unit, enemy_player, game.map);
            const is_friendly_unit_dead = are_units_dead[0];
            const is_enemy_unit_dead = are_units_dead[1];

            if(!is_friendly_unit_dead && is_enemy_unit_dead){
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
        else{
            ServerSocket.send_data(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                data: {
                    message: "invalid range"
                }
            }, player.token);
        }
    }
}