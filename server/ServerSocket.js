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
        ALL_RESPONSE: "ALL_RESPONSE"
    },
    request_types: {
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
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
                        switch (request_type){
                            case ServerSocket.request_types.GET_UNITS:
                                socket.emit(player.token, {
                                    response_type: ServerSocket.response_types.UNITS_RESPONSE,
                                    data: {
                                        units: player.units
                                    },
                                });
                                break;
                            case ServerSocket.request_types.MOVE_UNIT:

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

    add_request_listener: ()=> {
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on("send-data", (...args) => {
                const request_type = args[0].request_type;
                const request_data = args[0].data;
                if (request_type === ServerSocket.request_types.PRODUCE_UNIT) {
                    const game = ServerSocket.get_game(request_data.game_token);
                    if (game != null) {
                        const player = game.get_player(request_data.player_token);
                        if (player != null) {
                            const city = game.get_city(request_data.city_name, player);
                            if (city != null) {
                                city.start_production(1000, socket);
                            }
                        }
                    }
                }
            });
        });
    },

    send_data(socket, response_type, data, player_token){
        socket.emit(player_token, {response_type, data});
    }
}

module.exports.ServerSocket = ServerSocket;