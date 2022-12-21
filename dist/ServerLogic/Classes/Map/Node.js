"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ServerSocket_1 = require("../ServerSocket");
const City_1 = __importDefault(require("../City/City"));
const Utils_1 = require("../Utils");
// used for node.get_data()
class Node {
    constructor(x, y) {
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = Utils_1.Utils.OCEAN;
        this.borders = [];
        this.is_shown = [];
        this.production_stars = 1;
        this.harvest_cost = City_1.default.BASE_HARVEST_COST;
        this.is_harvested = false;
        this.city = null;
        this.unit = null;
        this.sprite_name = "";
        // used for A* searching algorithm
        this.parent = null;
    }
    addNeighbor(node) {
        this.neighbors.push(node);
    }
    getNeighborPosition(neighbor) {
        return this.neighbors.indexOf(neighbor);
    }
    createRiver(border_side_start, border_side_end, direction_of_search, add_neighbouring_tile) {
        let sides = [Utils_1.Utils.LEFT, Utils_1.Utils.TOP_LEFT, Utils_1.Utils.TOP_RIGHT, Utils_1.Utils.RIGHT, Utils_1.Utils.BOTTOM_RIGHT, Utils_1.Utils.BOTTOM_LEFT];
        let output_sides = [];
        let index = sides.indexOf(border_side_start);
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
    }
    getNeighborOppositePosition(neighbor) {
        switch (this.neighbors.indexOf(neighbor)) {
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
    /*
    * tries to get a random valid neighbour
    * if it succeeds it return the neighbour
    * if it fails it returns null
    */
    getRandomNeighbourInRange(min, max, type) {
        var _a;
        let random_neighbours = [];
        for (let i = min; i <= max; i++) {
            if (this.neighbors[i] != null) {
                if (((_a = this.neighbors[i]) === null || _a === void 0 ? void 0 : _a.type) === type) {
                    random_neighbours.push(this.neighbors[this.randomInt(min, max)]);
                }
            }
        }
        if (random_neighbours.length === 0)
            return undefined;
        return random_neighbours[this.randomInt(0, random_neighbours.length)];
    }
    getRandomNeighbour() {
        let random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour == null);
        return random_neighbour;
    }
    getRandomNeighbourOfType(type) {
        let water_neighbour_nodes = [];
        for (const node of this.neighbors) {
            if (node != null) {
                if (node.type === type) {
                    water_neighbour_nodes.push(node);
                }
            }
        }
        if (water_neighbour_nodes.length === 0)
            return null;
        return water_neighbour_nodes[Math.floor(Math.random() * water_neighbour_nodes.length)];
    }
    numberOfForestNeighbour() {
        let count = 0;
        for (const node_neighbour of this.neighbors) {
            if (node_neighbour != null) {
                if (node_neighbour.type === Utils_1.Utils.FOREST) {
                    count++;
                }
            }
        }
        return count;
    }
    isCoast() {
        if (this.type === Utils_1.Utils.OCEAN || this.type === Utils_1.Utils.LAKE)
            return false;
        for (const node_neighbour of this.neighbors) {
            if (node_neighbour != null) {
                if (node_neighbour.type === Utils_1.Utils.OCEAN || node_neighbour.type === Utils_1.Utils.LAKE) {
                    return true;
                }
            }
        }
        return false;
    }
    isRiver() {
        if (this.borders.length !== 0) {
            return true;
        }
        this.neighbors.map((neighbor) => {
            if (neighbor != null) {
                if (neighbor.borders.includes(this.getNeighborOppositePosition(neighbor))) {
                    return true;
                }
            }
        });
        return false;
    }
    // in order for a node to be a lake it must be surrounded by river boarders
    isLake() {
        for (let riverside = Utils_1.Utils.LEFT; riverside <= Utils_1.Utils.BOTTOM_RIGHT; riverside++) {
            if (!this.borders.includes(riverside)) {
                const neighbor = this.neighbors[riverside];
                if (neighbor == null)
                    return false;
                if (!neighbor.borders.includes(this.getNeighborOppositePosition(neighbor))) {
                    return false;
                }
            }
        }
        return true;
    }
    couldBeMountain() {
        return this.type === Utils_1.Utils.FOREST || this.type === Utils_1.Utils.GRASS;
    }
    // @TODO get rid of duplicate
    randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    getDistanceToNode(node) {
        return Math.sqrt(Math.pow((node.getXInPixels() - this.getXInPixels()), 2) + Math.pow((node.getYInPixels() - this.getYInPixels()), 2));
    }
    getXInPixels() {
        let row_bias = this.y % 2 === 0 ? Utils_1.Utils.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Utils_1.Utils.DISTANCE_BETWEEN_HEX + row_bias) - Utils_1.Utils.WORLD_WIDTH / 2;
    }
    getYInPixels() {
        return (this.y * 1.5 * Utils_1.Utils.HEX_SIDE_SIZE) - Utils_1.Utils.WORLD_HEIGHT / 2;
    }
    getXInUnits() {
        let row_bias = this.y % 2 === 0 ? 1 / 2 : 0;
        return (this.x + row_bias);
    }
    getYInUnits() {
        return (this.y * 1.5);
    }
    getHeuristicValue(player, start_node, goal_node) {
        const value = this.getDistanceToNode(start_node) + this.getDistanceToNode(goal_node);
        if (player != undefined) {
            if (!this.is_shown.includes(player.token))
                return value;
        }
        if (this.type === Utils_1.Utils.OCEAN)
            return value + 1000;
        if (this.type === Utils_1.Utils.MOUNTAIN)
            return value + Utils_1.Utils.MOUNTAIN_TRAVEL_BIAS;
        return value;
    }
    harvest(player, game, socket) {
        if (this.is_harvested)
            ServerSocket_1.ServerSocket.somethingWrongResponse(socket, player.token, 'CANNOT HARVEST', `You cannot harvest a already harvested node`);
        // check if node can be harvested
        let current_city;
        let cities = game.getPlayerCities(player.token);
        main_loop: for (const city of cities) {
            for (const can_be_harvested_node of city.can_be_harvested_nodes) {
                if (can_be_harvested_node.x === this.x && can_be_harvested_node.y === this.y) {
                    current_city = city;
                    break main_loop;
                }
            }
        }
        if (current_city == null) {
            ServerSocket_1.ServerSocket.somethingWrongResponse(socket, player.token, 'THIS NODE CANNOT BE HARVESTED', `A node must be next to a city or adjacent to two harvested node inorder to be harvested`);
            return;
        }
        if (player.isPaymentValid(this.harvest_cost)) {
            player.payStars(this.harvest_cost);
            player.increaseProduction(this.production_stars);
            this.is_harvested = true;
            current_city.addHarvestedNode(this);
            current_city.updateHarvestedNodes();
            ServerSocket_1.ServerSocket.sendUpdateHarvestCost(socket, current_city.can_be_harvested_nodes, current_city.getHarvestCost(), player);
            ServerSocket_1.ServerSocket.sendNodeHarvestedResponse(socket, this, player);
        }
        else {
            ServerSocket_1.ServerSocket.somethingWrongResponse(socket, player.token, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(player.total_owned_stars - this.harvest_cost))} to harvest this node`);
        }
    }
    isWater() {
        return this.type === Utils_1.Utils.LAKE || this.type === Utils_1.Utils.OCEAN;
    }
    getType() {
        switch (this.type) {
            case Utils_1.Utils.FOREST:
                return "GRASS";
            case Utils_1.Utils.GRASS:
                return "BEACH";
            case Utils_1.Utils.MOUNTAIN:
                return "MOUNTAIN";
            case Utils_1.Utils.OCEAN:
                return "WATER";
        }
        return "NOT FOUND";
    }
    getMovementTime() {
        switch (this.type) {
            case Utils_1.Utils.MOUNTAIN:
                return 4000;
            case Utils_1.Utils.FOREST:
                return 2000;
            case Utils_1.Utils.OCEAN:
                return 1000;
            case Utils_1.Utils.LAKE:
                return 1000;
        }
        // GRASS
        return 1000;
    }
    // simplify node for socket.emit()
    getData(player_token) {
        let type = this.type;
        let city_data = this.city != null ? this.city.getData(player_token) : null;
        let sprite_name = this.sprite_name;
        // hide the hidden node and cites
        if (!this.is_shown.includes(player_token)) {
            // type = Node.HIDDEN;
            sprite_name = "";
            city_data = null;
        }
        return {
            x: this.x,
            y: this.y,
            unit: this.unit,
            type: type,
            borders: this.borders,
            city_data: city_data,
            sprite_name: sprite_name,
            harvest_cost: this.harvest_cost,
            production_stars: this.production_stars,
            is_harvested: this.is_harvested
        };
    }
}
exports.default = Node;
