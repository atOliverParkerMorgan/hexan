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
    move_and_send_response(to_x, to_y, game, player_token, socket){
        const from_node = game.map.all_nodes[this.y][this.x];
        const to_node = game.map.all_nodes[to_y][to_x];
        console.log("DIST: "+from_node.get_distance_to_node(to_node));
        if(from_node.get_distance_to_node(to_node) <= this.movement){
            const path = game.map.a_star(from_node, to_node);
            for (const node of path) {
                console.log("here");
                setTimeout(() => {
                    this.move(node.x, node.y);
                    socket.send_data(socket,
                        {
                         response_type: ServerSocket.response_types.UNIT_MOVED,
                         data: {unit: this}
                        }, player_token)
                }, this.speed);
            }
        }else{
            socket.send_data(socket,
                {
                response_type: ServerSocket.response_types.INVALID_MOVE,
                data: {unit: this}
                },
                player_token)
        }
    }
    move(x, y){
        this.x = x;
        this.y = y;
    }




}

module.exports.Unit = Unit;