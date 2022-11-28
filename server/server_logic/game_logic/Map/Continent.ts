import { Utils } from "../../../Utils";
import Map from "./Map";
import {Node} from "./Node";

class Continent{

    private static readonly NUMBER_OF_MOUNTAIN_SPRITES = 5;

    name: string;
    map: Map;
    has_player: boolean;

    all_nodes: Node[];

    beach_nodes: Node[];
    forest_nodes: Node[];
    grass_nodes: Node[];
    mountain_nodes: Node[];
    river_nodes: Node[];
    lake_nodes: Node[];

    constructor(name: string, map: Map) {
        this.name = name;
        this.map = map;

        this.all_nodes = [];

        this.beach_nodes = [];
        this.forest_nodes = [];
        this.grass_nodes = [];
        this.mountain_nodes = [];
        this.river_nodes = [];
        this.lake_nodes = [];

        this.has_player = false;

    }

    add_forest_node(node: Node): void{
        node.type = Node.FOREST;
        node.sprite_name = "trees_" + Utils.random_int(1, 2) + ".png";

        this.forest_nodes.push(node);
        this.all_nodes.push(node);
    }
    remove_forest_node(node: Node): void{
        node.sprite_name = "";
        this.forest_nodes.splice(this.forest_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.forest_nodes.indexOf(node), 1);
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

    add_mountain_node(node: Node, mountain_type: number): void{
        node.type = Node.MOUNTAIN;
        node.sprite_name = "mountain_" + Utils.random_int(1, 3) + ".png"
        this.mountain_nodes.push(node);
        this.all_nodes.push(node);
    }
    remove_mountain_node(node: Node): void{
        node.sprite_name = "";
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    }

    add_all_river_nodes(): void{
        this.all_nodes.map((node: Node)=>{
            if(node.is_river()) this.river_nodes.push(node);
        })
    }

    add_lake_node(node: Node): void{
        node.type = Node.LAKE;
        this.lake_nodes.push(node);
        this.all_nodes.push(node);
    }

    remove_lake_node(node: Node): void{
        node.sprite_name = "";
        this.lake_nodes.splice(this.lake_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.lake_nodes.indexOf(node), 1);
    }

    get_random_river_node(): Node{
        return this.river_nodes[this.random_int(0, this.river_nodes.length - 1)];
    }

    change_node_to(node: Node, new_type: number): void{
        if(node.type === new_type) return;

        const old_type = node.type;

        switch (new_type){
            case Node.FOREST:
                // make forest more random and clustered together
                if(Math.random() <= (.1 + node.number_of_forest_neighbour() * .05)){
                    this.add_forest_node(node);
                }else{
                    this.add_grass_node(node);
                }
                break;
            case Node.GRASS:
                this.add_grass_node(node);
                break;
            case Node.MOUNTAIN:
                this.add_mountain_node(node, Map.NORMAL_MOUNTAIN);
                break;
            case Node.LAKE:
                this.add_lake_node(node);
                break;
        }

        switch (old_type){
            case Node.FOREST:
                this.remove_forest_node(node);
                break;
            case Node.MOUNTAIN:
                this.remove_mountain_node(node);
                break;
            case Node.LAKE:
                this.remove_lake_node(node);
                break;
        }
    }

    get_random_node(): Node | null{
        if(this.all_nodes.length === 0) return null;
        return this.all_nodes[this.random_int(0, this.all_nodes.length-1)];
    }

    get_random_beach_node(): Node | undefined{
        if(this.beach_nodes.length === 0) return undefined;
        return this.beach_nodes[this.random_int(0, this.beach_nodes.length-1)];
    }

    get_random_node_of_type(type: number): Node | undefined{
        switch (type){
            case Node.FOREST:
                if(this.forest_nodes.length === 0) return undefined;
                return this.forest_nodes[this.random_int(0, this.forest_nodes.length-1)];
            case Node.GRASS:
                if(this.grass_nodes.length === 0) return undefined;
                return this.grass_nodes[this.random_int(0, this.grass_nodes.length-1)];
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