import {ServerSocket} from "../ServerSocket";
import City from "../City/City";

import NodeInterface from "../../Interfaces/Map/NodeInterface";
import CityInterface from "../../Interfaces/City/CityInterface";
import UnitInterface from "../../Interfaces/Units/UnitInterface";
import PlayerInterface from "../../Interfaces/PlayerInterface";
import GameInterface from "../../Interfaces/GameInterface";
import {Utils} from "../Utils";


export default class Node implements NodeInterface {

    neighbors: (NodeInterface | undefined)[];
    x: number;
    y: number;
    type: number | null;
    borders: any;

    // stars that this node can produce per a minute
    production_stars: number;
    harvest_cost: number;
    is_harvested: boolean;

    // ids for player who seen this node
    is_shown: string[]
    city: CityInterface | null;
    unit: UnitInterface | null;
    parent: Node | null;

    sprite_name: string;

    constructor(x: number, y: number){
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = Utils.OCEAN;
        this.borders = [];
        this.is_shown = [];

        this.production_stars = 1;
        this.harvest_cost = City.BASE_HARVEST_COST;
        this.is_harvested = false;

        this.city = null;
        this.unit = null;
        this.sprite_name = "";

        // used for A* searching algorithm
        this.parent = null;
    }

    addNeighbor(node: NodeInterface): void {
        this.neighbors.push(node);
    }

    getNeighborPosition(neighbor: Node): number {
        return this.neighbors.indexOf(neighbor);
    }

    createRiver(border_side_start: number, border_side_end: number, direction_of_search: number, add_neighbouring_tile: boolean) {
        let sides = [Utils.LEFT, Utils.TOP_LEFT, Utils.TOP_RIGHT, Utils.RIGHT, Utils.BOTTOM_RIGHT, Utils.BOTTOM_LEFT];
        let output_sides = [];
        let index = sides.indexOf(border_side_start);

        if (add_neighbouring_tile) {
            index += direction_of_search;
            if (index === sides.length) index = 0;
            else if (index < 0) index = sides.length - 1;
        }

        while (sides[index] !== border_side_end) {
            output_sides.push(sides[index]);
            if (index === sides.length) index = -1;
            else if (index < 0) index = sides.length;
            index += direction_of_search;
        }

        return output_sides;
    }

    getNeighborOppositePosition(neighbor: NodeInterface): number | undefined {
        switch (this.neighbors.indexOf(neighbor)) {
            case Utils.LEFT:
                return Utils.RIGHT;
            case Utils.RIGHT:
                return Utils.LEFT;
            case Utils.TOP_LEFT:
                return Utils.BOTTOM_RIGHT;
            case Utils.TOP_RIGHT:
                return Utils.BOTTOM_LEFT;
            case Utils.BOTTOM_LEFT:
                return Utils.TOP_RIGHT;
            case Utils.BOTTOM_RIGHT:
                return Utils.TOP_LEFT;
        }
    }

    /*
    * tries to get a random valid neighbour
    * if it succeeds it return the neighbour
    * if it fails it returns null
    */
    getRandomNeighbourInRange(min: number, max: number, type: number): NodeInterface | undefined {

        let random_neighbours = [];
        for (let i = min; i <= max; i++) {
            if (this.neighbors[i] != null) {
                if (this.neighbors[i]?.type === type) {
                    random_neighbours.push(this.neighbors[this.randomInt(min, max)]);
                }
            }
        }
        if (random_neighbours.length === 0) return undefined;
        return random_neighbours[this.randomInt(0, random_neighbours.length)];
    }

    getRandomNeighbour(): NodeInterface {
        let random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour == null);

        return random_neighbour;
    }

    getRandomNeighbourOfType(type: number): NodeInterface | null {
        let water_neighbour_nodes: NodeInterface[] = []

        for (const node of this.neighbors) {
            if (node != null) {
                if (node.type === type) {
                    water_neighbour_nodes.push(node);
                }
            }
        }
        if (water_neighbour_nodes.length === 0) return null;
        return water_neighbour_nodes[Math.floor(Math.random() * water_neighbour_nodes.length)];
    }

    numberOfForestNeighbour(): number {
        let count = 0;
        for (const node_neighbour of this.neighbors) {
            if (node_neighbour != null) {
                if (node_neighbour.type === Utils.FOREST) {
                    count++;
                }
            }
        }
        return count;
    }

    isCoast(): boolean {
        if (this.type === Utils.OCEAN || this.type === Utils.LAKE) return false;

        for (const node_neighbour of this.neighbors) {
            if (node_neighbour != null) {
                if (node_neighbour.type === Utils.OCEAN || node_neighbour.type === Utils.LAKE) {
                    return true;
                }
            }
        }
        return false;
    }

    isRiver(): boolean {
        if (this.borders.length !== 0) {
            return true;
        }
        this.neighbors.map((neighbor: NodeInterface | undefined) => {
            if (neighbor != null) {
                if (neighbor.borders.includes(this.getNeighborOppositePosition(neighbor))) {
                    return true;
                }
            }
        });
        return false;
    }

    // in order for a node to be a lake it must be surrounded by river boarders
    isLake(): boolean {
        for (let riverside = Utils.LEFT; riverside <= Utils.BOTTOM_RIGHT; riverside++) {
            if (!this.borders.includes(riverside)) {

                const neighbor = this.neighbors[riverside];
                if (neighbor == null) return false;

                if (!neighbor.borders.includes(this.getNeighborOppositePosition(neighbor))) {
                    return false
                }
            }
        }

        return true;
    }

    couldBeMountain(): boolean {
        return this.type === Utils.FOREST || this.type === Utils.GRASS;
    }

    // @TODO get rid of duplicate
    randomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getDistanceToNode(node: Node): number {
        return Math.sqrt((node.getXInPixels() - this.getXInPixels()) ** 2 + (node.getYInPixels() - this.getYInPixels()) ** 2);
    }

    getXInPixels(): number {
        let row_bias = this.y % 2 === 0 ? Utils.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Utils.DISTANCE_BETWEEN_HEX + row_bias) - Utils.WORLD_WIDTH / 2;
    }

    getYInPixels(): number {
        return (this.y * 1.5 * Utils.HEX_SIDE_SIZE) - Utils.WORLD_HEIGHT / 2;
    }

    getXInUnits(): number {
        let row_bias = this.y % 2 === 0 ? 1 / 2 : 0;
        return (this.x + row_bias);
    }

    getYInUnits(): number {
        return (this.y * 1.5);
    }

    getHeuristicValue(player: PlayerInterface | undefined, start_node: Node, goal_node: Node) {
        const value = this.getDistanceToNode(start_node) + this.getDistanceToNode(goal_node);
        if (player != undefined) {
            if (!this.is_shown.includes(player.token)) return value;
        }
        if (this.type === Utils.OCEAN) return value + 1000;
        if (this.type === Utils.MOUNTAIN) return value + Utils.MOUNTAIN_TRAVEL_BIAS;
        return value;
    }

    harvest(player: PlayerInterface, game: GameInterface, socket: any) {
        if (this.is_harvested) ServerSocket.somethingWrongResponse(socket, player.token, 'CANNOT HARVEST', `You cannot harvest a already harvested node`);

        // check if node can be harvested
        let current_city;
        let cities = game.getPlayerCities(player.token)

        main_loop:
            for (const city of cities) {
                for (const can_be_harvested_node of city.can_be_harvested_nodes) {
                    if (can_be_harvested_node.x === this.x && can_be_harvested_node.y === this.y) {
                        current_city = city
                        break main_loop;
                    }
                }
            }

        if (current_city == null) {
            ServerSocket.somethingWrongResponse(socket, player.token, 'THIS NODE CANNOT BE HARVESTED', `A node must be next to a city or adjacent to two harvested node inorder to be harvested`);
            return;
        }

        if (player.isPaymentValid(this.harvest_cost)) {
            player.payStars(this.harvest_cost);

            // increase production with technologies
            let production_stars = this.production_stars;
            if(this.type === Utils.MOUNTAIN){
                production_stars += player.mountain_harvest;
            }else if(this.type === Utils.FOREST){
                production_stars += player.forest_harvest;
            }

            player.increaseProduction(production_stars);

            this.is_harvested = true;

            current_city.addHarvestedNode(this)
            current_city.updateHarvestedNodes();
            ServerSocket.sendUpdateHarvestCost(socket, current_city.can_be_harvested_nodes, current_city.getHarvestCost(), player);

            ServerSocket.sendNodeHarvestedResponse(socket, this, player);

        } else {
            ServerSocket.somethingWrongResponse(socket, player.token, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(player.total_owned_stars - this.harvest_cost))} to harvest this node`);

        }
    }

    isWater(): boolean {
        return this.type === Utils.LAKE || this.type === Utils.OCEAN;
    }

    getType() {
        switch (this.type) {
            case Utils.FOREST:
                return "GRASS";
            case Utils.GRASS:
                return "BEACH";
            case Utils.MOUNTAIN:
                return "MOUNTAIN";
            case Utils.OCEAN:
                return "WATER";
        }
        return "NOT FOUND";
    }

    getMovementTime(): number {
        switch (this.type) {
            case Utils.MOUNTAIN:
                return 4000;
            case Utils.FOREST:
                return 2000;
            case Utils.OCEAN:
                return 1000;
            case Utils.LAKE:
                return 1000;
        }

        // GRASS
        return 1000;
    }

    // simplify node for socket.emit()
    getData(player_token: string): any {
        let type = this.type;
        let city_data = this.city != null ? this.city.getData(player_token) : null;
        let sprite_name = this.sprite_name;

        // hide the hidden node and cites
        if (!this.is_shown.includes(player_token)) {
            type = Utils.HIDDEN;
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
        }
    }
}