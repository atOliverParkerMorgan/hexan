import Continent from "./Continent";
import {Node} from "./Node";
import Player from "../Player";

class Map{

    public static readonly DISTANCE_BETWEEN_HEX = 2 * (Node.HEX_SIDE_SIZE ** 2 - (Node.HEX_SIDE_SIZE/2) ** 2) ** .5;
    public static readonly WORLD_WIDTH = Map.DISTANCE_BETWEEN_HEX * Node.HEX_SIDE_SIZE;
    public static readonly WORLD_HEIGHT = Node.HEX_SIDE_SIZE * 1.5 * Node.HEX_SIDE_SIZE;

    // borders see @Map.add_neighbors_to_nodes()
    public static readonly LEFT: number = 0;
    public static readonly RIGHT: number = 1;
    public static readonly TOP_LEFT: number = 2;
    public static readonly TOP_RIGHT: number = 3;
    public static readonly BOTTOM_LEFT: number = 4;
    public static readonly BOTTOM_RIGHT: number = 5;

    public static HORIZONTAL: number = 0;
    public static VERTICAL: number = 1;

    public static readonly CONTINENT_NAMES: string[] = ["Drolend", "Dritune", "Figith", "Esox", "Okea", "Owrai", "Aneoqeon", "Vliutufor", "Strineaces", "Uaqixesh"]

    // attributes
    public readonly number_of_land_nodes: number;
    continent_size: number;
    side_length: number;
    number_of_continents: number;
    all_nodes: Node[][] = [];
    all_continents: Continent[] = [];

    constructor(number_of_land_nodes: number, number_of_continents: number){
        // number must be even for a symmetrical grid
        if(number_of_land_nodes ** .5 % 1 !== 0) console.log("Warning, the square root of number of nodes should be a whole number ");
        this.number_of_land_nodes = number_of_land_nodes;
        this.continent_size = (number_of_land_nodes / number_of_continents);
        this.continent_size /= this.random_int(2, 4);
        this.side_length = Math.floor(number_of_land_nodes ** .5);

        // cannot be bigger than the number of nodes
        if(number_of_land_nodes < number_of_continents) throw new Error("Error, there can't be more continents than land nodes");
        this.number_of_continents = number_of_continents;

        this.all_nodes = [];
        this.all_continents = [];

        this.create_nodes();
    }

    create_nodes(){
        for(let y = 0; y < this.side_length; y++){
            let row = [];
            for(let x = 0; x < this.side_length; x++){
                row.push(new Node(x, y))
            }
            this.all_nodes.push(row);
        }

        this.add_neighbors_to_nodes();
    }

    add_neighbors_to_nodes(){
        for(let y = 0; y < this.side_length; y++){
            for(let x = 0; x < this.side_length; x++){
                let node: Node | undefined = this.get_node(x, y);
                if(node == null) continue;

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
                if(node.y % 2 === 0) {
                    node.neighbors.push(this.get_node(x, y - 1)); // top left
                    node.neighbors.push(this.get_node(x + 1, y - 1)); // top right
                    node.neighbors.push(this.get_node(x, y + 1)); // bottom left
                    node.neighbors.push(this.get_node(x + 1, y + 1)); // bottom right
                }
                // odd neighbour configuration
                else{
                    node.neighbors.push(this.get_node(x - 1, y - 1)); // top left
                    node.neighbors.push(this.get_node(x, y - 1)); // top right
                    node.neighbors.push(this.get_node(x - 1, y + 1)); // bottom left
                    node.neighbors.push(this.get_node(x, y + 1)); // bottom right
                }
            }
        }
    }

    get_node(x: number, y: number): Node | undefined{
        if(y < 0 || x < 0 || y >= this.side_length || x >= this.side_length) return undefined;
        return this.all_nodes[y][x];
    }

    get_node_(node: Node): Node | undefined{
        return this.get_node(node.x, node.y);
    }

    generate_island_map(): void{
        for (let i = 0; i < this.number_of_continents ; i++) {
            let random_x, random_y;
            // pick a random water node
            do{
                random_x = this.random_int(0, this.side_length - 1);
                random_y = this.random_int(0, this.side_length - 1);
            }while(this.all_nodes[random_y][random_x].type !== Node.OCEAN);

            this.generate_continent(random_x, random_y, this.continent_size, this.shuffleArray(Map.CONTINENT_NAMES).shift());
       }
        for(const continent of this.all_continents) {
            for (const node of continent.all_nodes) {
                if (!node.is_coast() && node.type === Node.BEACH) {
                    continent.change_node_to(node, Node.GRASS);
                }
            }
        }
    }

    generate_continent(seed_x: number, seed_y: number, continent_size: number, continent_name: string): void {
        this.all_continents.push(new Continent(continent_name, this));
        // @TODO fix any type
        let current_continent: any  = this.get_continent(continent_name);

        current_continent.add_beach_node(this.all_nodes[seed_y][seed_x]);

        for (let i = 0; i < continent_size;) {

            let random_continent_node = current_continent.get_random_node_of_type(Node.BEACH);
            if(random_continent_node == null) continue;
            let random_neighbour_node = random_continent_node.get_random_neighbour_of_type(Node.OCEAN);

            if(random_neighbour_node == null){
                current_continent.change_node_to(random_continent_node, Node.GRASS);
            }else{
                current_continent.add_beach_node(random_neighbour_node);
                i++;
            }
        }
        // cleaning up scattered beach nodes
        for (const node of current_continent.beach_nodes) {
            if(!node.is_coast()){
                current_continent.change_node_to(node, Node.GRASS);
            }
        }

        // generate mountains
        let number_of_mountain_ranges = this.random_int(1, 3);
        for (let i = 0; i <= number_of_mountain_ranges; i++) {
            if(i === 0) this.generate_mountains(seed_x, seed_y, number_of_mountain_ranges, current_continent);
            else{
                let random_grass_node = current_continent.get_random_node_of_type(Node.GRASS);
                this.generate_mountains(random_grass_node.x, random_grass_node.y, this.random_int(5, 15), current_continent);
            }
            // console.log("Generating mountains: "+ (i) + " of "+number_of_mountain_ranges)
        }

        // generate rivers
        let number_of_rivers = this.random_int(2, 4);
        for (let i = 0; i <= number_of_rivers; i++) {
            this.generate_river(current_continent);
        }

        // generate lakes
        this.generate_lakes(current_continent);
    }

    // TODO add one random seed
    generate_mountains(seed_x: number, seed_y: number, size: number, current_continent: Continent): void{

        // 10 is straight; 1 is scattered
        const MOUNTAIN_RANGE_STRAIGHTNESS: number = 4;

        let mountain_range_orientation: number =  this.random_int(Map.HORIZONTAL, Map.VERTICAL);
        let current_node: Node | undefined = this.get_node(seed_x, seed_y);

        if(current_node == undefined) return;

        current_continent.add_mountain_node(current_node);

        // ensures that the algorithm doesn't get stuck in an infinite loop
        const max_number_of_loops: number = 18;
        let current_number_of_loops = 0;

        for (let i = 0; i < size;) {
            // the chances of the next mountain being aligned with the mountain range are 50%
            let mountain_noise: number = this.random_int(0, 10);
            if(mountain_noise <= MOUNTAIN_RANGE_STRAIGHTNESS) {
                // generate a mountain that is aligned with the general direction of the mountain range
                let previous_node: Node = current_node;

                // logic for mountain ranges that have a horizontal direction
                if (mountain_range_orientation === Map.HORIZONTAL) {
                    let random_direction: number = this.random_int(0, 1);
                    let opposite_direction: number = random_direction === 0 ? 1: 0;

                    let random_neighbour: Node | undefined = current_node.neighbors[random_direction];
                    let opposite_neighbour: Node | undefined = current_node.neighbors[opposite_direction];

                    if(random_neighbour != null) {
                        if (random_neighbour.could_be_mountain()) {
                            current_node = random_neighbour;
                        }
                        else if(opposite_neighbour != null){
                            if(opposite_neighbour.could_be_mountain()){
                                current_node = opposite_neighbour;
                            }
                        }
                        else {
                            current_number_of_loops++;
                            if(current_number_of_loops >= max_number_of_loops) break;

                            continue;
                        }
                    } else if(opposite_neighbour != null){
                        if(opposite_neighbour.could_be_mountain()){
                            current_node = opposite_neighbour;
                        }
                    }
                    else{
                        // make sure the loop breaks if there are no valid nodes
                        current_number_of_loops++;
                        if(current_number_of_loops >= max_number_of_loops) break;

                        continue;
                    }
                }

                // logic for mountain range that's direction is vertical
                else if(mountain_range_orientation === Map.VERTICAL){
                    // random order of valid nodes
                    const random_valid_node_neighbours_indexes = this.shuffleArray([2, 3, 4, 5]);

                    let found_valid_node = false;
                    for(const random_index of random_valid_node_neighbours_indexes) {
                        let random_neighbor = current_node?.neighbors[random_index];
                        if(random_neighbor != null) {
                            if (random_neighbor.could_be_mountain()) {
                                current_node = current_node?.neighbors[random_index];
                                found_valid_node = true;
                            }
                        }
                    }

                    if(!found_valid_node){
                        current_node = previous_node;

                        // make sure the loop breaks if there are no valid nodes
                        current_number_of_loops++;
                        if(current_number_of_loops >= max_number_of_loops) break;

                        continue;
                    }
                }


                if (current_node == null){
                    current_node = previous_node;

                    // make sure the loop breaks if there are no valid nodes
                    current_number_of_loops++;
                    if(current_number_of_loops >= max_number_of_loops) break;

                    continue;
                }

                if (current_node.could_be_mountain()) {
                    current_continent.add_mountain_node(current_node);

                    i++
                    current_number_of_loops = 0;

                } else {
                    current_node = previous_node;
                }

            }else {
                // get a node that isn't aligned with the mountain range
                // checkout @ this.add_neighbours_to_nodes() to understand grid arrangement
                let random_mountain_node = current_continent.get_random_node_of_type(Node.MOUNTAIN)
                    ?.get_random_neighbour_in_range(2, 5, Node.GRASS);

                if (random_mountain_node != null) {
                    current_continent.add_mountain_node(random_mountain_node);

                    i++
                    current_number_of_loops = 0;
                }else {

                    // make sure the loop breaks if there are no valid nodes
                    current_number_of_loops++;
                    if(current_number_of_loops >= max_number_of_loops) break;
                }
            }
        }
    }

    // to generate river a continent must have mountains and beaches
    generate_river(continent: Continent): void{
        let random_mountain_node: Node | undefined = continent.get_random_node_of_type(Node.MOUNTAIN);
        let random_beach_node: Node | undefined = continent.get_random_node_of_type(Node.BEACH);

        if(random_mountain_node == undefined || random_beach_node == undefined) {
           // there are no mountains or beaches on this continent therefore a river cannot be generated
           return;
        }

        let last_direction: number | null = null;


        // @TODO create path interface
        let river_path: any = this.a_star(<Node> random_mountain_node, <Node> random_beach_node);

        let current_side: number | undefined = this.random_int(Map.LEFT, Map.BOTTOM_RIGHT);
        for (let i = 0; i < river_path.length; i++) {

            // random direction of river see Node.create_river()
            let direction = this.random_int(0, 1) === 1 ? 1: -1;
            let next_node = river_path[i + 1];
            let node = river_path[i];

            if(next_node == null){
                next_node = node.get_random_neighbour();
            }

            let neighbor = node.get_neighbor_position(next_node);

            // generate river path and add river path to node
            let river_nodes = node.create_river(current_side, neighbor, direction, direction === last_direction);
            for(const b of river_nodes){
                node.borders.push(b);
            }

            // if node is beach break
            if(node.type === Node.BEACH) break;

            current_side = this.switch_position(neighbor);
            last_direction = direction;
           // if(i === river_path.length - 1) //node.type = 1534541;
        }
        continent.add_all_river_nodes();
    }

    generate_lakes(continent: Continent){
        continent.river_nodes.map((node: Node)=>{
            if(node.is_lake()){
                continent.change_node_to(node, Node.LAKE);
            }
        })
    }

    print_position(pos: number): string | undefined{
        switch (pos){
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
    switch_position(pos: number): number | undefined{
        switch (pos){
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
    a_star(start_node: Node, goal_node: Node, player?: Player){
        let open_set = [start_node];
        let closed_set = []

        while (open_set.length > 0){
            let current_node = open_set[0];
            let current_index = 0;

            for(let i = 0; i < open_set.length; i++){
                if(open_set[i].get_heuristic_value(player, start_node, goal_node) < current_node.get_heuristic_value(<Player> player, start_node, goal_node)){
                    current_node = open_set[i];
                    current_index = i;
                }
            }

            open_set.splice(current_index, 1);
            closed_set.push(current_node);

            if(current_node.x === goal_node.x && current_node.y === goal_node.y){
                let solution_path = [current_node];
                while (solution_path[solution_path.length - 1] !== start_node){
                    solution_path.push(<Node>solution_path[solution_path.length - 1].parent);
                }
                return solution_path.reverse();
            }

            for(const node of current_node.neighbors) {
                if(node == null) continue;

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

                if (is_better){
                    node.parent = current_node;
                }
            }
        }
        return null;
    }

    format(player_token: string): any{
        let data = [];
        for(let node_rows of this.all_nodes){
            for(let node of node_rows) {
               data.push(node.get_data(player_token));
            }
        }
        return data;
    }

    // range: <min; max>
    // @ TODO add unit functions
    random_int(min: number, max: number): number{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Randomize array in-place using Durstenfeld shuffle algorithm
    shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    get_continent(name: string): Continent | null{
        for (const continent of this.all_continents) {
            if(continent.name === name) return continent;
        }
        return null;
    }

    make_neighbour_nodes_shown(player: Player, node: Node | undefined){

        if(node == null) return;

        node.is_shown.push(player.token);
        for(const neighbor of node.neighbors){
            if(neighbor == null || neighbor.is_shown.includes(player.token)) continue;
            neighbor.is_shown.push(player.token);
        }
    }

}

export default Map;