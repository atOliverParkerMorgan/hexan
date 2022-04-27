const Map = require("./Map");
const http = require("http");
const server = require("socket.io");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

let all_games = []

class Game{
    constructor(token) {
        this.token = token;
        this.players = [];
        this.map =  new Map(2500, 4);
        this.map.generate_island_map();
    }
    connect_player(){
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on(this.token, (...args) => {
                console.log(args);
            });
        });
        httpServer.listen(PORT_SOCKET);
    }

    send_player_map(player_token){
        io.on("connection", (socket) => {
            // send a message to the client
            socket.emit(player_token, this.map.format());
        });
    }

    get_player(player_token){
        for(const player of this.players){
            if(player.token === player) return player;
        }
        return null;
    }
}

module.exports.Game = Game;
module.exports.all_games = all_games;