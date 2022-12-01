import Game from "../Game";
import {Node} from "../Map/Node";
import Player from "../Player";
import {Socket} from "socket.io";
import {ServerSocket} from "../../ServerSocket";
import { UnitInterface } from "./UnitInterface";
import {UnitInitData} from "./UnitInitData";
import Melee from "./Melee";
import Range from "./Range";
import Cavalry from "./Cavalry";
import Settler from "./Settler";
import {NodeInterface} from "../Map/NodeInterface";
import Map from "../Map/Map";
import Path from "../Map/Path";

export class Unit implements UnitInterface{

    // types of units
    public static readonly CAVALRY: string = "Cavalry"
    public static readonly MELEE: string = "Melee";
    public static readonly RANGE: string = "Range";
    public static readonly SETTLER: string = "Settler";

    // action that designated units can take
    public static readonly FORTIFY: string = "Fortify";
    public static readonly SETTLE: string = "Settle";
    public static readonly BUILD: string = "Build";

    x: number;
    y: number;
    readonly id: string;
    type: string;
    action: string;

    is_visible_to_enemy: boolean;
    is_on_water: boolean;

    attack: number;
    health: number;
    movement: number;
    range :number;
    name: string;
    cost: number;

    constructor(x: number, y: number, id: string, map: Map, unit_init_data: UnitInitData){
        this.x = x;
        this.y = y;

        this.id = id;
        this.type = unit_init_data.type;
        this.action = unit_init_data.action;

        this.is_visible_to_enemy = false;
        this.is_on_water = false;

        this.attack = unit_init_data.attack;
        this.health = unit_init_data.health;
        this.movement = unit_init_data.movement;
        this.range = unit_init_data.range;
        this.name = unit_init_data.name;
        this.cost = unit_init_data.cost;

        map.all_nodes[this.y][this.x].unit = this;
    }

    // send response to public if the unit has successfully moved
    move_and_send_response(path: Node[], game: Game, player: Player, socket: Socket){
        // remove first element
        path.shift()
        this.move_along_path(game, player, socket, path);
    }

    // move this Unit along a valid path provided by the public
    move_along_path(game: Game, player: Player, socket: Socket, path: Node[]){

        // used at the end of the path
        let MOVEMENT_PER_A_MINUTE: number = 1;

        // movement per a minute calculation
        if(path.length !== 0) MOVEMENT_PER_A_MINUTE = path[0].get_movement_time() / (this.movement / 100)

        setTimeout(() => {
            if(path.length === 0){
                return;
            }

            const current_node: Node = path[0];


            if(current_node.is_water() && !player.owned_technology.includes("Ship Building")){
                ServerSocket.something_wrong_response(socket, player, "INVALID MOVE", "You cannot move over water tiles without owning the Ship Building technology");
                return
            }


            // check if movement is valid or if move can be translated as attack
            if(current_node.unit != null){
                if(player.owns_this_unit(current_node.unit.id)){
                    ServerSocket.something_wrong_response(socket, player, "INVALID MOVE", "You cannot move over a friendly unit or city you can only attack")
                    return
                }
            }


            // for range attack units
            const destination = path[path.length - 1];
            if(destination.unit != null){
                if(!player.owns_this_unit(destination.unit.id) && this.range >= path.length) {
                    let path_cords: any = [];
                    path.map((node: Node)=>{
                        path_cords.push([node.x, node.y]);
                    })

                    ServerSocket.send_unit_attack(socket, game, player, destination.unit.id, this.id, new Path(game, path_cords))
                    return;
                }
            }

            // movement
            game.map.all_nodes[this.y][this.x].unit = null;

            current_node.unit = this;

            this.is_on_water = current_node.is_water()

            this.x = current_node.x;
            this.y = current_node.y;


            let all_discovered_nodes: NodeInterface[] = [];

            for(const node of current_node.neighbors){
                if(node != null){
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token))
                }
            }


            all_discovered_nodes.push(current_node.get_data(player.token));

            // find previously unseen enemy units
            for(const enemy_player of game.get_enemy_players(player.token)){
                for(const node of all_discovered_nodes){
                    if(node.unit == null) continue

                    for(const unit of enemy_player.units){
                        if(node.x === unit.x && node.y === unit.y){
                            // found new enemy unit by moving
                            ServerSocket.send_data(socket,
                                {
                                    response_type: ServerSocket.response_types.ENEMY_FOUND_RESPONSE,
                                    data: {
                                        unit: unit.get_data(),
                                    }
                                }, player.token)
                        }
                    }
                }
            }

            // show unit to player if the unit steps on a discovered node
            game.all_players.map((in_game_player: Player)=>{
                if(game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {

                    if (in_game_player.token === player.token) {
                        ServerSocket.send_unit_movement_to_owner(socket, this, all_discovered_nodes, in_game_player);
                    } else {
                        ServerSocket.send_unit_movement_to_all(socket, this, in_game_player);
                    }

                }else {
                    if (in_game_player.token !== player.token) {
                        ServerSocket.send_data_to_all(socket,
                            {
                                response_type: ServerSocket.response_types.ENEMY_UNIT_DISAPPEARED,
                                data: {
                                    unit: this.get_data(),
                                }
                            }, in_game_player.token)
                    }
                }
            })
            path.shift();
            this.move_along_path(game, player, socket, path);

        }, MOVEMENT_PER_A_MINUTE);
    }
    get_id(): string{
        return this.id;
    }

    get_x(){
        return this.x;
    }

    get_y(){
        return this.y;
    }

    get_data(): UnitInterface{
        return{
            id: this.id,
            x: this.x,
            y: this.y,

            type: this.type,
            action: this.action,

            is_on_water: this.is_on_water,

            attack: this.attack,
            health: this.health,
            range: this.range,
            movement: this.movement,
            name: this.name,
            cost: this.cost,
        }
    }
}