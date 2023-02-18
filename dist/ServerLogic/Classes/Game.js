"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
const Map_1 = __importDefault(require("./Map/Map"));
const City_1 = __importDefault(require("./City/City"));
const Technology_1 = __importDefault(require("./Technology/Technology"));
class Game {
    constructor(token, number_of_land_nodes, number_of_continents, game_mode) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.game_mode = game_mode;
        this.map = new Map_1.default(number_of_land_nodes, number_of_continents);
        this.map.generateIslandMap();
    }
    startStarProduction() {
        this.all_players.map((player) => {
            player.produceStars();
        });
    }
    playerIsAlive(player) {
        for (const city of this.all_cities) {
            if (city.owner.token === player.token)
                return true;
        }
        return false;
    }
    killPlayer(player) {
        if (player == null)
            return;
        let remove_cities = [];
        this.all_cities.map((city) => {
            if (city.owner.token === player.token) {
                remove_cities.push(city);
                this.map.all_nodes[city.y][city.x].city = null;
            }
        });
        remove_cities.map((remove_city) => {
            this.all_cities.splice(this.all_cities.indexOf(remove_city), 1);
        });
        this.all_players.splice(this.all_players.indexOf(player));
    }
    placeStartCity1v1(player, first_city) {
        let all_possible_city_nodes = [];
        // returns true if successfully placed starting city
        function setCity(x, y, map, game) {
            const starting_node = map.all_nodes[x][y];
            if (!starting_node.isWater() && starting_node.city == null) {
                all_possible_city_nodes.push(starting_node);
                // if x in 1/4 of the map
                if (first_city) {
                    if (all_possible_city_nodes.length != 0 && x >= map.all_nodes.length / 4) {
                        game.addCity(player, all_possible_city_nodes[Math.floor(Math.random() * all_possible_city_nodes.length)]);
                        return true;
                    }
                }
                else {
                    if (all_possible_city_nodes.length != 0 && x <= 3 * map.all_nodes.length / 4) {
                        game.addCity(player, all_possible_city_nodes[Math.floor(Math.random() * all_possible_city_nodes.length)]);
                        return true;
                    }
                }
            }
            return false;
        }
        if (first_city) {
            for (let x = 0; x < this.map.all_nodes.length - 1; x++) {
                for (let y = 0; y < this.map.all_nodes.length - 1; y++) {
                    if (setCity(x, y, this.map, this))
                        return;
                }
            }
        }
        else {
            for (let x = this.map.all_nodes.length - 1; x >= 0; x--) {
                for (let y = this.map.all_nodes.length - 1; y >= 0; y--) {
                    if (setCity(x, y, this.map, this))
                        return;
                }
            }
        }
    }
    getPlayer(token) {
        for (const player of this.all_players) {
            if (player.token === token) {
                return player;
            }
        }
    }
    getEnemyPlayers(player_token) {
        return this.all_players.filter((player) => {
            return player.token != player_token;
        });
    }
    getEnemyPlayerByUnit(unit_id) {
        for (const in_game_players of this.all_players) {
            for (const unit of in_game_players.units) {
                if (unit.id === unit_id) {
                    return in_game_players;
                }
            }
        }
    }
    getCitiesThatPlayerOwns(player) {
        let cities = [];
        for (const city of this.all_cities) {
            if (city.owner.token === player.token) {
                cities.push(city.getData(player.token));
            }
        }
        return cities;
    }
    getCity(city_name, city_owner) {
        for (const city of this.all_cities) {
            if (city.name === city_name && city.owner.token === city_owner.token) {
                return city;
            }
        }
    }
    settle(player, city_node, unit_id, map) {
        if (city_node == null) {
            return false;
        }
        // make sure the settler isn't on an invalid node type
        if (city_node.type == Utils_1.Utils.NODE_TYPES.LAKE || city_node.type == Utils_1.Utils.NODE_TYPES.OCEAN || city_node.city != null) {
            return false;
        }
        if (player.getUnitType(unit_id) != Utils_1.Utils.UNIT_TYPES.SETTLER) {
            return false;
        }
        return player.removeUnit(unit_id, map);
    }
    // return boolean that indicates if the city placement was successful
    addCity(player, city_node) {
        if (city_node == null) {
            console.error("Error, city node was null");
            return;
        }
        // create a new city for a player
        city_node.city = new City_1.default(player, city_node);
        city_node.is_harvested = true;
        city_node.type = null;
        city_node.sprite_name = "village.png";
        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach((node) => this.map.makeNeighbourNodesShown(player, node));
    }
    getVisibleUnits(player) {
        var _a;
        const player_from_game_object = this.getPlayer(player.token);
        if (player_from_game_object == null) {
            return [];
        }
        let output = [];
        // check visible player for other players
        for (const player_ of this.all_players) {
            const raw_unit_data = player_.getUnitData();
            for (const unit of raw_unit_data) {
                // check if unit is visible
                if ((_a = this.map.getNode(unit.x, unit.y)) === null || _a === void 0 ? void 0 : _a.is_shown.includes(player.token)) {
                    output.push(unit);
                }
            }
        }
        return output;
    }
    purchaseTechnology(player_token, tech_name) {
        const player = this.getPlayer(player_token);
        if (player == null)
            return false;
        return Technology_1.default.purchase(player.root_tech_tree_node, tech_name, player);
    }
    getClosestCityDistance(node) {
        let min = Math.sqrt(Math.pow((this.all_cities[0].x - node.x), 2) + Math.pow((this.all_cities[0].y - node.y), 2));
        for (let i = 1; i < this.all_cities.length; i++) {
            const dist = Math.sqrt(Math.pow((this.all_cities[i].x - node.x), 2) + Math.pow((this.all_cities[i].y - node.y), 2));
            if (min > dist) {
                min = dist;
            }
        }
        return min;
    }
    getPlayerCities(player_token) {
        let output_cities = [];
        this.all_cities.map((city) => {
            if (city.owner.token === player_token)
                output_cities.push(city);
        });
        return output_cities;
    }
    getData(player) {
        return {
            map: this.map.format(player.token),
            // @TODO is necessary?
            cities: this.getCitiesThatPlayerOwns(player),
            production_units: player.production_units,
            units: this.getVisibleUnits(player),
            root_tech_tree_node: player.root_tech_tree_node,
        };
    }
    getAIPLayer() {
        for (const player of this.all_players) {
            if (player.is_ai)
                return player;
        }
    }
}
exports.default = Game;
