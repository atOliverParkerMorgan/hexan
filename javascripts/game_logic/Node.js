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
}

module.exports = Node;