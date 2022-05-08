const Map = require("./Map/Map");
const http = require("http");
const server = require("socket.io");
const {all_cities, City} = require("./City");
const httpServer = http.createServer();
const io = server(httpServer);

const PORT_SOCKET = 8082;

const KNIGHT = 0;
const ARCHER = 1;

let all_games = [];

let is_listening = false;

class Game{
    constructor(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.current_city_index = 0;
        this.all_players = [];
        this.all_cities = [];
        this.map = new Map(number_of_land_nodes, number_of_continents);
        this.map.generate_island_map();
    }
    place_start_city(player){
        for (const continent of this.map.all_continents) {
            if(!continent.has_player){
                this.add_city(player, continent.get_random_river_node());
                continent.has_player = true;
                break;
            }
        }
    }

    connect_player(){
        io.on("connection", (socket) => {
            // receive a message from the client
            socket.on(this.token, (...args) => {
                const request_data = args[0];
                if(request_data.request_type === KNIGHT){
                    let player = this.get_player(request_data.token);
                    if(player == null) return;

                }
            });
        });
        if(!is_listening) {
            httpServer.listen(PORT_SOCKET);
            is_listening = true;
        }
    }

    send_player_map(player){
        io.on("connection", (socket) => {
            let cities = this.get_cities_that_player_owns(player);
            let city_cords = cities.length === 0 ? null:
                [cities[this.current_city_index].x, cities[this.current_city_index].y];

            socket.emit(player.token, {
                city_cords: city_cords,
                map: this.map.format(player.token)
            });
        });
    }
    get_player(token){
        for (const player of this.all_players) {
            if(player.token === token){
                return player;
            }
        }
        return null;
    }

    get_cities_that_player_owns(player){
        let cities = []
        for(const city of this.all_cities){
            if(city.owner.token === player.token){
                cities.push(city);
            }
        }
        return cities;
    }

    add_city(player, city_node){
        // create a new city for a player
        city_node.city = new City(player, city_node.x, city_node.y, player.current_city_id, "Prague");
        player.current_city_id++;
        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.make_neighbour_nodes_shown(player, node));
    }
}

module.exports.Game = Game;
module.exports.all_games = all_games;