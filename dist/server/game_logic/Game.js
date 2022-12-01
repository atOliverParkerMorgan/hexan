"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Map_1 = __importDefault(require("./Map/Map"));
var City_1 = __importDefault(require("./City"));
var Game = /** @class */ (function () {
    function Game(token, number_of_land_nodes, number_of_continents) {
        this.token = token;
        this.all_players = [];
        this.all_cities = [];
        this.map = new Map_1.default(number_of_land_nodes, number_of_continents);
        this.map.generate_island_map();
    }
    Game.prototype.place_start_city = function (player) {
        for (var _i = 0, _a = this.map.all_continents; _i < _a.length; _i++) {
            var continent = _a[_i];
            if (!continent.has_player) {
                this.add_city(player, continent.get_random_river_node());
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
    Game.prototype.get_cities_that_player_owns = function (player) {
        var cities = [];
        for (var _i = 0, _a = this.all_cities; _i < _a.length; _i++) {
            var city = _a[_i];
            if (city.owner.token === player.token) {
                cities.push(city);
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
    Game.prototype.add_city = function (player, city_node) {
        var _this = this;
        // create a new city for a player
        city_node.city = new City_1.default(player, city_node.x, city_node.y, "Prague");
        this.all_cities.push(city_node.city);
        city_node.neighbors.forEach(function (node) { return _this.map.make_neighbour_nodes_shown(player, node); });
    };
    Game.prototype.get_data = function (player) {
        var _a;
        return {
            map: this.map.format(player.token),
            cities: this.get_cities_that_player_owns(player),
            units: (_a = this.get_player(player.token)) === null || _a === void 0 ? void 0 : _a.get_unit_data()
        };
    };
    return Game;
}());
exports.default = Game;
