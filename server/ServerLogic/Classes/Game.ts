import {Utils} from "./Utils";

import Map from "./Map/Map";
import City from "./City/City";

import GameInterface from "../Interfaces/GameInterface";
import PlayerInterface from "../Interfaces/PlayerInterface";
import NodeInterface from "../Interfaces/Map/NodeInterface";
import UnitInterface from "../Interfaces/Units/UnitInterface";
import Technology from "./Technology/Technology";
import CityInterface from "../Interfaces/City/CityInterface";
import MapInterface from "../Interfaces/Map/MapInterface";

class Game implements GameInterface {
    token: string;
    all_players: PlayerInterface[];
    all_cities: City[];
    map: Map;
    game_mode: string;

    constructor(token: string, number_of_land_nodes: number, number_of_continents: number, game_mode: string) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.game_mode = game_mode;

        this.map = new Map(number_of_land_nodes, number_of_continents);
        this.map.generateIslandMap();
    }

    startStarProduction() {
        this.all_players.map((player: PlayerInterface) => {
            player.produceStars();
        })
    }


    playerIsAlive(player: PlayerInterface): boolean {
        for (const city of this.all_cities) {
            if (city.owner.token === player.token) return true;
        }

        return false;
    }

    killPlayer(player: PlayerInterface): void {
        if(player == null) return;

        let remove_cities: CityInterface[] = []
        this.all_cities.map((city: CityInterface)=>{
            if (city.owner.token === player.token){
                remove_cities.push(city);
                this.map.all_nodes[city.y][city.x].city = null
            }
        });

        remove_cities.map((remove_city: CityInterface)=>{
            this.all_cities.splice(this.all_cities.indexOf(remove_city), 1)
        })

        this.all_players.splice(this.all_players.indexOf(player))
    }

    placeStartCity1v1(player: PlayerInterface, first_city: boolean){

        // returns true if successfully placed starting city
        function setCity(x: number, y: number, map: MapInterface, game: GameInterface): boolean{

            const starting_node: NodeInterface = map.all_nodes[x][y];

            if(!starting_node.isWater() && starting_node.city == null){
                game.addCity(player, starting_node);
                return true
            }

            return false
        }

        if(first_city) {
            for (let x = 0; x < this.map.all_nodes.length - 1; x++) {
                for (let y = 0; y < this.map.all_nodes.length - 1; y++) {
                    if(setCity(x, y, this.map, this)) return;
                }
            }
        }else {
            for (let x = this.map.all_nodes.length - 1; x >= 0; x--) {
                for (let y = this.map.all_nodes.length - 1; y >= 0; y--) {
                    if(setCity(x, y, this.map, this)) return;
                }
            }
        }
    }


    getPlayer(token: string): PlayerInterface | undefined {
        for (const player of this.all_players) {
            if (player.token === token) {
                return player;
            }
        }
    }

    getEnemyPlayers(player_token: string): PlayerInterface[] {
        return this.all_players.filter((player: PlayerInterface) => {
            return player.token != player_token;
        })
    }

    getEnemyPlayerByUnit(unit_id: string): PlayerInterface | undefined {
        for (const in_game_players of this.all_players) {
            for (const unit of in_game_players.units) {
                if (unit.id === unit_id) {
                    return in_game_players;
                }
            }
        }
    }

    getCitiesThatPlayerOwns(player: PlayerInterface): City[] {
        let cities = []
        for (const city of this.all_cities) {
            if (city.owner.token === player.token) {
                cities.push(city.getData(player.token));
            }
        }
        return cities;
    }

    getCity(city_name: string, city_owner: PlayerInterface): City | undefined {
        for (const city of this.all_cities) {
            if (city.name === city_name && city.owner.token === city_owner.token) {
                return city;
            }
        }
    }

    settle(player: PlayerInterface, city_node: NodeInterface | undefined, unit_id: string, map: Map): boolean {
        if (city_node == null) {
            return false;
        }

        // make sure the settler isn't on an invalid node type
        if (city_node.type == Utils.NODE_TYPES.LAKE || city_node.type == Utils.NODE_TYPES.OCEAN || city_node.city != null) {
            return false;
        }

        if (player.getUnitType(unit_id) != Utils.UNIT_TYPES.SETTLER) {
            return false
        }

        return player.removeUnit(unit_id, map);
    }

    // return boolean that indicates if the city placement was successful
    addCity(player: PlayerInterface, city_node: NodeInterface | undefined): void {
        if (city_node == null) {
            console.error("Error, city node was null");
            return
        }
        // create a new city for a player
        city_node.city = new City(player, city_node);
        city_node.is_harvested = true;

        city_node.type = null;
        city_node.sprite_name = "village.png";

        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.makeNeighbourNodesShown(player, node));
    }

    getVisibleUnits(player: PlayerInterface): UnitInterface[] {
        const player_from_game_object: PlayerInterface | undefined = this.getPlayer(player.token);
        if (player_from_game_object == null) {
            return [];
        }
        let output: UnitInterface[] = [];

        // check visible player for other players
        for (const player_ of this.all_players) {
            const raw_unit_data: UnitInterface[] = player_.getUnitData();
            for (const unit of raw_unit_data) {
                // check if unit is visible
                if (this.map.getNode(unit.x, unit.y)?.is_shown.includes(player.token)) {
                    output.push(unit);
                }
            }
        }

        return output;
    }

    purchaseTechnology(player_token: string, tech_name: string): boolean {
        const player = this.getPlayer(player_token);
        if (player == null) return false

        return Technology.purchase(player.root_tech_tree_node, tech_name, player);
    }

    getClosestCityDistance(node: NodeInterface): number {
        let min = Math.sqrt((this.all_cities[0].x - node.x) ** 2 + (this.all_cities[0].y - node.y) ** 2);
        for (let i = 1; i < this.all_cities.length; i++) {
            const dist = Math.sqrt((this.all_cities[i].x - node.x) ** 2 + (this.all_cities[i].y - node.y) ** 2)
            if (min > dist) {
                min = dist;
            }
        }

        return min;
    }

    getPlayerCities(player_token: string): City[] {
        let output_cities: City[] = [];
        this.all_cities.map((city: City) => {
            if (city.owner.token === player_token) output_cities.push(city);
        })

        return output_cities;
    }

    getData(player: PlayerInterface) {

        return {
            map: this.map.format(player.token),
            // @TODO is necessary?
            cities: this.getCitiesThatPlayerOwns(player),
            production_units: player.production_units,
            units: this.getVisibleUnits(player),
            root_tech_tree_node: player.root_tech_tree_node,
        }
    }
}

export default Game;