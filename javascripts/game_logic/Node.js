// @TODO get rid of duplicate
const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xE5E5E5;

class Node{
    constructor(x, y){
        this.neighbors = [];
        this.x = x;
        this.y = y;
        this.type = WATER;
    }

    add_neighbor(node){
        this.neighbors.push(node);
    }

    /*
    * tries to get a random valid mountain neighbour
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

}

module.exports = Node;