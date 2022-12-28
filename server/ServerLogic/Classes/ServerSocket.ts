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

    export function sendData(socket: Socket, response_type: string, response_data: any): void{
        socket.emit(response_type, response_data);
    }

    export function sendDataToAll(socket: Socket, game_token: string, response_type: string, response_data: any): void{
        socket.broadcast.to(game_token).emit(response_type, response_data);
    }

    export function sendDataToPlayer(socket: Socket, player_token: string, response_type: string, response_data: any): void {
        socket.to(player_token).emit(response_type, response_data);
    }

    export function addListener(): void{
        App.io.on("connect_error", (err: any) => {
            console.log(`connect_error due to ${err.message}`);
        });


        App.io.on("connection", (socket: Socket) => {

            socket.on('disconnect', function () {
                MatchMaker.all_players_searching_1v1.delete(socket.id);
                MatchMaker.all_players_searching_2v2.delete(socket.id);
            });

            socket.on(ServerSocket.request_types.GET_UNITS, (...args: any[]) => {

                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const player = game_and_player_array[1];

                let all_units = [];

                for (const unit of player.units) {
                    all_units.push(unit.getData());
                }
                ServerSocket.sendData(socket, ServerSocket.response_types.UNITS_RESPONSE, {
                    units: all_units
                })
            });

            socket.on(ServerSocket.request_types.GET_MENU_INFO, (...args: any[]) => {

                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

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
                })

            });

            socket.on(ServerSocket.request_types.GET_STARS_DATA, (...args: any[]) => {

                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const player = game_and_player_array[1];

                if (!player.star_production_has_started) {
                    player.produceStars();
                }

                ServerSocket.sendData(socket, ServerSocket.response_types.STARS_DATA_RESPONSE, {
                    star_production: player.star_production,
                    total_owned_stars: player.total_owned_stars,
                })
            });

            socket.on(ServerSocket.request_types.GET_ALL, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                if(!socket.rooms.has(game.token)){
                    socket.join(game.token);
                }

                ServerSocket.sendData(socket, ServerSocket.response_types.ALL_RESPONSE, game.getData(player));
            });

            socket.on(ServerSocket.request_types.FIND_1v1_OPPONENT, (...args: any[]) => {
                const request_data = args[0];
                MatchMaker.addPlayer1v1(socket, request_data.map_size);

            });

            socket.on(ServerSocket.request_types.FIND_AI_OPPONENT, (...args: any[]) => {
                const request_data = args[0]

                MatchMaker.findAiGame(socket, request_data.map_size);
            });

            socket.on(ServerSocket.request_types.PRODUCE_UNIT, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                const city = game.getCity(request_data.city_name, player);
                const unit_type = request_data.unit_type;
                if (city != null) {
                    city.produceUnitAndSendResponse(socket, unit_type, game);
                }
            });

            socket.on(ServerSocket.request_types.MOVE_UNITS, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                const unit = player.getUnit(request_data.unit_id);
                const path = new Path(game, request_data.path);

                if (!path.isValid() || unit == null) {
                    ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_MOVE_RESPONSE,
                        {
                            unit: unit
                        });

                    return;
                }
                unit.moveAndSendResponse(path.path, game, player, socket);

            });

            // socket.on(ServerSocket.request_types.ATTACK_UNIT, (...args: any[]) => {
            //     const request_data = args[0];
            //
            //     const game_and_player_array = isGameValid(socket, request_data);
            //     if(game_and_player_array == null) return
            //
            //     const game = game_and_player_array[0];
            //     const player = game_and_player_array[1];
            //
            //     ServerSocket.sendUnitAttack(socket, game, player, request_data.attacked_unit_id, request_data.unit_id,  new Path(game, request_data.path));
            // });


            socket.on(ServerSocket.request_types.SETTLE, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                let city_node = game.map.getNode(request_data.x, request_data.y);
                let can_settle: boolean = game.canSettle(player, city_node, request_data.id)
                if (can_settle) {
                    game.addCity(player, city_node);
                    ServerSocket.sendData(socket, ServerSocket.response_types.NEW_CITY,
                        {
                            city_x: request_data.x,
                            city_y: request_data.y,
                            city_node: game.map.getNode(request_data.x, request_data.y)?.getData(player.token)
                        });
                } else {
                    ServerSocket.somethingWrongResponse(socket, "", "CAN'T SETTLE", "You can't settle this node");
                }
            });

            socket.on(ServerSocket.request_types.HARVEST_NODE, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                game.map.getNode(request_data.node_x, request_data.node_y)?.harvest(player, game, socket);
            });

            socket.on(ServerSocket.request_types.PURCHASE_TECHNOLOGY, (...args: any[]) => {
                const request_data = args[0];

                const game_and_player_array = isGameValid(socket, request_data);
                if(game_and_player_array == null) return

                const game = game_and_player_array[0];
                const player = game_and_player_array[1];

                if(game.purchaseTechnology(request_data.player_token, request_data.tech_name)){
                    ServerSocket.sendData(socket, ServerSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE,
                        {
                            root_tech_tree_node: player.root_tech_tree_node,
                            total_owned_stars: player.total_owned_stars
                        });
                }else{
                    ServerSocket.sendData(socket, ServerSocket.response_types.SOMETHING_WRONG_RESPONSE, {
                        title: "Cannot purchase "+ request_data.tech_name,
                        message: "You don't have enough stars to purchase this technology"
                    });
                }
            });

        });
    }

    export function sendUnitProducedResponse(socket: Socket, city: CityInterface, unit: UnitInterface, player: PlayerInterface, game_token: string){

        if(city.owner.token === player.token) {

            ServerSocket.sendData(socket, ServerSocket.response_types.UNIT_RESPONSE,
                    {
                        unit: unit.getData(),
                        // update client stars
                        total_owned_stars:  city.owner.total_owned_stars
                    });
        }
        else {
            ServerSocket.sendDataToAll(socket, game_token, ServerSocket.response_types.UNIT_RESPONSE,
                  {
                        unit: unit.getData(),
                        // update client stars
                        total_owned_stars: -1
                    });
        }
    }

    export function sendNodeHarvestedResponse(socket: Socket, node: NodeInterface, player: PlayerInterface){
        ServerSocket.sendData(socket, ServerSocket.response_types.HARVEST_NODE_RESPONSE,
              {
                    node: node.getData(player.token),
                    // update client stars
                    total_owned_stars: player.total_owned_stars,
                    star_production: player.star_production
                });
    }

    export function somethingWrongResponse(socket: Socket, player_token: string, title: string, message: string){
        ServerSocket.sendData(socket, ServerSocket.response_types.SOMETHING_WRONG_RESPONSE,
              {
                    title: title,
                    message: message
                });
    }

    export function invalidMoveResponse(socket: Socket, player: PlayerInterface, title: string, message: string){
        ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_MOVE_RESPONSE,
                {
                    title: title,
                    message: message
                });
    }

    export function sendUnitMovementToOwner(socket: Socket, unit: UnitInterface, all_discovered_nodes: NodeInterface[], in_game_player: PlayerInterface){
        ServerSocket.sendData(socket, ServerSocket.response_types.UNIT_MOVED_RESPONSE,
              {
                    unit: unit.getData(),
                    nodes: all_discovered_nodes,
                });
    }
    export function sendUnitMovementToAll(socket: Socket, unit: UnitInterface, in_game_player: PlayerInterface, game_token: string){
        ServerSocket.sendDataToAll(socket, game_token, ServerSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE,
              {
                    unit: unit.getData(),
                })
    }

    export function sendUpdateHarvestCost(socket:Socket, nodes: NodeInterface[], harvest_cost: number, player: PlayerInterface){
        let node_cords: number[][] = []
        nodes.map((node)=>{
            node_cords.push([node.x, node.y])
        })

        ServerSocket.sendData(socket, response_types.HARVEST_COST_RESPONSE,
            {
                node_cords: node_cords,
                harvest_cost: harvest_cost,
            });
    }

    export function sendConqueredCity(socket: Socket, game: GameInterface, player: PlayerInterface, city: CityInterface, unit: UnitInterface){

        if(player.token === city.owner.token){
            if(!game.playerIsAlive(game.getEnemyPlayers(player.token)[0])){
                ServerSocket.sendData(socket, response_types.END_GAME_RESPONSE,
                    {
                        won: true
                    });
            }

            ServerSocket.sendData(socket, ServerSocket.response_types.CONQUERED_CITY_RESPONSE,
                {
                    city: city.getData(player.token),
                    unit: unit.getData()
                });

        }else{

            if(!game.playerIsAlive(player)){
                ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.END_GAME_RESPONSE,
                    {
                        won: false
                    });
            }

            ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.CONQUERED_CITY_RESPONSE,
                {
                    city: city.getData(player.token),
                    unit: unit.getData()
                });
        }
    }

    function isGameValid(socket: Socket, request_data: any): any{

        const game = MatchMaker.getGame(request_data.game_token);
        if (game == null) {
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Game doesn't exist", "Error couldn't find your game!");
            return null;
        }

        // check if player exists
        const player = game.getPlayer(request_data.player_token);
        if(player == null){
            ServerSocket.somethingWrongResponse(socket, request_data.player_token, "Player doesn't exist", "Error could find you!");
            return null;
        }

        return [game, player]


    }

    export function sendGameOver(socket: Socket, game: GameInterface, player_won: PlayerInterface, player_lost: PlayerInterface){
        ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.END_GAME_RESPONSE,
            {
                won: false
            });

        ServerSocket.sendData(socket, ServerSocket.response_types.END_GAME_RESPONSE,
            {
                won: true
            });
    }



    export function sendUnitAttack(socket: Socket, game: GameInterface, player: PlayerInterface, attacked_unit_id: string, unit_id: string, path: Path){
        const enemy_player = game.getEnemyPlayerByUnit(attacked_unit_id);

        if(enemy_player == null){

            ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_ATTACK_RESPONSE,{});
            return;
        }

        const friendly_unit = player.getUnit(unit_id);
        const enemy_unit = enemy_player.getUnit(attacked_unit_id)

        if(friendly_unit == null || enemy_unit == null){

            ServerSocket.sendData(socket, ServerSocket.response_types.INVALID_ATTACK_RESPONSE, {});
            return;
        }
        // attack path length is the request range of the attack


        const are_units_dead = player.attackUnit(friendly_unit, enemy_unit, enemy_player, game.map);
        const is_friendly_unit_dead = are_units_dead[0];
        const is_enemy_unit_dead = are_units_dead[1];

        if(!is_friendly_unit_dead && is_enemy_unit_dead){
            friendly_unit.moveAndSendResponse(path.path, game, player, socket);
        }

        // send to enemy
        ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.ATTACK_UNIT_RESPONSE,
            {
                unit_1: friendly_unit,
                is_unit_1_dead: is_friendly_unit_dead,
                unit_2: enemy_unit,
                is_unit_2_dead: is_enemy_unit_dead
            });

        // send to me
        ServerSocket.sendData(socket, ServerSocket.response_types.ATTACK_UNIT_RESPONSE,{
                unit_1: friendly_unit,
                is_unit_1_dead: is_friendly_unit_dead,
                unit_2: enemy_unit,
                is_unit_2_dead: is_enemy_unit_dead
            });


    }
}