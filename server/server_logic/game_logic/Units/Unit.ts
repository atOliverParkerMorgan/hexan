import Game from "../Game";
import {Node, NodeData} from "../Map/Node";
import Player from "../Player";
import {Socket} from "socket.io";
import {ServerSocket} from "../../ServerSocket";

export interface UnitInitData{
    attack: number;
    health: number;
    range: number;
    movement: number;

    type: string;
}

export class Unit implements UnitData{

    public static readonly WATER: number = 0x80C5DE;
    public static readonly CAVALRY: string = "CAVALRY"
    public static readonly MELEE: string = "MELEE";
    public static readonly RANGE: string = "RANGE";

    x: number;
    y: number;
    readonly id: string;
    type: string;

    attack: number;
    health: number;
    movement: number;
    range :number;

    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData){
        this.x = x;
        this.y = y;

        this.id = id;
        this.type = unit_init_data.type;

        this.attack = unit_init_data.attack;
        this.health = unit_init_data.health;
        this.movement = unit_init_data.movement;
        this.range = unit_init_data.range;
    }

    // send response to public if the unit has successfully moved
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

    // move this Unit along a valid path provided by the public
    move_along_path(game: Game, player: Player, socket: Socket, path: Node[]){
        if(path.length === 0) return;

        // movement per a minute calculation
        const MOVEMENT_PER_A_MINUTE: number = 60_000 / this.movement

        setTimeout(() => {
            const current_node: Node = path[0];

            this.x = current_node.x;
            this.y = current_node.y;

            let all_discovered_nodes: NodeData[] = [];

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

        }, MOVEMENT_PER_A_MINUTE);
    }
    get_id(): string{
        return this.id;
    }

    get_data(): UnitData{
        return{
            id: this.id,
            x: this.x,
            y: this.y,

            type: this.type,

            attack: this.attack,
            health: this.health,
            range: this.range,
            movement: this.movement
        }
    }
}