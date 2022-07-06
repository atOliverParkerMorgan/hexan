// @TODO get rid of duplicate

const HEX_SIDE_SIZE = 25000 ** .5;
const DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
const WORLD_WIDTH = DISTANCE_BETWEEN_HEX * HEX_SIDE_SIZE;
const WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * HEX_SIDE_SIZE;

const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xF2F2F2;
const HIDDEN = 0xE0D257;

// borders see @Map.add_neighbors_to_nodes() to understand values
const LEFT = 0;
const RIGHT = 1;
const TOP_LEFT = 2;
const TOP_RIGHT = 3;
const BOTTOM_LEFT = 4;
const BOTTOM_RIGHT = 5;

const MOUNTAIN_TRAVEL_BIAS = 10;

class Node{
    constructor(x, y){
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = WATER;
        this.borders = [];
        // ids for player who seen this node
        this.is_shown = [];
        this.city = null;

        // used for A* searching algorithm
        this.parent = null;
    }

    add_neighbor(node){
        this.neighbors.push(node);
    }

    get_neighbor_position(neighbor) {
        return this.neighbors.indexOf(neighbor);
    }

    create_river(border_side_start, border_side_end, direction_of_search, add_neighbouring_tile){
        let sides = [LEFT, TOP_LEFT, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT];
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

    is_river(){
        if(this.borders.length !== 0){
            return true;
        }
        for(const neighbor of this.neighbors){
            if(neighbor == null) continue;
            if(neighbor.borders.includes(this.get_neighbor_opposite_position(neighbor))){
                return true;
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
        return Math.sqrt((node.get_x_in_pixels() - this.get_x_in_pixels()) ** 2 + (node.get_y_in_pixels() - this.get_y_in_pixels()) ** 2);
    }

    get_x_in_pixels(){
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    }

    get_y_in_pixels(){
        return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
    }

    get_x_in_units(){
        let row_bias = this.y % 2 === 0 ? 1/2 : 0;
        return (this.x + row_bias);
    }

    get_y_in_units(){
        return  (this.y * 1.5);
    }

    get_heuristic_value(player, start_node, goal_node){
        const value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        if(player != null){
             if (!this.is_shown.includes(player.token)) return value;
         }
        if (this.type === WATER) return value + 1000;
        if(this.type === MOUNTAIN) return value + MOUNTAIN_TRAVEL_BIAS;
        return value;
    }
    get_type(){
        switch (this.type){
            case GRASS: return "GRASS";
            case BEACH: return "BEACH";
            case MOUNTAIN: return "MOUNTAIN";
            case WATER: return "WATER";
        }
        return "NOT FOUND";
    }

    // simplify node for socket.emit()
    get_data(player_token){
        let type = this.type;
        // if(!this.is_shown.includes(player_token)){
        //     type = HIDDEN;
        // }

       return {
           x: this.x,
           y: this.y,
           type: type,
           borders: this.borders,
           city: this.city
       }
    }

}

module.exports = Node;