class Map{
    constructor(number_of_land_nodes, number_of_continents){
        // number must be even for a symmetrical grid
        if(number_of_land_nodes % 2 !== 0) throw new Error("Error, number of nodes must be even for a symmetrical grid");
        this.number_of_land_nodes = number_of_land_nodes;
        // cannot be bigger than the number of nodes
        if(number_of_land_nodes < number_of_continents) throw new Error("Error, there can't be more continents than land nodes");
        this.number_of_continents = number_of_continents;

        this.all_nodes = [[]];
    }

    create_nodes(){
        for(let y; y<this.number_of_land_nodes/2; y++){
            let row = [];
            for(let x = 0; x<this.number_of_land_nodes/2; x++){
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
                node.neighbors.push(this.get_node(x-1, y));
                node.neighbors.push(this.get_node(x+1, y));
                node.neighbors.push(this.get_node(x-1, y+1));
                node.neighbors.push(this.get_node(x+1, y+1));
                node.neighbors.push(this.get_node(x-1, y-1));
                node.neighbors.push(this.get_node(x+1, y-1));
            }
        }
    }

    get_node(x, y){
        try{
            return this.all_nodes[x][y];
        }catch (e){
            // array out of bounds
            return null;
        }
    }

    generate_island_map(){
        this.create_nodes();

    }
}

module.exports = Map;