import Game from "../Game";
import {Node} from "./Node";

class Path{
    path: Node[];
    constructor(game: Game, path_cords_nodes: [index: number []]) {
        this.path = [];
        for(const node_cords of path_cords_nodes){
            let node: Node | undefined = game.map.get_node(node_cords[0], node_cords[1]);

            if(node == null){
                console.trace("Error, invalid path")
                this.path = [];
                return;
            }

            this.path.push(node);
        }
    }
    is_valid(){
        for (let i = 0; i < this.path.length - 1; i++) {
            if(!this.path[i].neighbors.includes(this.path[i+1])){
                return false;
            }
        }
        return true;
    }
}

export default Path;
// module.exports.Path = Path;