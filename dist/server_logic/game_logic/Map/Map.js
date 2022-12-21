"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Continent_1 = __importDefault(require("./Continent"));
const Node_1 = require("./Node");
const Utils_1 = require("../../../Utils");
class Map {
    constructor(number_of_land_nodes, number_of_continents) {
        this.all_nodes = [];
        this.all_continents = [];
        this.all_beach_nodes = [];
        // number must be even for a symmetrical grid
        if (Math.pow(number_of_land_nodes, .5) % 1 !== 0)
            console.log("Warning, the square root of number of nodes should be a whole number ");
        this.number_of_land_nodes = number_of_land_nodes;
        this.continent_size = (number_of_land_nodes / number_of_continents);
        this.continent_size /= 3;
        this.side_length = Math.floor(Math.pow(number_of_land_nodes, .5));
        // cannot be bigger than the number of nodes
        if (number_of_land_nodes < number_of_continents)
            throw new Error("Error, there can't be more continents than land nodes");
        this.number_of_continents = number_of_continents;
        this.all_nodes = [];
        this.all_continents = [];
        this.create_nodes();
    }
    create_nodes() {
        for (let y = 0; y < this.side_length; y++) {
            let row = [];
            for (let x = 0; x < this.side_length; x++) {
                row.push(new Node_1.Node(x, y));
            }
            this.all_nodes.push(row);
        }
        this.add_neighbors_to_nodes();
    }
    add_neighbors_to_nodes() {
        for (let y = 0; y < this.side_length; y++) {
            for (let x = 0; x < this.side_length; x++) {
                let node = this.get_node(x, y);
                if (node == null)
                    continue;
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
    }
    get_node(x, y) {
        if (y < 0 || x < 0 || y >= this.side_length || x >= this.side_length)
            return undefined;
        return this.all_nodes[y][x];
    }
    get_node_(node) {
        return this.get_node(node.x, node.y);
    }
    generate_island_map() {
        for (let i = 0; i < this.number_of_continents; i++) {
            let random_x, random_y;
            // pick a random water node
            do {
                random_x = Utils_1.Utils.random_int(0, this.side_length - 1);
                random_y = Utils_1.Utils.random_int(0, this.side_length - 1);
            } while (this.all_nodes[random_y][random_x].type !== Node_1.Node.OCEAN);
            this.generate_continent(random_x, random_y, this.continent_size, this.shuffleArray(Map.CONTINENT_NAMES).shift());
        }
        for (const continent of this.all_continents) {
            for (const node of continent.all_nodes) {
                if (node == null)
                    continue;
                if (node.is_coast()) {
                    continent.beach_nodes.push(node);
                }
            }
            // generate rivers
            let number_of_rivers = Utils_1.Utils.random_int(2, 4);
            for (let i = 0; i <= number_of_rivers; i++) {
                this.generate_river(continent);
            }
            // generate lakes
            this.generate_lakes(continent);
        }
    }
    generate_continent(seed_x, seed_y, continent_size, continent_name) {
        this.all_continents.push(new Continent_1.default(continent_name, this));
        // @TODO fix any type
        let current_continent = this.get_continent(continent_name);
        current_continent.add_grass_node(this.all_nodes[seed_y][seed_x]);
        for (let i = 0; i < continent_size;) {
            let random_continent_node = current_continent.get_random_node_of_type(Node_1.Node.GRASS);
            if (random_continent_node == null)
                continue;
            let random_neighbour_node = random_continent_node.get_random_neighbour_of_type(Node_1.Node.OCEAN);
            if (random_neighbour_node == null) {
                current_continent.change_node_to(random_continent_node, Node_1.Node.FOREST);
            }
            else {
                current_continent.add_grass_node(random_neighbour_node);
                i++;
            }
        }
        // cleaning up scattered beach nodes
        for (const node of current_continent.grass_nodes) {
            if (!node.is_coast()) {
                current_continent.change_node_to(node, Node_1.Node.FOREST);
            }
        }
        // generate mountains
        // scale number in mountain ranges for map sizes
        let max_mountains = 15;
        let max_mountains_ranges = 4;
        switch (this.side_length) {
            case 400:
                max_mountains = 5;
                max_mountains_ranges = 2;
                break;
            case 900:
                max_mountains = 10;
                max_mountains_ranges = 3;
                break;
            case 2025:
                max_mountains = 24;
                max_mountains_ranges = 5;
                break;
            case 2500:
                max_mountains = 30;
                max_mountains_ranges = 7;
                break;
        }
        let number_of_mountain_ranges = Utils_1.Utils.random_int(1, max_mountains_ranges);
        for (let i = 0; i <= number_of_mountain_ranges; i++) {
            const mountain_type = Utils_1.Utils.random_int(Map.NORMAL_MOUNTAIN, Map.SNOWY_MOUNTAIN);
            if (i === 0)
                this.generate_mountains(seed_x, seed_y, number_of_mountain_ranges, current_continent, mountain_type);
            else {
                let random_grass_node = current_continent.get_random_node_of_type(Node_1.Node.GRASS);
                this.generate_mountains(random_grass_node.x, random_grass_node.y, Utils_1.Utils.random_int(5, max_mountains), current_continent, mountain_type);
            }
        }
    }
    // mountain types: 1. normal; 2. snowy
    generate_mountains(seed_x, seed_y, size, current_continent, mountain_type) {
        var _a;
        // 10 is straight; 1 is scattered
        const MOUNTAIN_RANGE_STRAIGHTNESS = 4;
        let mountain_range_orientation = Utils_1.Utils.random_int(Map.HORIZONTAL, Map.VERTICAL);
        let current_node = this.get_node(seed_x, seed_y);
        if (current_node == undefined)
            return;
        current_continent.add_mountain_node(current_node, mountain_type);
        // ensures that the algorithm doesn't get stuck in an infinite loop
        const max_number_of_loops = 18;
        let current_number_of_loops = 0;
        for (let i = 0; i < size;) {
            // the chances of the next mountain being aligned with the mountain range are 50%
            let mountain_noise = Utils_1.Utils.random_int(0, 10);
            if (mountain_noise <= MOUNTAIN_RANGE_STRAIGHTNESS) {
                // generate a mountain that is aligned with the general direction of the mountain range
                let previous_node = current_node;
                // logic for mountain ranges that have a horizontal direction
                if (mountain_range_orientation === Map.HORIZONTAL) {
                    let random_direction = Utils_1.Utils.random_int(0, 1);
                    let opposite_direction = random_direction === 0 ? 1 : 0;
                    let random_neighbour = current_node.neighbors[random_direction];
                    let opposite_neighbour = current_node.neighbors[opposite_direction];
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
                    const random_valid_node_neighbours_indexes = this.shuffleArray([2, 3, 4, 5]);
                    let found_valid_node = false;
                    for (const random_index of random_valid_node_neighbours_indexes) {
                        let random_neighbor = current_node === null || current_node === void 0 ? void 0 : current_node.neighbors[random_index];
                        if (random_neighbor != null) {
                            if (random_neighbor.could_be_mountain()) {
                                current_node = current_node === null || current_node === void 0 ? void 0 : current_node.neighbors[random_index];
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
                    current_continent.add_mountain_node(current_node, mountain_type);
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
                let random_mountain_node = (_a = current_continent.get_random_node_of_type(Node_1.Node.MOUNTAIN)) === null || _a === void 0 ? void 0 : _a.get_random_neighbour_in_range(2, 5, Node_1.Node.FOREST);
                if (random_mountain_node != null) {
                    current_continent.add_mountain_node(random_mountain_node, mountain_type);
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
    }
    // to generate river a continent must have mountains and beaches
    generate_river(continent) {
        let random_mountain_node = continent.get_random_node_of_type(Node_1.Node.MOUNTAIN);
        let random_beach_node = continent.get_random_beach_node();
        if (random_mountain_node == undefined || random_beach_node == undefined) {
            // there are no mountains or beaches on this continent therefore a river cannot be generated
            return;
        }
        let last_direction = null;
        // @TODO create path interface
        let river_path = this.a_star(random_mountain_node, random_beach_node);
        let current_side = Utils_1.Utils.random_int(Map.LEFT, Map.BOTTOM_RIGHT);
        for (let i = 0; i < river_path.length; i++) {
            // random direction of river see Node.create_river()
            let direction = Utils_1.Utils.random_int(0, 1) === 1 ? 1 : -1;
            let next_node = river_path[i + 1];
            let node = river_path[i];
            // make sure river threw ocean
            if (node.type === Node_1.Node.OCEAN)
                return;
            if (next_node == null) {
                next_node = node.get_random_neighbour();
            }
            let neighbor = node.get_neighbor_position(next_node);
            // generate river path and add river path to node
            let river_nodes = node.create_river(current_side, neighbor, direction, direction === last_direction);
            for (const b of river_nodes) {
                node.borders.push(b);
            }
            // if node is grass break
            if (node.type === Node_1.Node.GRASS)
                break;
            current_side = this.switch_position(neighbor);
            last_direction = direction;
            // if(i === river_path.length - 1) //node.type = 1534541;
        }
        continent.add_all_river_nodes();
    }
    generate_lakes(continent) {
        continent.river_nodes.map((node) => {
            if (node.is_lake()) {
                continent.change_node_to(node, Node_1.Node.LAKE);
            }
        });
    }
    print_position(pos) {
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
    }
    switch_position(pos) {
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
    }
    // get the shortest path between two nodes
    a_star(start_node, goal_node, player) {
        let open_set = [start_node];
        let closed_set = [];
        while (open_set.length > 0) {
            let current_node = open_set[0];
            let current_index = 0;
            for (let i = 0; i < open_set.length; i++) {
                if (open_set[i].get_heuristic_value(player, start_node, goal_node) < current_node.get_heuristic_value(player, start_node, goal_node)) {
                    current_node = open_set[i];
                    current_index = i;
                }
            }
            open_set.splice(current_index, 1);
            closed_set.push(current_node);
            if (current_node.x === goal_node.x && current_node.y === goal_node.y) {
                let solution_path = [current_node];
                while (solution_path[solution_path.length - 1] !== start_node) {
                    solution_path.push(solution_path[solution_path.length - 1].parent);
                }
                return solution_path.reverse();
            }
            for (const node of current_node.neighbors) {
                if (node == null)
                    continue;
                if (closed_set.includes(node)) {
                    continue;
                }
                let distance_from_start = node.get_distance_to_node(start_node);
                let current_score = distance_from_start + current_node.get_distance_to_node(node);
                let is_better = false;
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
    }
    format(player_token) {
        let data = [];
        for (let node_rows of this.all_nodes) {
            for (let node of node_rows) {
                data.push(node.get_data(player_token));
            }
        }
        return data;
    }
    // Randomize array in-place using Durstenfeld shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    get_continent(name) {
        for (const continent of this.all_continents) {
            if (continent.name === name)
                return continent;
        }
        return null;
    }
    make_neighbour_nodes_shown(player, node) {
        if (node == null)
            return;
        node.is_shown.push(player.token);
        for (const neighbor of node.neighbors) {
            if (neighbor == null || neighbor.is_shown.includes(player.token))
                continue;
            neighbor.is_shown.push(player.token);
        }
    }
}
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
Map.NORMAL_MOUNTAIN = 0;
Map.SNOWY_MOUNTAIN = 1;
Map.CONTINENT_NAMES = ["Drolend", "Dritune", "Figith", "Esox", "Okea", "Owrai", "Aneoqeon", "Vliutufor", "Strineaces", "Uaqixesh"];
exports.default = Map;
