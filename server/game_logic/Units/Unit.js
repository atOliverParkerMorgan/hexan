const {ServerSocket} = require("../../ServerSocket");

class Unit {
    constructor(x, y, id){
        this.x = x;
        this.y = y;
        this.id = id;
        this.movement = 1;
        this.speed = 1000;
        this.sight = 3;
    }
    move_and_send_response(to_x, to_y, game, player, socket){
        const from_node = game.map.all_nodes[this.y][this.x];
        const to_node = game.map.all_nodes[to_y][to_x];
        console.log("DIST: "+from_node.get_distance_to_node(to_node));

        // apply Math.floor to account for hex grid
        if(from_node.get_distance_to_node(to_node) <= this.movement + 2**.5 - 1){
            const path = game.map.a_star(from_node, to_node);
            for (const node of path) {
                setTimeout(() => {
                    this.move(node.x, node.y);
                    node.neighbors.forEach((n) => game.map.make_neighbour_nodes_shown(player, n));
                    let all_discovered_nodes = [node.get_data()]
                    node.neighbors.forEach((n) => all_discovered_nodes.push(n.get_data()));


                    ServerSocket.send_data(socket,
                        {
                         response_type: ServerSocket.response_types.UNIT_MOVED,
                         data: {unit: this.get_data(),
                                nodes: all_discovered_nodes}
                        }, player.token)
                }, this.speed);
            }
        }else{
            ServerSocket.send_data(socket,
                {
                response_type: ServerSocket.response_types.INVALID_MOVE,
                data: {unit: this}
                },
                player.token)
        }
    }
    move(x, y){
        this.x = x;
        this.y = y;
    }
    get_data(){
        return{
            id: this.id,
            x: this.x,
            y: this.y,
        }
    }
}

module.exports.Unit = Unit;