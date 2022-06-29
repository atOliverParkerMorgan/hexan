const {ServerSocket} = require("../../ServerSocket");

const WATER = 0x80C5DE;

const CAVALRY = "CAVALRY"
const MELEE = "MELEE";
const RANGE = "RANGE";

class Unit {
    constructor(x, y, id, type, speed){
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.speed = speed;
        this.sight = 3;
    }
    move_and_send_response(path, game, player, socket){

        this.move_along_path(game, player, socket, path);

        // don't send invalid move
        // }else{
        //     ServerSocket.send_data(socket,
        //         {
        //         response_type: ServerSocket.response_types.INVALID_MOVE,
        //         data: {unit: this}
        //         },
        //         player.token)
        // }
    }


    move_along_path(game, player, socket, path){
        if(path.length === 0) return;
        setTimeout(() => {
            const current_node = path[0];

            this.x = current_node.x;
            this.y = current_node.y;

            let all_discovered_nodes = [];

            for(const node of current_node.neighbors){
                if(node != null){
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token))
                }
            }

            all_discovered_nodes.push(current_node.get_data(player.token));

            console.log(all_discovered_nodes);
            ServerSocket.send_data(socket,
                {
                    response_type: ServerSocket.response_types.UNIT_MOVED_RESPONSE,
                    data: {
                        unit: this.get_data(),
                        nodes: all_discovered_nodes
                    }
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

module.exports.MELEE = MELEE;
module.exports.RANGE = RANGE;
module.exports.CAVALRY = CAVALRY;