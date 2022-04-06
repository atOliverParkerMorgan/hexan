const WATER = 0;
const GRASS = 1;
const HILL = 2;
const MOUNTAIN = 3;

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