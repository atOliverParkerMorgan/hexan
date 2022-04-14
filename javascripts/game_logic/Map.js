const Node = require("./Node");
const Continent = require("./Continent");

const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xF2F2F2;

// borders see @Map.add_neighbors_to_nodes()
const LEFT = 0;
const RIGHT = 1;
const TOP_LEFT = 2;
const TOP_RIGHT = 3;
const BOTTOM_LEFT = 4;
const BOTTOM_RIGHT = 5;

const HORIZONTAL = 0;
const VERTICAL = 1;

const CONTINENT_SIZE = 300;

const CONTINENT_NAMES = ["Drolend", "Dritune", "Figith", "Esox", "Okea", "Owrai", "Aneoqeon", "Vliutufor", "Strineaces", "Uaqixesh"]


class Map{
    constructor(number_of_land_nodes, number_of_continents){
        // number must be even for a symmetrical grid
        if(number_of_land_nodes ** .5 % 1 !== 0) console.log("Warning, the square root of number of nodes should be a whole number ");
        this.number_of_land_nodes = number_of_land_nodes;
        this.side_length = Math.floor(number_of_land_nodes ** .5);

        // cannot be bigger than the number of nodes
        if(number_of_land_nodes < number_of_continents) throw new Error("Error, there can't be more continents than land nodes");
        this.number_of_continents = number_of_continents;

        this.all_nodes = [];
        this.all_continents = [];
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
                let node = this.get_node(x, y);

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

    get_node(x, y){
        if(x<0 || y<0 || x >= this.side_length || y>=this.side_length) return null;
        return this.all_nodes[y][x];

    }

    get_node_(node){
        return this.get_node(node.x, node.y);
    }

    generate_island_map(){
        this.create_nodes();

        for (let i = 0; i < this.number_of_continents ; i++) {
            let random_x, random_y;
            // pick a random water node
            do{
                random_x = this.random_int(0, this.side_length - 1);
                random_y = this.random_int(0, this.side_length - 1);
            }while(this.all_nodes[random_y][random_x].type !== WATER);

            this.generate_continent(random_x, random_y, CONTINENT_SIZE, this.shuffleArray(CONTINENT_NAMES).shift());
       }
        this.generate_river(this.all_continents[0]);
        for(const continent of this.all_continents) {
            for (const node of continent.all_nodes) {
                if (!node.is_coast() && node.type === BEACH) {
                    continent.change_node_to(node, GRASS);
                }
            }
        }

    }

    generate_continent(seed_x, seed_y, continent_size, continent_name) {
        this.all_continents.push(new Continent(continent_name, this));
        let current_continent = this.get_continent(continent_name);

        current_continent.add_beach_node(this.all_nodes[seed_y][seed_x]);

        for (let i = 0; i < continent_size;) {

            let random_continent_node = current_continent.get_random_node_of_type(BEACH);
            let random_neighbour_node = random_continent_node.get_random_neighbour_of_type(WATER);

            if(random_neighbour_node == null){
                current_continent.change_node_to(random_continent_node, GRASS);
            }else{
                current_continent.add_beach_node(random_neighbour_node);
                i++;
            }
        }
        // cleaning up scattered beach nodes
        for (const node of current_continent.beach_nodes) {
            if(!node.is_coast()){
                current_continent.change_node_to(node, GRASS);
            }
        }

        // generate mountains
        let number_of_mountain_ranges = this.random_int(3, 5);
        for (let i = 0; i <= number_of_mountain_ranges; i++) {
            if(i === 0) this.generate_mountains(seed_x, seed_y, number_of_mountain_ranges, current_continent);
            else{
                let random_grass_node = current_continent.get_random_node_of_type(GRASS);
                this.generate_mountains(random_grass_node.x, random_grass_node.y, this.random_int(5, 15), current_continent);
            }
            // console.log("Generating mountains: "+ (i) + " of "+number_of_mountain_ranges)
        }

        // generate rivers
        // this.generate_river(current_continent);
    }

    generate_mountains(seed_x, seed_y, size, current_continent){

        // 10 is straight; 1 is scattered
        const MOUNTAIN_RANGE_STRAIGHTNESS = 4;

        let mountain_range_orientation =  this.random_int(HORIZONTAL, VERTICAL);
        let current_node = this.get_node(seed_x, seed_y);

        current_continent.add_mountain_node(current_node);

        const max_number_of_continues = 18;
        let number_of_continues = 0;

        for (let i = 0; i < size;) {
            // the chances of the next mountain being aligned with the mountain range are 50%
            let mountain_noise = this.random_int(0, 10);
            if(mountain_noise <= MOUNTAIN_RANGE_STRAIGHTNESS) {
                // generate a mountain that is aligned with the general direction of the mountain range
                let previous_node = current_node;

                // logic for mountain range that's direction is horizontal
                if (mountain_range_orientation === HORIZONTAL) {
                    let random_direction = this.random_int(0, 1);
                    let opposite_direction = random_direction === 0 ? 1: 0;

                    let random_neighbour = current_node.neighbors[random_direction];
                    let opposite_neighbour = current_node.neighbors[opposite_direction];

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
                            number_of_continues++;
                            if(number_of_continues >= max_number_of_continues) break;

                            continue;
                        }
                    } else if(opposite_neighbour != null){
                        if(opposite_neighbour.could_be_mountain()){
                            current_node = opposite_neighbour;
                        }
                    }
                    else{
                        // make sure the loop breaks if there are no valid nodes
                        number_of_continues++;
                        if(number_of_continues >= max_number_of_continues) break;

                        continue;
                    }
                }

                // logic for mountain range that's direction is vertical
                else if(mountain_range_orientation === VERTICAL){
                    // random order of valid nodes
                    const random_valid_node_neighbours_indexes = this.shuffleArray([2, 3, 4, 5]);

                    let found_valid_node = false;
                    for(const random_index of random_valid_node_neighbours_indexes) {
                        let random_neighbor = current_node.neighbors[random_index];
                        if(random_neighbor != null) {
                            if (random_neighbor.could_be_mountain()) {
                                current_node = current_node.neighbors[random_index];
                                found_valid_node = true;
                            }
                        }
                    }

                    if(!found_valid_node){
                        current_node = previous_node;

                        // make sure the loop breaks if there are no valid nodes
                        number_of_continues++;
                        if(number_of_continues >= max_number_of_continues) break;

                        continue;
                    }
                }


                if (current_node == null){
                    current_node = previous_node;

                    // make sure the loop breaks if there are no valid nodes
                    number_of_continues++;
                    if(number_of_continues >= max_number_of_continues) break;

                    continue;
                }

                if (current_node.could_be_mountain()) {
                    current_continent.add_mountain_node(current_node);

                    i++
                    number_of_continues = 0;

                } else {
                    current_node = previous_node;
                }

            }else {
                // get a node that isn't aligned with the mountain range
                // checkout @ this.add_neighbours_to_nodes() to understand grid arrangement
                let random_mountain_node = current_continent.get_random_node_of_type(MOUNTAIN)
                    .get_random_neighbour_in_range(2, 5, GRASS);

                if (random_mountain_node != null) {
                    current_continent.add_mountain_node(random_mountain_node);

                    i++
                    number_of_continues = 0;
                }else {

                    // make sure the loop breaks if there are no valid nodes
                    number_of_continues++;
                    if(number_of_continues >= max_number_of_continues) break;
                }
            }
        }
    }

    generate_river(continent){
        let random_mountain_node = continent.get_random_node_of_type(MOUNTAIN);
        let random_beach_node = continent.get_random_node_of_type(BEACH);
        let direction;
        let river_path = this.a_star(random_mountain_node, random_beach_node);
        console.log("length: "+river_path.length);
        let current_side = LEFT;
        for (let i = 0; i < river_path.length; i++) {
            let next_node = river_path[i + 1];
            let node = river_path[i];

            if(next_node == null) continue;
            let neighbor = node.get_neighbor_position(next_node);
            let river_nodes = node.create_river(current_side, neighbor, direction);
            for(const b of river_nodes){
                node.borders.push(b);
            }
            console.log(direction);
            // console.log(i+") current side: "+current_side);
            // console.log(i+") neighbor: "+neighbor);
            let output_river = this.river(river_nodes[river_nodes.length - 1], neighbor);
            current_side = output_river[0];
            direction = output_river[1];

        }
        river_path[0].type = 64165410;

    }

    river(current_side, neighbor_side){
        switch (current_side) {
            case LEFT:
                if(neighbor_side === TOP_LEFT) return this.shuffleArray([[BOTTOM_RIGHT, -1], [BOTTOM_LEFT, 1]])[0];
                // BOTTOM_LEFT
                return this.shuffleArray([[TOP_RIGHT, 1], [TOP_LEFT, -1]])[0];
            case RIGHT:
                if(neighbor_side === TOP_RIGHT) return  this.shuffleArray([[BOTTOM_RIGHT, -1], [BOTTOM_LEFT, 1]])[0];
                // BOTTOM_RIGHT
                return  this.shuffleArray([[TOP_RIGHT, 1], [TOP_LEFT, -1]])[0];
            case TOP_LEFT:
                if (neighbor_side === LEFT)return  this.shuffleArray([[LEFT, 1], [TOP_RIGHT, -1]])[0];
                // TOP_RIGHT
                return  this.shuffleArray([[RIGHT, 1], [TOP_LEFT, -1]])[0];
            case TOP_RIGHT:
                if (neighbor_side === RIGHT)return  this.shuffleArray([[RIGHT, -1], [TOP_LEFT, 1]])[0]
                // TOP_LEFT
                return  this.shuffleArray([[RIGHT, -1], [BOTTOM_RIGHT, 1]])[0]
            case BOTTOM_LEFT:
                if (neighbor_side === LEFT)return  this.shuffleArray([[RIGHT, -1], [BOTTOM_RIGHT, 1]])[0]
                // BOTTOM_RIGHT
                return  this.shuffleArray([[LEFT, -1], [TOP_LEFT, 1]])[0]
            case BOTTOM_RIGHT:
                if (neighbor_side === RIGHT)return  this.shuffleArray([[LEFT, 1], [BOTTOM_LEFT, -1]])[0]
                // BOTTOM_LEFT
                return  this.shuffleArray([[RIGHT, 1], [TOP_RIGHT, -1]])[0]
        }
    }

    // get shortest path between two nodes
    a_star(start_node, goal_node){
        let open_set = [start_node];
        let closed_set = []
        let distance_from_start_to_goal = start_node.get_distance_to_node(goal_node);

        // resetting node values
        start_node.distance_from_start = 0;
        start_node.distance_to_goal = start_node.get_distance_to_node(goal_node);

        while (open_set.length > 0){
            let current_node = open_set[0];
            let current_index = 0;

            for(let i = 0; i < open_set.length; i++){
                if(open_set[i].get_heuristic_value() < current_node.get_heuristic_value()){
                    current_node = open_set[i];
                    current_index = i;
                }
            }

            open_set.splice(current_index, 1);
            closed_set.push(current_node);

            if(current_node.x === goal_node.x && current_node.y === goal_node.y){
                let solution_path = [current_node];
                while (solution_path[solution_path.length - 1] !== start_node){
                    solution_path.push(solution_path[solution_path.length - 1].parent);
                }
                return solution_path.reverse();
            }

            for(const node of current_node.neighbors) {

                if (closed_set.includes(node) || node == null) {
                    continue;
                }

                let current_score = node.distance_from_start + current_node.get_distance_to_node(node);
                let is_better = false;

                if (!open_set.includes(node)) {
                    open_set.push(node);
                    is_better = true;
                }
                else if (current_score < node.distance_from_start) {
                    is_better = true;
                }

                if (is_better){
                    node.parent = current_node;
                    node.distance_from_start = current_score;
                    node.distance_to_goal = node.get_distance_to_node(goal_node);
                }
            }
        }
        return null;
    }

    for_each_node(fun){
        for(let node_rows of this.all_nodes){
            for(let node of node_rows){
                fun(node);
            }
        }
    }
    format(){
        let data = [];
        for(let node_rows of this.all_nodes){
            for(let node of node_rows) {
                data.push({x: node.x, y: node.y, type: node.type, borders: node.borders})
            }
        }
        return data;

    }
    // range: <min; max>
    random_int(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    get_continent(name){
        for (const continent of this.all_continents) {
            if(continent.name === name) return continent;
        }
        return null;
    }

}

module.exports = Map;