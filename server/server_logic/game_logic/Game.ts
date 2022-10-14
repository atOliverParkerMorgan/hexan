import Map from "./Map/Map";
import City from "./City/City";
import Player from "./Player";
import {Node} from "./Map/Node";
import {Unit} from "./Units/Unit";
import {CityInterface} from "./City/CityInterface";

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

    start_star_production(){
        this.all_players.map((player: Player)=>{
            player.produce_stars();
        })
    }


    place_start_city(player: Player): void{
        for (const continent of this.map.all_continents) {
            if(!continent.has_player){
                this.add_city(player, continent.get_random_river_node(), );
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

    get_enemy_players(token: string): Player[]{
        return this.all_players.filter((player: Player) => {
            return player.token != token;
        })
    }

    get_enemy_player_by_unit(unit_id: string): Player | undefined{
        for (const in_game_players of this.all_players) {
            for (const unit of in_game_players.units) {
                if(unit.id === unit_id){
                    return in_game_players;
                }
            }
        }
    }

    get_cities_that_player_owns(player: Player): CityInterface[]{
        let cities = []
        for(const city of this.all_cities){
            if(city.owner.token === player.token){
                cities.push(city.get_data(player.token));
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

    can_settle(player: Player, city_node: Node | undefined, unit_id: string): boolean{
        if(city_node == null){
            return false;
        }

        // make sure the settler isn't on an invalid node type
        if(city_node.type == Node.LAKE || city_node.type == Node.OCEAN || city_node.city != null){
            return false;
        }

        if(player.get_unit_type(unit_id) != Unit.SETTLER){
            return false
        }

        return player.remove_unit(unit_id);
    }

    // return boolean that indicates if the city placement was successful
    add_city(player: Player, city_node: Node | undefined): void{
        if(city_node == null){
             return
        }
        // create a new city for a player
        city_node.city = new City(player, city_node.x, city_node.y);
        city_node.type = null;
        city_node.sprite_name = "village.png";

        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.make_neighbour_nodes_shown(player, node));
    }

    get_visible_units(player: Player): Unit[]{
        const player_from_game_object: Player | undefined = this.get_player(player.token);
        if(player_from_game_object == null){
            return [];
        }
        let output: Unit[] = [];

        // check visible player for other players
        for(const player_ of this.all_players){
            const raw_unit_data: Unit[] = player_.get_unit_data();
            for(const unit of raw_unit_data){
                // check if unit is visible
                if(this.map.get_node(unit.x, unit.y)?.is_shown.includes(player.token)){
                    output.push(unit);
                }
            }
        }

        return output;
    }


    get_data(player: Player){

        return {
            map: this.map.format(player.token),
            // @TODO is necessary?
            cities: this.get_cities_that_player_owns(player),
            player: player.get_data(),
            units: this.get_visible_units(player)
        }
    }
}

export default Game;