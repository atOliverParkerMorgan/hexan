"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Map_1 = __importDefault(require("./Map/Map"));
const City_1 = __importDefault(require("./City/City"));
const Node_1 = require("./Map/Node");
const Unit_1 = require("./Units/Unit");
const Technology_1 = require("./Technology/Technology");
class Game {
    constructor(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.map = new Map_1.default(number_of_land_nodes, number_of_continents);
        this.map.generate_island_map();
    }
    start_star_production() {
        this.all_players.map((player) => {
            player.produce_stars();
        });
    }
    is_game_ready() {
        for (const player of this.all_players) {
            if (!player.is_ready)
                return false;
        }
        return true;
    }
    player_is_alive(player) {
        for (const city of this.all_cities) {
            if (city.owner.token === player.token)
                return true;
        }
        return false;
    }
    place_start_city(player) {
        for (const continent of this.map.all_continents) {
            if (!continent.has_player) {
                let starting_node = continent.get_random_river_node();
                while (starting_node === undefined)
                    starting_node = continent.get_random_river_node();
                this.add_city(player, starting_node);
                continent.has_player = true;
                break;
            }
        }
    }
    get_player(token) {
        for (const player of this.all_players) {
            if (player.token === token) {
                return player;
            }
        }
    }
    get_enemy_players(token) {
        return this.all_players.filter((player) => {
            return player.token != token;
        });
    }
    get_enemy_player_by_unit(unit_id) {
        for (const in_game_players of this.all_players) {
            for (const unit of in_game_players.units) {
                if (unit.id === unit_id) {
                    return in_game_players;
                }
            }
        }
    }
    get_cities_that_player_owns(player) {
        let cities = [];
        for (const city of this.all_cities) {
            if (city.owner.token === player.token) {
                cities.push(city.get_data(player.token));
            }
        }
        return cities;
    }
    get_city(city_name, city_owner) {
        for (const city of this.all_cities) {
            if (city.name === city_name && city.owner.token === city_owner.token) {
                return city;
            }
        }
    }
    can_settle(player, city_node, unit_id) {
        if (city_node == null) {
            return false;
        }
        // make sure the settler isn't on an invalid node type
        if (city_node.type == Node_1.Node.LAKE || city_node.type == Node_1.Node.OCEAN || city_node.city != null) {
            return false;
        }
        if (player.get_unit_type(unit_id) != Unit_1.Unit.SETTLER) {
            return false;
        }
        return player.remove_unit(unit_id);
    }
    // return boolean that indicates if the city placement was successful
    add_city(player, city_node) {
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
        city_node.neighbors.forEach((node) => this.map.make_neighbour_nodes_shown(player, node));
    }
    get_visible_units(player) {
        var _a;
        const player_from_game_object = this.get_player(player.token);
        if (player_from_game_object == null) {
            return [];
        }
        let output = [];
        // check visible player for other players
        for (const player_ of this.all_players) {
            const raw_unit_data = player_.get_unit_data();
            for (const unit of raw_unit_data) {
                // check if unit is visible
                if ((_a = this.map.get_node(unit.x, unit.y)) === null || _a === void 0 ? void 0 : _a.is_shown.includes(player.token)) {
                    output.push(unit);
                }
            }
        }
        return output;
    }
    purchase_technology(player_token, tech_name) {
        const player = this.get_player(player_token);
        if (player == null)
            return false;
        return Technology_1.Technology.purchase(player.root_tech_tree_node, tech_name, player);
    }
    get_closest_city_distance(node) {
        let min = Math.sqrt(Math.pow((this.all_cities[0].x - node.x), 2) + Math.pow((this.all_cities[0].y - node.y), 2));
        for (let i = 1; i < this.all_cities.length; i++) {
            const dist = Math.sqrt(Math.pow((this.all_cities[i].x - node.x), 2) + Math.pow((this.all_cities[i].y - node.y), 2));
            if (min > dist) {
                min = dist;
            }
        }
        return min;
    }
    get_player_cities(player_token) {
        let output_cities = [];
        this.all_cities.map((city) => {
            if (city.owner.token === player_token)
                output_cities.push(city);
        });
        return output_cities;
    }
    get_data(player) {
        return {
            map: this.map.format(player.token),
            // @TODO is necessary?
            cities: this.get_cities_that_player_owns(player),
            production_units: player.production_units,
            units: this.get_visible_units(player),
            root_tech_tree_node: player.root_tech_tree_node,
        };
    }
}
exports.default = Game;
