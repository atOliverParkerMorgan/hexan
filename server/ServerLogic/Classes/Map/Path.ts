import GameInterface from "../../Interfaces/GameInterface";
import PathInterface from "../../Interfaces/Map/PathInterface";
import NodeInterface from "../../Interfaces/Map/NodeInterface";



class Path implements PathInterface {
    path: NodeInterface[];
    constructor(game: GameInterface, path_cords_nodes: [index: number []]) {
        this.path = [];
        for(const node_cords of path_cords_nodes){
            let node: NodeInterface | undefined = game.map.getNode(node_cords[0], node_cords[1]);

            if(node == null){
                console.trace("Error, invalid path")
                this.path = [];
                return;
            }

            this.path.push(node);
        }
    }

    isValid() {
        for (let i = 0; i < this.path.length - 1; i++) {
            if (!this.path[i].neighbors.includes(this.path[i + 1])) {
                return false;
            }
        }
        return true;
    }
}

export default Path;
// module.exports.Path = Path;