import {Socket} from "socket.io";
import Path from "./Map/Path";
import {MatchMaker} from "./MatchMaker";

import {App} from "../../app";
import GameInterface from "../Interfaces/GameInterface";
import UnitInterface from "../Interfaces/Units/UnitInterface";
import NodeInterface from "../Interfaces/Map/NodeInterface";
import PlayerInterface from "../Interfaces/PlayerInterface";
import CityInterface from "../Interfaces/City/CityInterface";
// singleton
export namespace ServerSocket {

    export const response_types = {

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
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",

        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",

        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_NODE: "HARVEST_NODE",

        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",

        INVALID_ATTACK_RESPONSE: "INVALID_ATTACK_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE",

        END_GAME_RESPONSE: "END_GAME_RESPONSE",
        FOUND_GAME_RESPONSE: "FOUND_GAME_RESPONSE"

    };

    export const request_types = {

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
    };

    export function sendData(socket: Socket, data: any, player_token: string): void{
        socket.emit(player_token, data);
    }

    export function sendDataToAll(socket: Socket, data: any, player_token: string): void{
        socket.broadcast.emit(player_token, data);
    }

    export function addConnectionListener(): void{
        App.io.on("connection", (socket: Socket) => {
            console.log("Socket id: ",socket.id);
        })
    }

    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    export function addResponseListener(): void{

        App.io.on("connect_error", (err: any) => {
            console.log(`connect_error due to ${err.message}`);
        });

        App.io.on("connection", (socket: Socket) => {
            socket.on("get_data", (...args: any[]) => {
                try {
                    // get request data from public
                    const request_type = args[0].request_type;
                    const request_data = args[0].data;
                    console.log(`REQUEST TYPE: ${request_type}`)

                    const game_and_player_array = isGameValid(socket, request_data);

                    if(game_and_player_array == null){
                        return
                    }

                    const game = game_and_player_array[0];
                    const player = game_and_player_array[1];

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
                }catch (e){
                    console.log(e);
                }
            });
        });
    }

    // acts as a setter - changes game_state according to clients request and game rules.
    export function addRequestListener(): void{
        App.io.on("connection", (socket: Socket) => {
            console.log(socket.id)
            // receive a message from the public
            socket.on("send-data", (...args: any[]) => {
                // try {
                const request_type: string = args[0].request_type;
                const request_data = args[0].data;

                const game_and_player_array = isGameValid(socket, request_data);

                if(game_and_player_array == null){
                    return
                }

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                // switch for different request types
                switch (request_type) {
                    case ServerSocket.request_types.FIND_1v1_OPPONENT:
                        MatchMaker.addPlayer1v1(socket, request_data.map_size);
                        break;

                    case ServerSocket.request_types.FIND_AI_OPPONENT:
                        MatchMaker.findAiGame(socket, request_data.map_size);
                        break;

                    case ServerSocket.request_types.PRODUCE_UNIT:
                        const city = game.get_city(request_data.city_name, player);
                        const unit_type = request_data.unit_type;
                        if (city != null) {
                            city.produce_unit_and_send_response(socket, unit_type, game);
                        }
                        break;

                    case ServerSocket.request_types.MOVE_UNITS:

                        const unit = player.get_unit(request_data.unit_id);
                        const path = new Path(game, request_data.path);

                        if (!path.isValid() || unit == null) {
                            ServerSocket.sendData(socket, {
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
                        ServerSocket.sendUnitAttack(socket, game, player, request_data.attacked_unit_id, request_data.unit_id,  new Path(game, request_data.path));
                        break;

                    case ServerSocket.request_types.SETTLE:
                        let city_node = game.map.get_node(request_data.x, request_data.y);
                        let can_settle: boolean = game.can_settle(player, city_node, request_data.id)
                        if (can_settle) {
                            game.add_city(player, city_node);
                            ServerSocket.sendData(socket, {
                                response_type: ServerSocket.response_types.NEW_CITY,
                                data: {
                                    city_x: request_data.x,
                                    city_y: request_data.y,
                                    city_node: game.map.get_node(request_data.x, request_data.y)?.get_data(player.token)
                                }

                            }, player.token);
                        } else {
                            ServerSocket.sendData(socket, {
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
                            ServerSocket.sendData(socket, {
                                response_type: ServerSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE,
                                data: {
                                    root_tech_tree_node: player.root_tech_tree_node,
                                    total_owned_stars: player.total_owned_stars
                                }
                            }, player.token);
                        }else{
                            ServerSocket.sendData(socket, {
                                response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
                                data: {
                                    title: "Cannot purchase "+ request_data.tech_name,
                                    message: "You don't have enough stars to purchase this technology"
                                }
                            }, player.token);
                        }
                }


                // }catch (e){
                //     console.log("error invalid input")
                // }
            });
        });
    }

    export function sendUnitProducedResponse(socket: Socket, city: CityInterface, unit: UnitInterface, player: PlayerInterface){

        if(city.owner.token === player.token) {

            ServerSocket.sendData(socket, {
                    response_type: ServerSocket.response_types.UNIT_RESPONSE,
                    data: {
                        unit: unit.getData(),
                        // update client stars
                        total_owned_stars:  city.owner.total_owned_stars
                    }
                },
                player.token);
        }
        else {
            ServerSocket.sendDataToAll(socket, {
                    response_type: ServerSocket.response_types.UNIT_RESPONSE,
                    data: {
                        unit: unit.getData(),
                        // update client stars
                        total_owned_stars: -1
                    }
                },
                player.token);
        }
    }

    export function sendNodeHarvestedResponse(socket: Socket, node: NodeInterface, player: PlayerInterface){
        ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.HARVEST_NODE_RESPONSE,
                data: {
                    node: node.getData(player.token),
                    // update client stars
                    total_owned_stars: player.total_owned_stars,
                    star_production: player.star_production
                }
            },
            player.token);
    }

    export function somethingWrongResponse(socket: Socket, player_token: string, title: string, message: string){
        ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
                data: {
                    title: title,
                    message: message
                }
            },
            player_token);
    }

    export function invalidMoveResponse(socket: Socket, player: PlayerInterface, title: string, message: string){
        ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.INVALID_MOVE_RESPONSE,
                data: {
                    title: title,
                    message: message
                }
            },
            player.token);
    }

    export function sendUnitMovementToOwner(socket: Socket, unit: UnitInterface, all_discovered_nodes: NodeInterface[], in_game_player: PlayerInterface){
        ServerSocket.sendData(socket,
            {
                response_type: ServerSocket.response_types.UNIT_MOVED_RESPONSE,
                data: {
                    unit: unit.getData(),
                    nodes: all_discovered_nodes,
                }
            }, in_game_player.token)
    }
    export function sendUnitMovementToAll(socket: Socket, unit: UnitInterface, in_game_player: PlayerInterface){
        ServerSocket.sendDataToAll(socket,
            {
                response_type: ServerSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE,
                data: {
                    unit: unit.getData(),
                }
            }, in_game_player.token)
    }

    export function sendUpdateHarvestCost(socket:Socket, nodes: NodeInterface[], harvest_cost: number, player: PlayerInterface){
        let node_cords: number[][] = []
        nodes.map((node)=>{
            node_cords.push([node.x, node.y])
        })

        ServerSocket.sendData(socket, {
            response_type: response_types.HARVEST_COST_RESPONSE,
            data:{
                node_cords: node_cords,
                harvest_cost: harvest_cost,
            }
        }, player.token)
    }

    export function sendConqueredCity(socket: Socket, game: GameInterface, player: PlayerInterface, city: CityInterface, unit: UnitInterface){

        if(player.token === city.owner.token){
            if(!game.playerIsAlive(game.getEnemyPlayers(player.token)[0])){
                ServerSocket.sendData(socket, {
                    response_type: ServerSocket.response_types.END_GAME_RESPONSE,
                    data:{
                        won: true
                    }
                }, player.token);
            }

            ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.CONQUERED_CITY_RESPONSE,
                data:{
                    city: city.getData(player.token),
                    unit: unit.getData()
                }
            }, player.token);

        }else{

            if(!game.playerIsAlive(player)){
                ServerSocket.sendDataToAll(socket, {
                    response_type: ServerSocket.response_types.END_GAME_RESPONSE,
                    data:{
                        won: false
                    }
                }, player.token);
            }

            ServerSocket.sendDataToAll(socket, {
                response_type: ServerSocket.response_types.CONQUERED_CITY_RESPONSE,
                data: {
                    city: city.getData(player.token),
                    unit: unit.getData()
                }
            }, player.token);
        }
    }

    function isGameValid(socket: Socket, request_data: any): any{

        const game = MatchMaker.getGame(request_data.game_token);
        if (game == null) {
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Game doesn't exist", "Error could find your game!");
            return null;
        }

        // check if player exists
        const player = game.getPlayer(request_data.player_token);
        if(player == null){
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Player doesn't exist", "Error could find you!");
            return null;
        }

        // check if game is ready
        if(!game?.isGameReady()){
            ServerSocket.somethingWrongResponse(socket, player.token, "Game is not ready", "Error all player in this game aren't ready!");
            return null;
        }

        return [game, player]


    }

    export function sendGameOver(socket: Socket, game: GameInterface, player_won: PlayerInterface, player_lost: PlayerInterface){
        ServerSocket.sendDataToAll(socket, {
            response_type: ServerSocket.response_types.END_GAME_RESPONSE,
            data:{
                won: false
            }
        }, player_lost.token);

        ServerSocket.sendData(socket, {
            response_type: ServerSocket.response_types.END_GAME_RESPONSE,
            data:{
                won: true
            }
        }, player_won.token);
    }



    export function sendUnitAttack(socket: Socket, game: GameInterface, player: PlayerInterface, attacked_unit_id: string, unit_id: string, path: Path){
        const enemy_player = game.getEnemyPlayerByUnit(attacked_unit_id);

        if(enemy_player == null){

            ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);
            return;
        }

        const friendly_unit = player.getUnit(unit_id);
        const enemy_unit = enemy_player.getUnit(attacked_unit_id)

        if(friendly_unit == null || enemy_unit == null){

            ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
            }, player.token);

        }
        // attack path length is the request range of the attack
        else if(friendly_unit.range >= path.path.length - 1){

            const are_units_dead = player.attackUnit(friendly_unit, enemy_unit, enemy_player, game.map);
            const is_friendly_unit_dead = are_units_dead[0];
            const is_enemy_unit_dead = are_units_dead[1];

            if(!is_friendly_unit_dead && is_enemy_unit_dead){
                friendly_unit.moveAndSendResponse(path.path, game, player, socket);
            }

            // send to enemy
            ServerSocket.sendDataToAll(socket, {
                response_type: ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
                data: {
                    unit_1: friendly_unit,
                    is_unit_1_dead: is_friendly_unit_dead,
                    unit_2: enemy_unit,
                    is_unit_2_dead: is_enemy_unit_dead
                }
            }, enemy_player.token);

            // send to me
            ServerSocket.sendData(socket, {
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
            ServerSocket.sendData(socket, {
                response_type: ServerSocket.response_types.INVALID_ATTACK_RESPONSE,
                data: {
                    message: "Invalid range"
                }
            }, player.token);
        }
    }
}