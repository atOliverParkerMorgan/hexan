import City from "../City";
import Map from "./Map";
import Node from "./Node";

class Continent{
    // attributes
    name: string;
    map: Map;
    has_player: boolean;

    all_nodes: Node[];

    grass_nodes: Node[];
    beach_nodes: Node[];
    mountain_nodes: Node[];

    constructor(name: string, map: Map) {
        this.name = name;
        this.map = map;

        this.all_nodes = [];

        this.grass_nodes = [];
        this.beach_nodes = [];
        this.mountain_nodes = [];

        this.has_player = false;

    }

    add_grass_node(node: Node): void{
        node.type = Node.GRASS;

        this.grass_nodes.push(node);
        this.all_nodes.push(node);
    }
    remove_grass_node(node: Node): void{
        this.grass_nodes.splice(this.grass_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.grass_nodes.indexOf(node), 1);
    }

    add_beach_node(node: Node): void{
        node.type = Node.BEACH;

        this.beach_nodes.push(node);
        this.all_nodes.push(node);
    }
    remove_beach_node(node: Node): void{
        this.beach_nodes.splice(this.beach_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.beach_nodes.indexOf(node), 1);
    }

    add_mountain_node(node: Node): void{
        node.type = Node.MOUNTAIN;

        this.mountain_nodes.push(node);
        this.all_nodes.push(node);
    }
    remove_mountain_node(node: Node): void{
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    }

    get_random_river_node(): Node{
        let all_river_nodes = [];
        for(const node of this.all_nodes){
            if(node.is_river()) all_river_nodes.push(node);
        }

        return all_river_nodes[this.random_int(0, all_river_nodes.length - 1)];
    }

    change_node_to(node: Node, new_type: number): void{
        if(node.type === new_type) return;

        const old_type = node.type;

        switch (new_type){
            case Node.GRASS:
                this.add_grass_node(node);
                break;
            case Node.BEACH:
                this.add_beach_node(node);
                break;
            case Node.MOUNTAIN:
                this.add_mountain_node(node);
                break;
        }

        switch (old_type){
            case Node.GRASS:
                this.remove_grass_node(node);
                break;
            case Node.BEACH:
                this.remove_beach_node(node);
                break;
            case Node.MOUNTAIN:
                this.remove_mountain_node(node);
                break;
        }
    }
    get_random_node(): Node | null{
        if(this.all_nodes.length === 0) return null;
        return this.all_nodes[this.random_int(0, this.all_nodes.length-1)];
    }
    get_random_node_of_type(type: number): Node | undefined{
        switch (type){
            case Node.GRASS:
                if(this.grass_nodes.length === 0) return undefined;
                return this.grass_nodes[this.random_int(0, this.grass_nodes.length-1)];
            case Node.BEACH:
                if(this.beach_nodes.length === 0) return undefined;
                return this.beach_nodes[this.random_int(0, this.beach_nodes.length-1)];
            case Node.MOUNTAIN:
                if(this.mountain_nodes.length === 0) return undefined;
                return this.mountain_nodes[this.random_int(0, this.mountain_nodes.length-1)];
        }
    }

    // @TODO get rid of duplicate
    random_int(min: number, max: number){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

export default Continent;
// module.exports = Continent;