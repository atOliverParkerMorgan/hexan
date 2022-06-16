class Path{
    constructor(game, ...path_cords_nodes) {
        this.path = [];
        for(const node_cords of path_cords_nodes){
            this.path.push(game.get_node(node_cords[0], node_cords[1]));
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

module.exports.Path = Path;