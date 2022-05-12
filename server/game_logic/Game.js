const Map = require("./Map/Map");
const {City} = require("./City");

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
    get_city(city_name, city_owner){
        for (const city of this.all_cities) {
            if(city.name === city_name && city.owner.token === city_owner.token){
                return city;
            }
        }
    }

    add_city(player, city_node){
        // create a new city for a player
        city_node.city = new City(player, city_node.x, city_node.y, "Prague");
        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.make_neighbour_nodes_shown(player, node));
    }

    get_data(player){
        return {
            map: this.map.format(player.token),
            cities: this.get_cities_that_player_owns(player),
            units: this.get_player(player.token).units
        }
    }
}

module.exports.Game = Game;
