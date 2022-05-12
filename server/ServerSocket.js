const server = require("socket.io");
const http = require("http");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

const KNIGHT = 0;
const ARCHER = 1;

// singleton
const ServerSocket = {
    all_games: [],
    is_listening: false,

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
                const request_data = args[0];
                console.log(request_data);
                const game = ServerSocket.get_game(request_data.game_token);
                console.log(game);
                if (game != null) {
                    const player = game.get_player(request_data.player_token);
                    console.log(player);
                    if (player != null) socket.emit(player.token, game.get_data(player));
                }
            });
        });
    },

    add_request_listener: ()=> {
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on("send-data", (...args) => {
                const request_data = args[0];
                if (request_data.request_type === KNIGHT) {
                    const game = ServerSocket.get_game(request_data.game_token);
                    if (game != null) {
                        const player = game.get_player(request_data.player_token);
                        if (player != null) {
                            const city = game.get_city(request_data.city_name, player);
                            if (city != null) {
                                city.start_production(5000);
                            }
                        }
                    }
                }
            });
        });
    }
}

module.exports.ServerSocket = ServerSocket;