import City from "../City/City";
import Map from "./Map";
import Player from "../Player";
import {NodeInterface} from "./NodeInterface";
import {ServerSocket} from "../../ServerSocket";
import {Unit} from "../Units/Unit";
import Game from "../Game";

// used for node.get_data()

export class Node{
    // constants
    public static readonly HEX_SIDE_SIZE = 25000 ** .5;
    public static readonly MOUNTAIN_TRAVEL_BIAS = 10;

    public static readonly OCEAN: number = 0x0AA3CF;
    public static readonly LAKE: number = 0x80C5DE;
    public static readonly FOREST: number = 0x228B22;
    public static readonly GRASS: number = 0x7FFF55;
    public static readonly MOUNTAIN: number = 0xF2F2F2;
    public static readonly HIDDEN: number = 0xE0D257;

    // attributes
    neighbors: (Node | undefined)[];
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
    city: City | null;
    unit: Unit | null;
    parent: Node | null;

    sprite_name: string;

    constructor(x: number, y: number){
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = Node.OCEAN;
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

    add_neighbor(node: Node): void{
        this.neighbors.push(node);
    }

    get_neighbor_position(neighbor: Node): number {
        return this.neighbors.indexOf(neighbor);
    }

    create_river(border_side_start: number, border_side_end: number, direction_of_search: number, add_neighbouring_tile: boolean){
        let sides = [Map.LEFT, Map.TOP_LEFT, Map.TOP_RIGHT, Map.RIGHT, Map.BOTTOM_RIGHT, Map.BOTTOM_LEFT];
        let output_sides = [];
        let index = sides.indexOf(border_side_start);

        if(add_neighbouring_tile) {
            index += direction_of_search;
            if (index === sides.length) index = 0;
            else if (index < 0) index = sides.length - 1;
        }

        while(sides[index] !== border_side_end){
            output_sides.push(sides[index]);
            if(index === sides.length) index = -1;
            else if(index < 0) index = sides.length;
            index += direction_of_search;
        }

        return output_sides;
    }

    get_neighbor_opposite_position(neighbor: Node): number | undefined{
        switch (this.neighbors.indexOf(neighbor)){
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

    /*
    * tries to get a random valid neighbour
    * if it succeeds it return the neighbour
    * if it fails it returns null
    */
    get_random_neighbour_in_range(min: number, max: number, type: number): Node | undefined{

        let random_neighbours = [];
        for (let i = min; i <= max; i++) {
            if(this.neighbors[i] != null){
                if(this.neighbors[i]?.type === type){
                    random_neighbours.push(this.neighbors[this.random_int(min, max)]);
                }
            }
        }
        if(random_neighbours.length === 0) return undefined;
        return random_neighbours[this.random_int(0, random_neighbours.length)];
    }

    get_random_neighbour(): Node {
        let random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour==null);

        return random_neighbour;
    }

    get_random_neighbour_of_type(type: number): Node | null{
        let water_neighbour_nodes: Node[] = []

        for (const node of this.neighbors) {
            if(node != null) {
                if (node.type === type) {
                    water_neighbour_nodes.push(node);
                }
            }
        }
        if(water_neighbour_nodes.length === 0) return null;
        return water_neighbour_nodes[Math.floor(Math.random() * water_neighbour_nodes.length)];
    }

    number_of_forest_neighbour(): number{
        let count = 0;
        for(const node_neighbour of this.neighbors){
            if(node_neighbour != null){
                if(node_neighbour.type === Node.FOREST){
                    count++;
                }
            }
        }
        return count;
    }

    is_coast(): boolean{
        if(this.type === Node.OCEAN || this.type === Node.LAKE) return false;

        for(const node_neighbour of this.neighbors){
            if(node_neighbour != null){
                if(node_neighbour.type === Node.OCEAN || node_neighbour.type === Node.LAKE){
                    return true;
                }
            }
        }
        return false;
    }

    is_river(): boolean{
        if(this.borders.length !== 0){
            return true;
        }
        this.neighbors.map((neighbor:Node | undefined) =>{
            if(neighbor != null) {
                if (neighbor.borders.includes(this.get_neighbor_opposite_position(neighbor))) {
                    return true;
                }
            }
        });
        return false;
    }

    // in order for a node to be a lake it must be surrounded by river boarders
    is_lake(): boolean{
        for (let riverside = Map.LEFT; riverside <= Map.BOTTOM_RIGHT; riverside++) {
            if(!this.borders.includes(riverside)){

                const neighbor = this.neighbors[riverside];
                if(neighbor == null) return false;

                if(!neighbor.borders.includes(this.get_neighbor_opposite_position(neighbor))){
                    return false
                }
            }
        }

        return true;
    }

    could_be_mountain(): boolean {
        return this.type === Node.FOREST || this.type === Node.GRASS;
    }

    // @TODO get rid of duplicate
    random_int(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    get_distance_to_node(node: Node): number{
        return Math.sqrt((node.get_x_in_pixels() - this.get_x_in_pixels()) ** 2 + (node.get_y_in_pixels() - this.get_y_in_pixels()) ** 2);
    }

    get_x_in_pixels(): number{
        let row_bias = this.y % 2 === 0 ? Map.DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * Map.DISTANCE_BETWEEN_HEX + row_bias) - Map.WORLD_WIDTH / 2;
    }

    get_y_in_pixels(): number{
        return  (this.y * 1.5 * Node.HEX_SIDE_SIZE) - Map.WORLD_HEIGHT / 2;
    }

    get_x_in_units(): number{
        let row_bias = this.y % 2 === 0 ? 1/2 : 0;
        return (this.x + row_bias);
    }

    get_y_in_units(): number{
        return  (this.y * 1.5);
    }

    get_heuristic_value(player: Player | undefined, start_node: Node, goal_node: Node){
        const value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        if(player != undefined){
             if (!this.is_shown.includes(player.token)) return value;
         }
        if (this.type === Node.OCEAN) return value + 1000;
        if(this.type === Node.MOUNTAIN) return value + Node.MOUNTAIN_TRAVEL_BIAS;
        return value;
    }

    harvest(player: Player, game: Game, socket: any){
        if(this.is_harvested) ServerSocket.something_wrong_response(socket, player.token, 'CANNOT HARVEST', `You cannot harvest a already harvested node`);

        // check if node can be harvested
        let current_city;
        let cities = game.get_player_cities(player.token)

        main_loop:
        for (const city of cities) {
            for (const can_be_harvested_node of city.can_be_harvested_nodes) {
                if(can_be_harvested_node.x === this.x && can_be_harvested_node.y === this.y){
                    current_city = city
                    break main_loop;
                }
            }
        }

        if(current_city == null){
            ServerSocket.something_wrong_response(socket, player.token, 'THIS NODE CANNOT BE HARVESTED', `A node must be next to a city or adjacent to two harvested node inorder to be harvested`);
            return;
        }

        if(player.is_payment_valid(this.harvest_cost)){
            player.pay_stars(this.harvest_cost);
            player.increase_production(this.production_stars);

            this.is_harvested = true;

            current_city.add_harvested_node(this)
            current_city.update_harvested_nodes();
            ServerSocket.send_update_harvest_cost(socket, current_city.can_be_harvested_nodes, current_city.get_harvest_cost(), player);

            ServerSocket.send_node_harvested_response(socket, this, player);

        }else {
            ServerSocket.something_wrong_response(socket, player.token, 'INSUFFICIENT STARS', `You need ${Math.abs(Math.floor(player.total_owned_stars - this.harvest_cost))} to harvest this node`);

        }
    }

    is_water(): boolean{
        return this.type === Node.LAKE || this.type === Node.OCEAN;
    }

    get_type(){
        switch (this.type){
            case Node.FOREST: return "GRASS";
            case Node.GRASS: return "BEACH";
            case Node.MOUNTAIN: return "MOUNTAIN";
            case Node.OCEAN: return "WATER";
        }
        return "NOT FOUND";
    }

    get_movement_time(): number {
        switch (this.type) {
            case Node.MOUNTAIN:
                return 4000;
            case Node.FOREST:
                return 2000;
            case Node.OCEAN:
                return 1000;
            case Node.LAKE:
                return 1000;
        }

        // GRASS
        return 1000;
    }

    // simplify node for socket.emit()
    get_data(player_token: string): NodeInterface{
        let type = this.type;
        let city_data = this.city != null ? this.city.get_data(player_token): null;
        let sprite_name = this.sprite_name;

        // hide the hidden node and cites
        if(!this.is_shown.includes(player_token)){
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
       }
    }
}