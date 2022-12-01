"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Map_1 = __importDefault(require("./Map"));
var Node = /** @class */ (function () {
    function Node(x, y) {
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = Node.WATER;
        this.borders = [];
        this.is_shown = [];
        this.city = null;
        // used for A* searching algorithm
        this.parent = null;
    }
    Node.prototype.add_neighbor = function (node) {
        this.neighbors.push(node);
    };
    Node.prototype.get_neighbor_position = function (neighbor) {
        return this.neighbors.indexOf(neighbor);
    };
    Node.prototype.create_river = function (border_side_start, border_side_end, direction_of_search, add_neighbouring_tile) {
        var sides = [Map_1.default.LEFT, Map_1.default.TOP_LEFT, Map_1.default.TOP_RIGHT, Map_1.default.RIGHT, Map_1.default.BOTTOM_RIGHT, Map_1.default.BOTTOM_LEFT];
        var output_sides = [];
        var index = sides.indexOf(border_side_start);
        if (add_neighbouring_tile) {
            index += direction_of_search;
            if (index === sides.length)
                index = 0;
            else if (index < 0)
                index = sides.length - 1;
        }
        while (sides[index] !== border_side_end) {
            output_sides.push(sides[index]);
            if (index === sides.length)
                index = -1;
            else if (index < 0)
                index = sides.length;
            index += direction_of_search;
        }
        return output_sides;
    };
    // get_random_valid_border_neighbor(border_position){
    //     if(border_position == null) return null;
    //     let neighboring_borders = this.get_border_neighbor_borders(border_position);
    //     let valid_borders = [];
    //     for(const border of neighboring_borders){
    //         if(!this.boarders.includes(border)){
    //             valid_borders.push(border);
    //         }
    //     }
    //     if(valid_borders.length === 0) return null;
    //     return valid_borders[this.random_int(0, valid_borders.length - 1)];
    //
    // }
    Node.prototype.get_neighbor_opposite_position = function (neighbor) {
        switch (this.neighbors.indexOf(neighbor)) {
            case Map_1.default.LEFT:
                return Map_1.default.RIGHT;
            case Map_1.default.RIGHT:
                return Map_1.default.LEFT;
            case Map_1.default.TOP_LEFT:
                return Map_1.default.BOTTOM_RIGHT;
            case Map_1.default.TOP_RIGHT:
                return Map_1.default.BOTTOM_LEFT;
            case Map_1.default.BOTTOM_LEFT:
                return Map_1.default.TOP_RIGHT;
            case Map_1.default.BOTTOM_RIGHT:
                return Map_1.default.TOP_LEFT;
        }
    };
    /*
    * tries to get a random valid neighbour
    * if it succeeds it return the neighbour
    * if it fails it returns null
    */
    Node.prototype.get_random_neighbour_in_range = function (min, max, type) {
        var random_neighbours = [];
        for (var i = min; i <= max; i++) {
            if (this.neighbors[i] != null) {
                if (this.neighbors[i].type === type) {
                    random_neighbours.push(this.neighbors[this.random_int(min, max)]);
                }
            }
        }
        if (random_neighbours.length === 0)
            return null;
        return random_neighbours[this.random_int(0, random_neighbours.length)];
    };
    Node.prototype.get_random_neighbour = function () {
        var random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour == null);
        return random_neighbour;
    };
    Node.prototype.get_random_neighbour_of_type = function (type) {
        var water_neighbour_nodes = [];
        for (var _i = 0, _a = this.neighbors; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node != null) {
                if (node.type === type) {
                    water_neighbour_nodes.push(node);
                }
            }
        }
        if (water_neighbour_nodes.length === 0)
            return null;
        return water_neighbour_nodes[Math.floor(Math.random() * water_neighbour_nodes.length)];
    };
    Node.prototype.is_coast = function () {
        for (var _i = 0, _a = this.neighbors; _i < _a.length; _i++) {
            var node_neighbour = _a[_i];
            if (node_neighbour != null) {
                if (node_neighbour.type === Node.WATER) {
                    return true;
                }
            }
        }
        return false;
    };
    Node.prototype.is_river = function () {
        if (this.borders.length !== 0) {
            return true;
        }
        for (var _i = 0, _a = this.neighbors; _i < _a.length; _i++) {
            var neighbor = _a[_i];
            if (neighbor == null)
                continue;
            if (neighbor.borders.includes(this.get_neighbor_opposite_position(neighbor))) {
                return true;
            }
        }
        return false;
    };
    Node.prototype.could_be_mountain = function () {
        return this.type === Node.GRASS || this.type === Node.BEACH;
    };
    // @TODO get rid of duplicate
    Node.prototype.random_int = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    Node.prototype.get_distance_to_node = function (node) {
        return Math.sqrt(Math.pow((node.get_x_in_pixels() - this.get_x_in_pixels()), 2) + Math.pow((node.get_y_in_pixels() - this.get_y_in_pixels()), 2));
    };
    Node.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? Map_1.default.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Map_1.default.DISTANCE_BETWEEN_HEX + row_bias) - Map_1.default.WORLD_WIDTH / 2;
    };
    Node.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * Node.HEX_SIDE_SIZE) - Map_1.default.WORLD_HEIGHT / 2;
    };
    Node.prototype.get_x_in_units = function () {
        var row_bias = this.y % 2 === 0 ? 1 / 2 : 0;
        return (this.x + row_bias);
    };
    Node.prototype.get_y_in_units = function () {
        return (this.y * 1.5);
    };
    Node.prototype.get_heuristic_value = function (player, start_node, goal_node) {
        var value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        if (player != undefined) {
            if (!this.is_shown.includes(player.token))
                return value;
        }
        if (this.type === Node.WATER)
            return value + 1000;
        if (this.type === Node.MOUNTAIN)
            return value + Node.MOUNTAIN_TRAVEL_BIAS;
        return value;
    };
    Node.prototype.get_type = function () {
        switch (this.type) {
            case Node.GRASS: return "GRASS";
            case Node.BEACH: return "BEACH";
            case Node.MOUNTAIN: return "MOUNTAIN";
            case Node.WATER: return "WATER";
        }
        return "NOT FOUND";
    };
    // simplify node for socket.emit()
    Node.prototype.get_data = function (player_token) {
        var type = this.type;
        if (!this.is_shown.includes(player_token)) {
            type = Node.HIDDEN;
        }
        return {
            x: this.x,
            y: this.y,
            type: type,
            borders: this.borders,
            city: this.city
        };
    };
    // constants
    Node.HEX_SIDE_SIZE = Math.pow(25000, .5);
    Node.MOUNTAIN_TRAVEL_BIAS = 10;
    Node.WATER = 0x80C5DE;
    Node.GRASS = 0x7FFF55;
    Node.BEACH = 0xFFFF00;
    Node.MOUNTAIN = 0xF2F2F2;
    Node.HIDDEN = 0xE0D257;
    return Node;
}());
exports.Node = Node;
// module.exports = Node;
