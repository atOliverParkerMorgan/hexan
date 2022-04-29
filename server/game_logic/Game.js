const Map = require("./Map");
const http = require("http");
const server = require("socket.io");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

let all_games = []
let is_listening = false;
class Game{
    constructor(token) {
        this.token = token;
        this.players = [];
        this.map =  new Map(2500, 4);
        this.map.generate_island_map();
    }
    place_start_city(player){
        for (const continent of this.map.all_continents) {

            if(!continent.has_player){
                continent.add_player_city(player);
                break;
            }
        }
    }

    connect_player(){
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on(this.token, (...args) => {
                console.log(args);
            });
        });
        if(!is_listening) {
            httpServer.listen(PORT_SOCKET);
            is_listening = true;
        }
    }

    send_player_map(player_token){
        io.on("connection", (socket) => {
            // send a message to the client
            socket.emit(player_token, this.map.format(player_token));
        });
    }

    get_player(player_token){
        for(const player of this.players){
            if(player.token === player_token) return player;
        }
        return null;
    }
}

module.exports.Game = Game;
module.exports.all_games = all_games;