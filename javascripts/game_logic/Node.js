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

    get_random_neighbour() {
        let random_neighbour;
        do {
            random_neighbour = this.neighbors[Math.floor(Math.random() * this.neighbors.length)];
        } while (random_neighbour==null);

        return random_neighbour;
    }
    get_random_water_neighbour() {
        let water_neighbour_nodes = []

        for (const node of this.neighbors) {
            if(node != null) {
                if (node.type === WATER) {
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

}

module.exports = Node;