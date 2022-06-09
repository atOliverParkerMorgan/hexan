const server = require("socket.io");
const http = require("http");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

// singleton
const ServerSocket = {
    all_games: [],
    is_listening: false,

    response_types: {
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        INVALID_MOVE: "INVALID_MOVE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE"
    },
    request_types: {
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNIT: "MOVE_UNIT"
    },

    init:()=> {
        if (!ServerSocket.is_listening) {
            httpServer.listen(PORT_SOCKET);
            ServerSocket.is_listening = true;
        }
    },

    get_game: (game_token)=> {
        for (const game of ServerSocket.all_games) {
            console.log("GAME TOKEN: ", game.token);
            if (game.token === game_token) {
                return game;
            }
        }
    },

    // acts as a getter - sends responses to clients requests. Doesn't change the state of the game.
    add_response_listener: () => {
        io.on("connection", (socket) => {
            socket.on("get-data", (...args) => {

                const request_type = args[0].request_type;
                const request_data = args[0].data;

                const game = ServerSocket.get_game(request_data.game_token);

                if (game != null) {
                    const player = game.get_player(request_data.player_token);
                    console.log(player);
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
                                        city: request_city
                                    },
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
    },

    // acts as a setter - changes game_state according to clients request and game rules.
    add_request_listener: ()=> {
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on("send-data", (...args) => {
                const request_type = args[0].request_type;
                const request_data = args[0].data;
                const game = ServerSocket.get_game(request_data.game_token);
                if (game != null) {
                    const player = game.get_player(request_data.player_token);
                    if (player != null) {
                        // switch for different request types
                        switch (request_type){
                            case ServerSocket.request_types.PRODUCE_UNIT:
                                const city = game.get_city(request_data.city_name, player);
                                if (city != null) {
                                    city.start_production(1000, socket);
                                }
                                break;

                            case ServerSocket.request_types.MOVE_UNIT:
                                // console.log("MOVE_UNIT")
                                // console.log(request_data.units)
                                for(const id of request_data.unit_ids){
                                    const unit = player.get_unit(id)
                                    if(unit == null) continue;
                                    unit.move_and_send_response(request_data.to_x, request_data.to_y, game, player, socket);
                                }
                                break;

                        }
                    }
                }
            });
        });
    },

    send_data(socket, data, player_token){
        socket.emit(player_token, data);
    }
}

module.exports.ServerSocket = ServerSocket;