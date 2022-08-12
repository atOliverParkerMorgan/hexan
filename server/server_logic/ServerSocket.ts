import { createServer } from 'http';
import { Server, Socket } from "socket.io";
import Game from "./game_logic/Game";
import Path from "./game_logic/Map/Path.js";
import {MatchMaker} from "./MatchMaker";
import Player from "./game_logic/Player";
import City from "./game_logic/City";

const httpServer = createServer();
const io = new Server(httpServer);

// singleton
export namespace ServerSocket {
    export const PORT_SOCKET: number = 3000;
    export let is_listening: boolean =  false;

    export const response_types: { ALL_RESPONSE: string; MAP_RESPONSE: string; UNIT_MOVED_RESPONSE: string;
        INVALID_MOVE: string; UNITS_RESPONSE: string; ENEMY_UNIT_MOVED_RESPONSE: string, ENEMY_UNIT_DISAPPEARED: string, MENU_INFO_RESPONSE: string } =  {

        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        INVALID_MOVE: "INVALID_MOVE"

    };
    export const request_types: {readonly GET_MAP: string, readonly GET_UNITS: string,
                                          readonly GET_ALL: string, readonly GET_MENU_INFO: string,
                                          readonly PRODUCE_UNIT: string, readonly MOVE_UNITS: string,
                                          readonly FIND_1v1_OPPONENT: string, readonly FIND_2v2_OPPONENTS: string} = {

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

    export function init(): void {
            if (!ServerSocket.is_listening) {
                httpServer.listen(PORT_SOCKET);
                ServerSocket.is_listening = true;
            }
    }

    export function send_data(socket: Socket, data: any, player_token: string): void{
        socket.emit(player_token, data);
    }

    export function send_data_to_all(socket: Socket, data: any, player_token: string, game_token: string): void{
        socket.broadcast.emit(player_token, data);
    }

    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    export function add_response_listener(): void{
        io.on("connection", (socket: Socket) => {
            socket.on("get_data", (...args: any[]) => {
                // get request data from public
                const request_type = args[0].request_type;
                const request_data = args[0].data;

                console.log(`got some data player_token: ${request_data.player_token}`)

                const game = MatchMaker.get_1v1_game(request_data.game_token);
                if (game != null) {
                    const player = game.get_player(request_data.player_token);
                    if (player != null){
                        // switch for different responses
                        switch (request_type){

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
                                let request_city;
                                for(const city of game.get_cities_that_player_owns(player)){
                                    if(city.name === request_data.city.name){
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

    // acts as a setter - changes game_state according to clients request and game rules.
    export function add_request_listener(game_token: string): void{
        io.on("connection", (socket: Socket) => {
            // receive a message from the public
            socket.on("send-data", (...args: any[]) => {
                const request_type: string = args[0].request_type;
                const request_data = args[0].data;
                const game = MatchMaker.get_1v1_game(request_data.game_token);
                if (game != null) {
                    const player = game.get_player(request_data.player_token);
                    if (player != null) {
                        // switch for different request types
                        switch (request_type){
                            case ServerSocket.request_types.PRODUCE_UNIT:
                                const city = game.get_city(request_data.city_name, player);
                                const unit_type = request_data.unit_type;
                                if (city != null) {
                                    city.start_production(1000, socket, unit_type);
                                }
                                break;

                            case ServerSocket.request_types.MOVE_UNITS:

                                const unit = player.get_unit(request_data.unit_id);
                                const path = new Path(game, request_data.path);

                                if(!path.is_valid() || unit == null){
                                    ServerSocket.send_data(socket, {
                                        response_type: ServerSocket.response_types.INVALID_MOVE,
                                        data: {
                                            unit: unit
                                        }
                                    }, player.token);

                                    break;
                                }
                                unit.move_and_send_response(path.path, game, player, socket);

                                break;
                        }
                    }
                }
            });
        });
    }
}