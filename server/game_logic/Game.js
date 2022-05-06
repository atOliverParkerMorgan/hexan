const Map = require("./Map/Map");
const http = require("http");
const server = require("socket.io");
const {all_cities} = require("./City");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

let all_games = [];

let is_listening = false;

class Game{
    constructor(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.current_city_index = 0;
        this.players = [];
        this.map = new Map(number_of_land_nodes, number_of_continents);
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
                if(args[0][0].request === "production"){

                }
            });
        });
        if(!is_listening) {
            httpServer.listen(PORT_SOCKET);
            is_listening = true;
        }
    }

    send_player_map(player_token){
        io.on("connection", (socket) => {
            let cities = this.get_cities_that_player_owns(player_token);
            let city_cords = cities.length === 0 ? null:
                [cities[this.current_city_index].x, cities[this.current_city_index].y];

            socket.emit(player_token, {
                city_cords: city_cords,
                map: this.map.format(player_token)
            });
        });
    }

    get_player(player_token){
        for(const player of this.players){
            if(player.token === player_token) return player;
        }
        return null;
    }

    get_cities_that_player_owns(player_token){
        let cities = []
        for(const city of all_cities){
            if(city.owner.token === player_token){
                cities.push(city);
            }
        }

        return cities;
    }
}

module.exports.Game = Game;
module.exports.all_games = all_games;