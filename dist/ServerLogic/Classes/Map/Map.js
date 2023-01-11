"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Continent_1 = __importDefault(require("./Continent"));
const Node_1 = __importDefault(require("./Node"));
const Utils_1 = require("../Utils");
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
        this.createNodes();
    }
    createNodes() {
        for (let y = 0; y < this.side_length; y++) {
            let row = [];
            for (let x = 0; x < this.side_length; x++) {
                row.push(new Node_1.default(x, y));
            }
            this.all_nodes.push(row);
        }
        this.addNeighborsToNodes();
    }
    addNeighborsToNodes() {
        for (let y = 0; y < this.side_length; y++) {
            for (let x = 0; x < this.side_length; x++) {
                let node = this.getNode(x, y);
                if (node == null)
                    continue;
                // hex grid is unique in neighbour configuration
                // odd and  even rows have different neighbour cords
                // see https://www.redblobgames.com/grids/hexagons/
                // adding horizontal nodes
                // always the same neighbours
                // index in node.neighbor are always <0; 1>
                node.neighbors.push(this.getNode(x - 1, y)); // left
                node.neighbors.push(this.getNode(x + 1, y)); // right
                // adding vertical nodes
                // index in node.neighbor are always <2; 5>
                // even neighbour configuration
                if (node.y % 2 === 0) {
                    node.neighbors.push(this.getNode(x, y - 1)); // top left
                    node.neighbors.push(this.getNode(x + 1, y - 1)); // top right
                    node.neighbors.push(this.getNode(x, y + 1)); // bottom left
                    node.neighbors.push(this.getNode(x + 1, y + 1)); // bottom right
                }
                // odd neighbour configuration
                else {
                    node.neighbors.push(this.getNode(x - 1, y - 1)); // top left
                    node.neighbors.push(this.getNode(x, y - 1)); // top right
                    node.neighbors.push(this.getNode(x - 1, y + 1)); // bottom left
                    node.neighbors.push(this.getNode(x, y + 1)); // bottom right
                }
            }
        }
    }
    getNode(x, y) {
        if (y < 0 || x < 0 || y >= this.side_length || x >= this.side_length)
            return undefined;
        return this.all_nodes[y][x];
    }
    generateIslandMap() {
        for (let i = 0; i < this.number_of_continents; i++) {
            let random_x, random_y;
            // pick a random water node
            do {
                random_x = Utils_1.Utils.randomInt(0, this.side_length - 1);
                random_y = Utils_1.Utils.randomInt(0, this.side_length - 1);
            } while (this.all_nodes[random_y][random_x].type !== Utils_1.Utils.OCEAN);
            this.generateContinent(random_x, random_y, this.continent_size, this.shuffleArray(Map.CONTINENT_NAMES).shift());
        }
        for (const continent of this.all_continents) {
            for (const node of continent.all_nodes) {
                if (node == null)
                    continue;
                if (node.isCoast()) {
                    continent.beach_nodes.push(node);
                }
            }
            // generate rivers
            let number_of_rivers = Utils_1.Utils.randomInt(2, 4);
            for (let i = 0; i <= number_of_rivers; i++) {
                this.generateRiver(continent);
            }
            // generate lakes
            this.generateLakes(continent);
        }
    }
    generateContinent(seed_x, seed_y, continent_size, continent_name) {
        this.all_continents.push(new Continent_1.default(continent_name, this));
        // @TODO fix any type
        let current_continent = this.getContinent(continent_name);
        current_continent.addGrassNode(this.all_nodes[seed_y][seed_x]);
        for (let i = 0; i < continent_size;) {
            let random_continent_node = current_continent.getRandomNodeOfType(Utils_1.Utils.GRASS);
            if (random_continent_node == null)
                continue;
            let random_neighbour_node = random_continent_node.getRandomNeighbourOfType(Utils_1.Utils.OCEAN);
            if (random_neighbour_node == null) {
                current_continent.changeNodeTo(random_continent_node, Utils_1.Utils.FOREST);
            }
            else {
                current_continent.addGrassNode(random_neighbour_node);
                i++;
            }
        }
        // cleaning up scattered beach nodes
        for (const node of current_continent.grass_nodes) {
            if (!node.isCoast()) {
                current_continent.changeNodeTo(node, Utils_1.Utils.FOREST);
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
        let number_of_mountain_ranges = Utils_1.Utils.randomInt(1, max_mountains_ranges);
        for (let i = 0; i <= number_of_mountain_ranges; i++) {
            const mountain_type = Utils_1.Utils.randomInt(Utils_1.Utils.NORMAL_MOUNTAIN, Utils_1.Utils.SNOWY_MOUNTAIN);
            if (i === 0)
                this.generateMountains(seed_x, seed_y, number_of_mountain_ranges, current_continent, mountain_type);
            else {
                let random_grass_node = current_continent.getRandomNodeOfType(Utils_1.Utils.GRASS);
                this.generateMountains(random_grass_node.x, random_grass_node.y, Utils_1.Utils.randomInt(5, max_mountains), current_continent, mountain_type);
            }
        }
    }
    // mountain types: 1. normal; 2. snowy
    generateMountains(seed_x, seed_y, size, current_continent, mountain_type) {
        var _a;
        // 10 is straight; 1 is scattered
        const MOUNTAIN_RANGE_STRAIGHTNESS = 4;
        let mountain_range_orientation = Utils_1.Utils.randomInt(Utils_1.Utils.HORIZONTAL, Utils_1.Utils.VERTICAL);
        let current_node = this.getNode(seed_x, seed_y);
        if (current_node == undefined)
            return;
        current_continent.addMountainNode(current_node, mountain_type);
        // ensures that the algorithm doesn't get stuck in an infinite loop
        const max_number_of_loops = 18;
        let current_number_of_loops = 0;
        for (let i = 0; i < size;) {
            // the chances of the next mountain being aligned with the mountain range are 50%
            let mountain_noise = Utils_1.Utils.randomInt(0, 10);
            if (mountain_noise <= MOUNTAIN_RANGE_STRAIGHTNESS) {
                // generate a mountain that is aligned with the general direction of the mountain range
                let previous_node = current_node;
                // logic for mountain ranges that have a horizontal direction
                if (mountain_range_orientation === Utils_1.Utils.HORIZONTAL) {
                    let random_direction = Utils_1.Utils.randomInt(0, 1);
                    let opposite_direction = random_direction === 0 ? 1 : 0;
                    let random_neighbour = current_node.neighbors[random_direction];
                    let opposite_neighbour = current_node.neighbors[opposite_direction];
                    if (random_neighbour != null) {
                        if (random_neighbour.couldBeMountain()) {
                            current_node = random_neighbour;
                        }
                        else if (opposite_neighbour != null) {
                            if (opposite_neighbour.couldBeMountain()) {
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
                        if (opposite_neighbour.couldBeMountain()) {
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
                else if (mountain_range_orientation === Utils_1.Utils.VERTICAL) {
                    // random order of valid nodes
                    const random_valid_node_neighbours_indexes = this.shuffleArray([2, 3, 4, 5]);
                    let found_valid_node = false;
                    for (const random_index of random_valid_node_neighbours_indexes) {
                        let random_neighbor = current_node === null || current_node === void 0 ? void 0 : current_node.neighbors[random_index];
                        if (random_neighbor != null) {
                            if (random_neighbor.couldBeMountain()) {
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
                if (current_node.couldBeMountain()) {
                    current_continent.addMountainNode(current_node, mountain_type);
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
                let random_mountain_node = (_a = current_continent.getRandomNodeOfType(Utils_1.Utils.MOUNTAIN)) === null || _a === void 0 ? void 0 : _a.getRandomNeighbourInRange(2, 5, Utils_1.Utils.FOREST);
                if (random_mountain_node != null) {
                    current_continent.addMountainNode(random_mountain_node, mountain_type);
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
    generateRiver(continent) {
        let random_mountain_node = continent.getRandomNodeOfType(Utils_1.Utils.MOUNTAIN);
        let random_beach_node = continent.getRandomBeachNode();
        if (random_mountain_node == undefined || random_beach_node == undefined) {
            // there are no mountains or beaches on this continent therefore a river cannot be generated
            return;
        }
        let last_direction = null;
        // @TODO create path interface
        let river_path = this.aStar(random_mountain_node, random_beach_node);
        let current_side = Utils_1.Utils.randomInt(Utils_1.Utils.LEFT, Utils_1.Utils.BOTTOM_RIGHT);
        for (let i = 0; i < river_path.length; i++) {
            // random direction of river see Node.create_river()
            let direction = Utils_1.Utils.randomInt(0, 1) === 1 ? 1 : -1;
            let next_node = river_path[i + 1];
            let node = river_path[i];
            // make sure river threw ocean
            if (node.type === Utils_1.Utils.OCEAN)
                return;
            if (next_node == null) {
                next_node = node.getRandomNeighbour();
            }
            let neighbor = node.getNeighborPosition(next_node);
            // generate river path and add river path to node
            let river_nodes = node.createRiver(current_side, neighbor, direction, direction === last_direction);
            for (const b of river_nodes) {
                node.borders.push(b);
            }
            // if node is grass break
            if (node.type === Utils_1.Utils.GRASS)
                break;
            current_side = this.switchPosition(neighbor);
            last_direction = direction;
            // if(i === river_path.length - 1) //node.type = 1534541;
        }
        continent.addAllRiverNodes();
    }
    generateLakes(continent) {
        continent.river_nodes.map((node) => {
            if (node.isLake()) {
                continent.changeNodeTo(node, Utils_1.Utils.LAKE);
            }
        });
    }
    printPosition(pos) {
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
    switchPosition(pos) {
        switch (pos) {
            case Utils_1.Utils.LEFT:
                return Utils_1.Utils.RIGHT;
            case Utils_1.Utils.RIGHT:
                return Utils_1.Utils.LEFT;
            case Utils_1.Utils.TOP_LEFT:
                return Utils_1.Utils.BOTTOM_RIGHT;
            case Utils_1.Utils.TOP_RIGHT:
                return Utils_1.Utils.BOTTOM_LEFT;
            case Utils_1.Utils.BOTTOM_LEFT:
                return Utils_1.Utils.TOP_RIGHT;
            case Utils_1.Utils.BOTTOM_RIGHT:
                return Utils_1.Utils.TOP_LEFT;
        }
    }
    // get the shortest path between two nodes
    aStar(start_node, goal_node, player) {
        let open_set = [start_node];
        let closed_set = [];
        while (open_set.length > 0) {
            let current_node = open_set[0];
            let current_index = 0;
            for (let i = 0; i < open_set.length; i++) {
                if (open_set[i].getHeuristicValue(player, start_node, goal_node) < current_node.getHeuristicValue(player, start_node, goal_node)) {
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
                let distance_from_start = node.getDistanceToNode(start_node);
                let current_score = distance_from_start + current_node.getDistanceToNode(node);
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
                data.push(node.getData(player_token));
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
    getContinent(name) {
        for (const continent of this.all_continents) {
            if (continent.name === name)
                return continent;
        }
        return null;
    }
    makeNeighbourNodesShown(player, node) {
        if (node == null)
            return;
        node.is_shown.push(player.token);
        for (const neighbor of node.neighbors) {
            if (neighbor == null || neighbor.is_shown.includes(player.token))
                continue;
            neighbor.is_shown.push(player.token);
        }
    }
    getNumberOfHiddenNodes(player_token) {
        let counter = 0;
        for (const node_line of this.all_nodes) {
            for (const node of node_line) {
                if (!node.is_shown.includes(player_token)) {
                    counter++;
                }
            }
        }
        return counter;
    }
}
exports.default = Map;
Map.CONTINENT_NAMES = ["Drolend", "Dritune", "Figith", "Esox", "Okea", "Owrai", "Aneoqeon", "Vliutufor", "Strineaces", "Uaqixesh"];
