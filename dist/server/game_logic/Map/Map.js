"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Continent_1 = __importDefault(require("./Continent"));
var Node_1 = require("./Node");
var Map = /** @class */ (function () {
    function Map(number_of_land_nodes, number_of_continents) {
        // number must be even for a symmetrical grid
        if (Math.pow(number_of_land_nodes, .5) % 1 !== 0)
            console.log("Warning, the square root of number of nodes should be a whole number ");
        this.number_of_land_nodes = number_of_land_nodes;
        this.continent_size = (number_of_land_nodes / number_of_continents);
        this.continent_size /= this.random_int(2, 4);
        this.side_length = Math.floor(Math.pow(number_of_land_nodes, .5));
        // cannot be bigger than the number of nodes
        if (number_of_land_nodes < number_of_continents)
            throw new Error("Error, there can't be more continents than land nodes");
        this.number_of_continents = number_of_continents;
        this.all_nodes = [];
        this.all_continents = [];
    }
    Map.prototype.create_nodes = function () {
        for (var y = 0; y < this.side_length; y++) {
            var row = [];
            for (var x = 0; x < this.side_length; x++) {
                row.push(new Node_1.Node(x, y));
            }
            this.all_nodes.push(row);
        }
        this.add_neighbors_to_nodes();
    };
    Map.prototype.add_neighbors_to_nodes = function () {
        for (var y = 0; y < this.side_length; y++) {
            for (var x = 0; x < this.side_length; x++) {
                var node = this.get_node(x, y);
                // hex grid is unique in neighbour configuration
                // odd and  even rows have different neighbour cords
                // see https://www.redblobgames.com/grids/hexagons/
                // adding horizontal nodes
                // always the same neighbours
                // index in node.neighbor are always <0; 1>
                node.neighbors.push(this.get_node(x - 1, y)); // left
                node.neighbors.push(this.get_node(x + 1, y)); // right
                // adding vertical nodes
                // index in node.neighbor are always <2; 5>
                // even neighbour configuration
                if (node.y % 2 === 0) {
                    node.neighbors.push(this.get_node(x, y - 1)); // top left
                    node.neighbors.push(this.get_node(x + 1, y - 1)); // top right
                    node.neighbors.push(this.get_node(x, y + 1)); // bottom left
                    node.neighbors.push(this.get_node(x + 1, y + 1)); // bottom right
                }
                // odd neighbour configuration
                else {
                    node.neighbors.push(this.get_node(x - 1, y - 1)); // top left
                    node.neighbors.push(this.get_node(x, y - 1)); // top right
                    node.neighbors.push(this.get_node(x - 1, y + 1)); // bottom left
                    node.neighbors.push(this.get_node(x, y + 1)); // bottom right
                }
            }
        }
    };
    Map.prototype.get_node = function (x, y) {
        return this.all_nodes[y][x];
    };
    Map.prototype.get_node_ = function (node) {
        return this.get_node(node.x, node.y);
    };
    Map.prototype.generate_island_map = function () {
        this.create_nodes();
        for (var i = 0; i < this.number_of_continents; i++) {
            var random_x = void 0, random_y = void 0;
            // pick a random water node
            do {
                random_x = this.random_int(0, this.side_length - 1);
                random_y = this.random_int(0, this.side_length - 1);
            } while (this.all_nodes[random_y][random_x].type !== Node_1.Node.WATER);
            this.generate_continent(random_x, random_y, this.continent_size, this.shuffleArray(Map.CONTINENT_NAMES).shift());
        }
        for (var _i = 0, _a = this.all_continents; _i < _a.length; _i++) {
            var continent = _a[_i];
            for (var _b = 0, _c = continent.all_nodes; _b < _c.length; _b++) {
                var node = _c[_b];
                if (!node.is_coast() && node.type === Node_1.Node.BEACH) {
                    continent.change_node_to(node, Node_1.Node.GRASS);
                }
            }
        }
    };
    Map.prototype.generate_continent = function (seed_x, seed_y, continent_size, continent_name) {
        this.all_continents.push(new Continent_1.default(continent_name, this));
        // @TODO fix any type
        var current_continent = this.get_continent(continent_name);
        current_continent.add_beach_node(this.all_nodes[seed_y][seed_x]);
        for (var i = 0; i < continent_size;) {
            var random_continent_node = current_continent.get_random_node_of_type(Node_1.Node.BEACH);
            if (random_continent_node == null)
                continue;
            var random_neighbour_node = random_continent_node.get_random_neighbour_of_type(Node_1.Node.WATER);
            if (random_neighbour_node == null) {
                current_continent.change_node_to(random_continent_node, Node_1.Node.GRASS);
            }
            else {
                current_continent.add_beach_node(random_neighbour_node);
                i++;
            }
        }
        // cleaning up scattered beach nodes
        for (var _i = 0, _a = current_continent.beach_nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (!node.is_coast()) {
                current_continent.change_node_to(node, Node_1.Node.GRASS);
            }
        }
        // generate mountains
        var number_of_mountain_ranges = this.random_int(3, 5);
        for (var i = 0; i <= number_of_mountain_ranges; i++) {
            if (i === 0)
                this.generate_mountains(seed_x, seed_y, number_of_mountain_ranges, current_continent);
            else {
                var random_grass_node = current_continent.get_random_node_of_type(Node_1.Node.GRASS);
                this.generate_mountains(random_grass_node.x, random_grass_node.y, this.random_int(5, 15), current_continent);
            }
            // console.log("Generating mountains: "+ (i) + " of "+number_of_mountain_ranges)
        }
        // generate rivers
        var number_of_rivers = this.random_int(2, 4);
        for (var i = 0; i <= number_of_rivers; i++) {
            this.generate_river(current_continent);
        }
        // generating lakes
        for (var _b = 0, _c = current_continent.all_nodes; _b < _c.length; _b++) {
            var node = _c[_b];
            if (node.borders.length === 6) {
                current_continent.change_node_to(node, Node_1.Node.WATER);
            }
        }
    };
    Map.prototype.generate_mountains = function (seed_x, seed_y, size, current_continent) {
        var _a;
        // 10 is straight; 1 is scattered
        var MOUNTAIN_RANGE_STRAIGHTNESS = 4;
        var mountain_range_orientation = this.random_int(Map.HORIZONTAL, Map.VERTICAL);
        var current_node = this.get_node(seed_x, seed_y);
        current_continent.add_mountain_node(current_node);
        // ensures that the algorithm doesn't get stuck in a infinite loop
        var max_number_of_loops = 18;
        var current_number_of_loops = 0;
        for (var i = 0; i < size;) {
            // the chances of the next mountain being aligned with the mountain range are 50%
            var mountain_noise = this.random_int(0, 10);
            if (mountain_noise <= MOUNTAIN_RANGE_STRAIGHTNESS) {
                // generate a mountain that is aligned with the general direction of the mountain range
                var previous_node = current_node;
                // logic for mountain ranges that have a horizontal direction
                if (mountain_range_orientation === Map.HORIZONTAL) {
                    var random_direction = this.random_int(0, 1);
                    var opposite_direction = random_direction === 0 ? 1 : 0;
                    var random_neighbour = current_node.neighbors[random_direction];
                    var opposite_neighbour = current_node.neighbors[opposite_direction];
                    if (random_neighbour != null) {
                        if (random_neighbour.could_be_mountain()) {
                            current_node = random_neighbour;
                        }
                        else if (opposite_neighbour != null) {
                            if (opposite_neighbour.could_be_mountain()) {
                                current_node = opposite_neighbour;
                            }
                        }
                        else {
                            current_number_of_loops++;
                            if (current_number_of_loops >= max_number_of_loops)
                                break;
                            continue;
                        }
                    }
                    else if (opposite_neighbour != null) {
                        if (opposite_neighbour.could_be_mountain()) {
                            current_node = opposite_neighbour;
                        }
                    }
                    else {
                        // make sure the loop breaks if there are no valid nodes
                        current_number_of_loops++;
                        if (current_number_of_loops >= max_number_of_loops)
                            break;
                        continue;
                    }
                }
                // logic for mountain range that's direction is vertical
                else if (mountain_range_orientation === Map.VERTICAL) {
                    // random order of valid nodes
                    var random_valid_node_neighbours_indexes = this.shuffleArray([2, 3, 4, 5]);
                    var found_valid_node = false;
                    for (var _i = 0, random_valid_node_neighbours_indexes_1 = random_valid_node_neighbours_indexes; _i < random_valid_node_neighbours_indexes_1.length; _i++) {
                        var random_index = random_valid_node_neighbours_indexes_1[_i];
                        var random_neighbor = current_node.neighbors[random_index];
                        if (random_neighbor != null) {
                            if (random_neighbor.could_be_mountain()) {
                                current_node = current_node.neighbors[random_index];
                                found_valid_node = true;
                            }
                        }
                    }
                    if (!found_valid_node) {
                        current_node = previous_node;
                        // make sure the loop breaks if there are no valid nodes
                        current_number_of_loops++;
                        if (current_number_of_loops >= max_number_of_loops)
                            break;
                        continue;
                    }
                }
                if (current_node == null) {
                    current_node = previous_node;
                    // make sure the loop breaks if there are no valid nodes
                    current_number_of_loops++;
                    if (current_number_of_loops >= max_number_of_loops)
                        break;
                    continue;
                }
                if (current_node.could_be_mountain()) {
                    current_continent.add_mountain_node(current_node);
                    i++;
                    current_number_of_loops = 0;
                }
                else {
                    current_node = previous_node;
                }
            }
            else {
                // get a node that isn't aligned with the mountain range
                // checkout @ this.add_neighbours_to_nodes() to understand grid arrangement
                var random_mountain_node = (_a = current_continent.get_random_node_of_type(Node_1.Node.MOUNTAIN)) === null || _a === void 0 ? void 0 : _a.get_random_neighbour_in_range(2, 5, Node_1.Node.GRASS);
                if (random_mountain_node != null) {
                    current_continent.add_mountain_node(random_mountain_node);
                    i++;
                    current_number_of_loops = 0;
                }
                else {
                    // make sure the loop breaks if there are no valid nodes
                    current_number_of_loops++;
                    if (current_number_of_loops >= max_number_of_loops)
                        break;
                }
            }
        }
    };
    // to generate river a continent must have mountains and beaches
    Map.prototype.generate_river = function (continent) {
        var random_mountain_node = continent.get_random_node_of_type(Node_1.Node.MOUNTAIN);
        var random_beach_node = continent.get_random_node_of_type(Node_1.Node.BEACH);
        if (random_mountain_node == undefined || random_beach_node == undefined) {
            // there are no mountains or beaches on this continent therefore a river cannot be generated
            return;
        }
        var last_direction = null;
        // @TODO create path interface
        var river_path = this.a_star(random_mountain_node, random_beach_node);
        var current_side = this.random_int(Map.LEFT, Map.BOTTOM_RIGHT);
        for (var i = 0; i < river_path.length; i++) {
            // random direction of river see Node.create_river()
            var direction = this.random_int(0, 1) === 1 ? 1 : -1;
            var next_node = river_path[i + 1];
            var node = river_path[i];
            if (next_node == null) {
                next_node = node.get_random_neighbour();
            }
            var neighbor = node.get_neighbor_position(next_node);
            // generate river path and add river path to node
            var river_nodes = node.create_river(current_side, neighbor, direction, direction === last_direction);
            for (var _i = 0, river_nodes_1 = river_nodes; _i < river_nodes_1.length; _i++) {
                var b = river_nodes_1[_i];
                node.borders.push(b);
            }
            // if node is beach break
            if (node.type === Node_1.Node.BEACH)
                break;
            current_side = this.switch_position(neighbor);
            last_direction = direction;
            // if(i === river_path.length - 1) //node.type = 1534541;
        }
    };
    Map.prototype.print_position = function (pos) {
        switch (pos) {
            case 0:
                return "LEFT";
            case 1:
                return "RIGHT";
            case 2:
                return "TOP LEFT";
            case 3:
                return "TOP RIGHT";
            case 4:
                return "BOTTOM LEFT";
            case 5:
                return "BOTTOM RIGHT";
        }
    };
    Map.prototype.switch_position = function (pos) {
        switch (pos) {
            case Map.LEFT:
                return Map.RIGHT;
            case Map.RIGHT:
                return Map.LEFT;
            case Map.TOP_LEFT:
                return Map.BOTTOM_RIGHT;
            case Map.TOP_RIGHT:
                return Map.BOTTOM_LEFT;
            case Map.BOTTOM_LEFT:
                return Map.TOP_RIGHT;
            case Map.BOTTOM_RIGHT:
                return Map.TOP_LEFT;
        }
    };
    // get the shortest path between two nodes
    Map.prototype.a_star = function (start_node, goal_node, player) {
        var open_set = [start_node];
        var closed_set = [];
        while (open_set.length > 0) {
            var current_node = open_set[0];
            var current_index = 0;
            for (var i = 0; i < open_set.length; i++) {
                if (open_set[i].get_heuristic_value(player, start_node, goal_node) < current_node.get_heuristic_value(player, start_node, goal_node)) {
                    current_node = open_set[i];
                    current_index = i;
                }
            }
            open_set.splice(current_index, 1);
            closed_set.push(current_node);
            if (current_node.x === goal_node.x && current_node.y === goal_node.y) {
                var solution_path = [current_node];
                while (solution_path[solution_path.length - 1] !== start_node) {
                    solution_path.push(solution_path[solution_path.length - 1].parent);
                }
                return solution_path.reverse();
            }
            for (var _i = 0, _a = current_node.neighbors; _i < _a.length; _i++) {
                var node = _a[_i];
                if (closed_set.includes(node) || node == null) {
                    continue;
                }
                var distance_from_start = node.get_distance_to_node(start_node);
                var current_score = distance_from_start + current_node.get_distance_to_node(node);
                var is_better = false;
                if (!open_set.includes(node)) {
                    open_set.push(node);
                    is_better = true;
                }
                else if (current_score < distance_from_start) {
                    is_better = true;
                }
                if (is_better) {
                    node.parent = current_node;
                }
            }
        }
        return null;
    };
    Map.prototype.for_each_node = function (fun) {
        for (var _i = 0, _a = this.all_nodes; _i < _a.length; _i++) {
            var node_rows = _a[_i];
            for (var _b = 0, node_rows_1 = node_rows; _b < node_rows_1.length; _b++) {
                var node = node_rows_1[_b];
                fun(node);
            }
        }
    };
    // @TODO type for data
    Map.prototype.format = function (player_token) {
        var data = [];
        for (var _i = 0, _a = this.all_nodes; _i < _a.length; _i++) {
            var node_rows = _a[_i];
            for (var _b = 0, node_rows_2 = node_rows; _b < node_rows_2.length; _b++) {
                var node = node_rows_2[_b];
                data.push(node.get_data(player_token));
            }
        }
        return data;
    };
    // range: <min; max>
    // @ TODO add unit functions
    Map.prototype.random_int = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // Randomize array in-place using Durstenfeld shuffle algorithm
    Map.prototype.shuffleArray = function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    };
    Map.prototype.get_continent = function (name) {
        for (var _i = 0, _a = this.all_continents; _i < _a.length; _i++) {
            var continent = _a[_i];
            if (continent.name === name)
                return continent;
        }
        return null;
    };
    Map.prototype.make_neighbour_nodes_shown = function (player, node) {
        if (node == null)
            return;
        node.is_shown.push(player.token);
        for (var _i = 0, _a = node.neighbors; _i < _a.length; _i++) {
            var neighbor = _a[_i];
            if (neighbor == null || neighbor.is_shown.includes(player.token))
                continue;
            neighbor.is_shown.push(player.token);
        }
    };
    Map.DISTANCE_BETWEEN_HEX = 2 * Math.pow((Math.pow(Node_1.Node.HEX_SIDE_SIZE, 2) - Math.pow((Node_1.Node.HEX_SIDE_SIZE / 2), 2)), .5);
    Map.WORLD_WIDTH = Map.DISTANCE_BETWEEN_HEX * Node_1.Node.HEX_SIDE_SIZE;
    Map.WORLD_HEIGHT = Node_1.Node.HEX_SIDE_SIZE * 1.5 * Node_1.Node.HEX_SIDE_SIZE;
    // borders see @Map.add_neighbors_to_nodes()
    Map.LEFT = 0;
    Map.RIGHT = 1;
    Map.TOP_LEFT = 2;
    Map.TOP_RIGHT = 3;
    Map.BOTTOM_LEFT = 4;
    Map.BOTTOM_RIGHT = 5;
    Map.HORIZONTAL = 0;
    Map.VERTICAL = 1;
    Map.CONTINENT_NAMES = ["Drolend", "Dritune", "Figith", "Esox", "Okea", "Owrai", "Aneoqeon", "Vliutufor", "Strineaces", "Uaqixesh"];
    return Map;
}());
exports.default = Map;
