const Node = require("./Node");

const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xE5E5E5;

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
        for(let node_rows of this.all_nodes){
            for(let node of node_rows){
                let x = node.x;
                let y = node.y;

                // hex grid is unique in neighbour configuration
                // odd and  even rows have different neighbour cords
                // see https://www.redblobgames.com/grids/hexagons/

                // always the same neighbours
                node.add_neighbor(this.get_node(x - 1, y));
                node.add_neighbor(this.get_node(x + 1, y));

                // even neighbour configuration
                if(node.y % 2 === 0) {
                    node.add_neighbor(this.get_node(x, y + 1));
                    node.add_neighbor(this.get_node(x + 1, y + 1));
                    node.add_neighbor(this.get_node(x, y - 1));
                    node.add_neighbor(this.get_node(x + 1, y - 1));
                }
                // odd neighbour configuration
                else{
                    node.add_neighbor(this.get_node(x - 1, y + 1));
                    node.add_neighbor(this.get_node(x, y + 1));
                    node.add_neighbor(this.get_node(x - 1, y - 1));
                    node.add_neighbor(this.get_node(x, y - 1));

                }
            }
        }
    }

    get_node(x, y){
        try{
            return this.all_nodes[y][x];
        }catch (e){
            // array out of bounds
            return null;
        }
    }

    generate_island_map(){
        this.create_nodes();
        // pick a random node

        let random_x = this.random_int(0, this.side_length - 1);
        let random_y = this.random_int(0, this.side_length - 1);
        let random_size = this.random_int(Math.floor(this.number_of_land_nodes/ 10) + 1,
            Math.floor(this.number_of_land_nodes));
        this.generate_continent(random_x, random_y, 300);

    }

    generate_continent(seed_x, seed_y, continent_size) {
        let continent_nodes = [];
        continent_nodes.push(this.all_nodes[seed_y][seed_x]);

        for (let i = 0; i < continent_size;) {

            let random_index = this.random_int(0, continent_nodes.length - 1);
            let random_continent_node = continent_nodes[random_index];
            let random_neighbour_node = random_continent_node.get_random_water_neighbour();

            if(random_neighbour_node == null){
                random_continent_node.type = GRASS;
                continent_nodes.splice(random_index, 1);
            }else{
                continent_nodes.push(random_neighbour_node);
                random_neighbour_node.type = BEACH;
                i++;
            }
        }
        for (const node of continent_nodes) {
            if(!node.is_coast()){
                node.type = GRASS;
            }
        }
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
                data.push({x: node.x, y: node.y, type: node.type})
            }
        }
        return data;

    }

    random_int(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

module.exports = Map;