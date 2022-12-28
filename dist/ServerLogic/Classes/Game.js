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
    constructor(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
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
    placeStartCity(player) {
        let found = false;
        for (const continent of this.map.all_continents) {
            if (!continent.has_player) {
                let starting_node;
                if (continent.river_nodes.length > 0) {
                    starting_node = continent.getRandomRiverNode();
                }
                else if (continent.beach_nodes.length > 0) {
                    starting_node = continent.getRandomBeachNode();
                }
                else if (continent.grass_nodes.length > 0) {
                    starting_node = continent.getRandomNodeOfType(Utils_1.Utils.GRASS);
                }
                else if (continent.mountain_nodes.length > 0) {
                    starting_node = continent.getRandomNodeOfType(Utils_1.Utils.MOUNTAIN);
                }
                else {
                    continue;
                }
                this.addCity(player, starting_node);
                continent.has_player = true;
                found = true;
                break;
            }
        }
        // if all continents are used up choose a random node on a already used continent
        if (!found) {
            for (const continent of this.map.all_continents) {
                let starting_node = continent.getRandomNode();
                let i = 0;
                while (starting_node == null || starting_node.city != null) {
                    starting_node = continent.getRandomNode();
                    i++;
                    if (continent.all_nodes.length < i) {
                        break;
                    }
                }
                if (starting_node == null) {
                    continue;
                }
                this.addCity(player, starting_node);
                continent.has_player = true;
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
    canSettle(player, city_node, unit_id) {
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
        return player.removeUnit(unit_id);
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
}
exports.default = Game;
