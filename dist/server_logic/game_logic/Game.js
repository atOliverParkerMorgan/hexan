"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = __importDefault(require("./Map/Map"));
var City_1 = __importDefault(require("./City/City"));
var Node_1 = require("./Map/Node");
var Unit_1 = require("./Units/Unit");
var Technology_1 = require("./Technology/Technology");
var Game = /** @class */ (function () {
    function Game(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.map = new Map_1.default(number_of_land_nodes, number_of_continents);
        this.map.generate_island_map();
    }
    Game.prototype.start_star_production = function () {
        this.all_players.map(function (player) {
            player.produce_stars();
        });
    };
    Game.prototype.place_start_city = function (player) {
        for (var _i = 0, _a = this.map.all_continents; _i < _a.length; _i++) {
            var continent = _a[_i];
            if (!continent.has_player) {
                var starting_node = continent.get_random_river_node();
                while (starting_node === undefined)
                    starting_node = continent.get_random_river_node();
                this.add_city(player, starting_node);
                continent.has_player = true;
                break;
            }
        }
    };
    Game.prototype.get_player = function (token) {
        for (var _i = 0, _a = this.all_players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.token === token) {
                return player;
            }
        }
    };
    Game.prototype.get_enemy_players = function (token) {
        return this.all_players.filter(function (player) {
            return player.token != token;
        });
    };
    Game.prototype.get_enemy_player_by_unit = function (unit_id) {
        for (var _i = 0, _a = this.all_players; _i < _a.length; _i++) {
            var in_game_players = _a[_i];
            for (var _b = 0, _c = in_game_players.units; _b < _c.length; _b++) {
                var unit = _c[_b];
                if (unit.id === unit_id) {
                    return in_game_players;
                }
            }
        }
    };
    Game.prototype.get_cities_that_player_owns = function (player) {
        var cities = [];
        for (var _i = 0, _a = this.all_cities; _i < _a.length; _i++) {
            var city = _a[_i];
            if (city.owner.token === player.token) {
                cities.push(city.get_data(player.token));
            }
        }
        return cities;
    };
    Game.prototype.get_city = function (city_name, city_owner) {
        for (var _i = 0, _a = this.all_cities; _i < _a.length; _i++) {
            var city = _a[_i];
            if (city.name === city_name && city.owner.token === city_owner.token) {
                return city;
            }
        }
    };
    Game.prototype.can_settle = function (player, city_node, unit_id) {
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
    };
    // return boolean that indicates if the city placement was successful
    Game.prototype.add_city = function (player, city_node) {
        var _this = this;
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
        city_node.neighbors.forEach(function (node) { return _this.map.make_neighbour_nodes_shown(player, node); });
    };
    Game.prototype.get_visible_units = function (player) {
        var _a;
        var player_from_game_object = this.get_player(player.token);
        if (player_from_game_object == null) {
            return [];
        }
        var output = [];
        // check visible player for other players
        for (var _i = 0, _b = this.all_players; _i < _b.length; _i++) {
            var player_ = _b[_i];
            var raw_unit_data = player_.get_unit_data();
            for (var _c = 0, raw_unit_data_1 = raw_unit_data; _c < raw_unit_data_1.length; _c++) {
                var unit = raw_unit_data_1[_c];
                // check if unit is visible
                if ((_a = this.map.get_node(unit.x, unit.y)) === null || _a === void 0 ? void 0 : _a.is_shown.includes(player.token)) {
                    output.push(unit);
                }
            }
        }
        return output;
    };
    Game.prototype.purchase_technology = function (player_token, tech_name) {
        var player = this.get_player(player_token);
        if (player == null)
            return false;
        return Technology_1.Technology.purchase(player.root_tech_tree_node, tech_name, player);
    };
    Game.prototype.get_closest_city_distance = function (node) {
        var min = Math.sqrt(Math.pow((this.all_cities[0].x - node.x), 2) + Math.pow((this.all_cities[0].y - node.y), 2));
        for (var i = 1; i < this.all_cities.length; i++) {
            var dist = Math.sqrt(Math.pow((this.all_cities[i].x - node.x), 2) + Math.pow((this.all_cities[i].y - node.y), 2));
            if (min > dist) {
                min = dist;
            }
        }
        return min;
    };
    Game.prototype.get_player_cities = function (player_token) {
        var output_cities = [];
        this.all_cities.map(function (city) {
            if (city.owner.token === player_token)
                output_cities.push(city);
        });
        return output_cities;
    };
    Game.prototype.get_data = function (player) {
        return {
            map: this.map.format(player.token),
            // @TODO is necessary?
            cities: this.get_cities_that_player_owns(player),
            production_units: player.production_units,
            units: this.get_visible_units(player),
            root_tech_tree_node: player.root_tech_tree_node,
        };
    };
    return Game;
}());
exports.default = Game;
