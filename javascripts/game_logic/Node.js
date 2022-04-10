// @TODO get rid of duplicate
const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xE5E5E5;

// borders see @Map.add_neighbors_to_nodes() to understand values
const LEFT = 0;
const RIGHT = 1;
const TOP_LEFT = 2;
const TOP_RIGHT = 3;
const BOTTOM_LEFT = 4;
const BOTTOM_RIGHT = 5;

class Node{
    constructor(x, y){
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = WATER;
        this.borders = [];

        // used for A* searching algorithm
        this.parent = null;
        this.distance_from_start = 0;
        this.distance_to_goal = 0;
    }

    add_neighbor(node){
        this.neighbors.push(node);
    }

    get_neighbor_position(neighbor){
        return this.neighbors.indexOf(neighbor);
    }

    create_river(border_side_start, border_side_end){
        let sides = [LEFT, TOP_LEFT, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT];
        let output_sides = [];
        let index = sides.indexOf(border_side_start);
        let direction_of_search = this.random_int(0, 1) === 1? 1 : -1;
        do{
            index += direction_of_search;
            if(index === sides.length) index = 0;
            else if(index < 0) index = sides.length - 1;
            output_sides.push(sides[index]);
        }
        while(sides[index] === border_side_end)

        return output_sides;
    }

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

    get_neighbor_opposite_position(neighbor){
        switch (this.neighbors.indexOf(neighbor)){
            case LEFT:
                return RIGHT;
            case RIGHT:
                return LEFT;
            case TOP_LEFT:
                return BOTTOM_RIGHT;
            case TOP_RIGHT:
                return BOTTOM_LEFT;
            case BOTTOM_LEFT:
                return TOP_RIGHT;
            case BOTTOM_RIGHT:
                return TOP_LEFT;
        }
    }

    /*
    * tries to get a random valid neighbour
    * if it succeeds it return the neighbour
    * if it fails it returns null
    */
    get_random_neighbour_in_range(min, max, type) {

        let random_neighbours = [];
        for (let i = min; i <= max; i++) {
            if(this.neighbors[i] != null){
                if(this.neighbors[i].type === type){
                    random_neighbours.push(this.neighbors[this.random_int(min, max)]);
                }
            }
        }
        if(random_neighbours.length === 0) return null;
        return random_neighbours[this.random_int(0, random_neighbours.length)];
    }

    get_random_neighbour() {
        let random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour==null);

        return random_neighbour;
    }
    get_random_neighbour_of_type(type) {
        let water_neighbour_nodes = []

        for (const node of this.neighbors) {
            if(node != null) {
                if (node.type === type) {
                    water_neighbour_nodes.push(node);
                }
            }
        }
        if(water_neighbour_nodes.length === 0) return null;
        return water_neighbour_nodes[[Math.floor(Math.random() * water_neighbour_nodes.length)]];
    }

    is_coast(){
        for(const node_neighbour of this.neighbors){
            if(node_neighbour != null){
                if(node_neighbour.type === WATER){
                    return true;
                }
            }
        }
        return false;
    }
    could_be_mountain (){
        return this.type === GRASS || this.type === BEACH;
    }

    // @TODO get rid of duplicate
    random_int(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    get_distance_to_node(node) {
        return Math.sqrt((node.x - this.x) ** 2 + (node.y - this.y) ** 2);
    }
    get_heuristic_value(){
        return this.distance_from_start + this.distance_to_goal;
    }

}

module.exports = Node;