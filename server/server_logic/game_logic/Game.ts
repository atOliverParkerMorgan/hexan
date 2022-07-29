import Map from "./Map/Map";
import City from "./City";
import Player from "./Player"
import {Node} from "./Map/Node"

class Game{
    token: string;
    all_players: Player[];
    all_cities: City[];
    map: Map;
    constructor(token: string, number_of_land_nodes: number, number_of_continents: number) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.map = new Map(number_of_land_nodes, number_of_continents);
        this.map.generate_island_map();
    }
    place_start_city(player: Player): void{
        for (const continent of this.map.all_continents) {
            if(!continent.has_player){
                this.add_city(player, continent.get_random_river_node());
                continent.has_player = true;
                break;
            }
        }
    }

    get_player(token: string): Player | undefined{
        for (const player of this.all_players) {
            if(player.token === token){
                return player;
            }
        }
    }

    get_cities_that_player_owns(player: Player): City[]{
        let cities = []
        for(const city of this.all_cities){
            if(city.owner.token === player.token){
                cities.push(city);
            }
        }
        return cities;
    }
    get_city(city_name: string, city_owner: Player): City | undefined{
        for (const city of this.all_cities) {
            if(city.name === city_name && city.owner.token === city_owner.token){
                return city;
            }
        }
    }

    add_city(player: Player, city_node: Node): void{
        // create a new city for a player
        city_node.city = new City(player, city_node.x, city_node.y, "Prague");
        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.make_neighbour_nodes_shown(player, node));
    }

    get_data(player: Player){

        return {
            map: this.map.format(player.token),
            cities: this.get_cities_that_player_owns(player),
            units: this.get_player(player.token)?.get_unit_data()
        }
    }
}

export default Game;