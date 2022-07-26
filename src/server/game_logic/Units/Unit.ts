import Game from "../Game";
import Node from "../Map/Node";
import Player from "../Player";
import {Socket} from "socket.io";
const {ServerSocket} = require("../../ServerSocket");

class Unit {

    public static readonly WATER: number = 0x80C5DE;
    public static readonly CAVALRY: string = "CAVALRY"
    public static readonly MELEE: string = "MELEE";
    public static readonly RANGE: string = "RANGE";

    private x: number;
    private y: number;
    private id: number;
    private type: string;
    private speed: number;
    private sight :number;

    constructor(x: number, y: number, id:number, type: string, speed: number){
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.speed = speed;
        this.sight = 3;
    }

    // send response to client if the unit has successfully moved
    move_and_send_response(path: Node[], game: Game, player: Player, socket: Socket){

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

    // move this Unit along a valid path provided by the client
    move_along_path(game: Game, player: Player, socket: Socket, path: Node[]){
        if(path.length === 0) return;
        setTimeout(() => {
            const current_node: Node = path[0];

            this.x = current_node.x;
            this.y = current_node.y;

            let all_discovered_nodes: Node[] = [];

            for(const node of current_node.neighbors){
                if(node != null){
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token))
                }
            }

            all_discovered_nodes.push(current_node.get_data(player.token));

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
    get_id(){
        return this.id;
    }

    get_data(){
        return{
            id: this.id,
            x: this.x,
            y: this.y,
        }
    }
}

export default Unit;