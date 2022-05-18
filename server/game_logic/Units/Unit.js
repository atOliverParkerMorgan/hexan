const {ServerSocket} = require("../../ServerSocket");

class Unit {
    constructor(x, y, id){
        this.x = x;
        this.y = y;
        this.id = id;
        this.movement = 2;
        this.speed = 1000;
        this.sight = 3;
    }
    move_and_send_response(to_node, game, player_token, socket){
        const from_node = game.map.all_nodes[this.y][this.x];
        if(from_node.get_distance_to_node(to_node) <= this.movement){
            const path = game.map.a_star(from_node, to_node);
            for (const node of path) {
                setTimeout(() => {
                    this.move(node.x, node.y);
                    socket.send_data(socket, ServerSocket.response_types.UNIT_MOVED, {unit: this}, player_token)
                }, this.speed);
            }
        }else{
            socket.send_data(socket, ServerSocket.response_types.INVALID_MOVE, {unit: this}, player_token)
        }
    }
    move(x, y){
        this.x = x;
        this.y = y;
    }




}

module.exports.Unit = Unit;