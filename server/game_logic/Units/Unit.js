const {ServerSocket} = require("../../ServerSocket");
const WATER = 0x80C5DE;

class Unit {
    constructor(x, y, id){
        this.x = x;
        this.y = y;
        this.id = id;
        this.speed = 1000;
        this.sight = 3;
    }
    move_and_send_response(to_x, to_y, game, player, socket){
        const from_node = game.map.all_nodes[this.y][this.x];
        const to_node = game.map.all_nodes[to_y][to_x];

        // apply Math.floor to account for hex grid
        if(to_node.type !== WATER){
            this.move_along_path(game, player, socket, game.map.a_star(from_node, to_node));

        }else{
            ServerSocket.send_data(socket,
                {
                response_type: ServerSocket.response_types.INVALID_MOVE,
                data: {unit: this}
                },
                player.token)
        }
    }
    move_along_path(game, player, socket, path){
        setTimeout(() => {
            if(path.length === 0) return;
            const node = path[0];

            this.x = node.x;
            this.y = node.y;
            node.neighbors.forEach((n) => game.map.make_neighbour_nodes_shown(player, n));
            let all_discovered_nodes = [node.get_data()]
            node.neighbors.forEach((n) => all_discovered_nodes.push(n.get_data()));

            ServerSocket.send_data(socket,
                {
                    response_type: ServerSocket.response_types.UNIT_MOVED,
                    data: {unit: this.get_data(),
                        nodes: all_discovered_nodes}
                }, player.token)

            path.shift();
            this.move_along_path(game, player, socket, path);

        }, this.speed);
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