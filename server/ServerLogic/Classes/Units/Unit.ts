import {Socket} from "socket.io";
import {ServerSocket} from "../ServerSocket";

import UnitInitData from "./UnitInitData";
import NodeInterface from "../../Interfaces/Map/NodeInterface";
import UnitInterface from "../../Interfaces/Units/UnitInterface";

import Path from "../Map/Path";
import MapInterface from "../../Interfaces/Map/MapInterface";
import GameInterface from "../../Interfaces/GameInterface";
import PlayerInterface from "../../Interfaces/PlayerInterface";
import {App} from "../../../app";
import {MatchMaker} from "../MatchMaker";

export default class Unit implements UnitInterface{
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
    range: number;
    name: string;
    cost: number;

    constructor(x: number, y: number, id: string, map: MapInterface, unit_init_data: UnitInitData){
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
    moveAndSendResponse(path: NodeInterface[], game: GameInterface, player: PlayerInterface, socket: Socket) {
        // remove first element
        path.shift()
        this.moveAlongPath(game, player, socket, path);
    }

    // move this Unit along a valid path provided by the client
    moveAlongPath(game: GameInterface, player: PlayerInterface, socket: Socket, path: NodeInterface[]): void {

        // used at the end of the path
        let MOVEMENT_PER_A_MINUTE: number = 1;

        // movement per a minute calculation
        if (path.length !== 0) MOVEMENT_PER_A_MINUTE = path[0].getMovementTime() / (this.movement / 100)

        setTimeout(() => {
            if (path.length === 0) {
                return;
            }

            const current_node: NodeInterface = path[0];


            if (current_node.isWater() && !player.owned_technology.includes("Ship Building")) {
                ServerSocket.somethingWrongResponse(socket, player.token, "INVALID MOVE", "You cannot move over water tiles without owning the Ship Building technology");
                return
            }


            // check if movement is valid or if move can be translated as attack
            if (current_node.unit != null) {
                if (player.ownsThisUnit(current_node.unit.id)) {
                    ServerSocket.somethingWrongResponse(socket, player.token, "INVALID MOVE", "You cannot move over a friendly unit you can only attack an enemy unit.")
                    return
                }
            }


            // for range attack units
            const destination = path[path.length - 1];
            if (destination.unit != null) {
                if (!player.ownsThisUnit(destination.unit.id) && this.range >= path.length) {
                    let path_cords: any = [];
                    path.map((node: NodeInterface) => {
                        path_cords.push([node.x, node.y]);
                    })

                    ServerSocket.sendUnitAttack(socket, game, player, destination.unit.id, this.id, new Path(game, path_cords))
                    return;
                }
            }

            // movement
            game.map.all_nodes[this.y][this.x].unit = null;

            current_node.unit = this;

            this.is_on_water = current_node.isWater()

            this.x = current_node.x;
            this.y = current_node.y;


            let all_discovered_nodes: NodeInterface[] = [];

            for (const node of current_node.neighbors) {
                if (node != null) {
                    game.map.makeNeighbourNodesShown(player, node);
                    all_discovered_nodes.push(node.getData(player.token))
                }
            }


            all_discovered_nodes.push(current_node.getData(player.token));

            // find previously unseen enemy units
            for (const enemy_player of game.getEnemyPlayers(player.token)) {
                for (const node of all_discovered_nodes) {
                    if (node.unit == null) continue

                    for (const unit of enemy_player.units) {
                        if (node.x === unit.x && node.y === unit.y) {
                            // found new enemy unit by moving
                            ServerSocket.sendData(socket, ServerSocket.response_types.ENEMY_FOUND_RESPONSE, {
                                        unit: unit.getData(),
                                    })
                        }
                    }
                }
            }

            let city_node: NodeInterface = game.map.all_nodes[this.y][this.x];

            if (city_node.city != null && city_node?.city?.owner.token != player.token) {
                city_node.city.owner = player;
                let is_conquered = false;

                game.all_players.map((in_game_player: any) => {
                    if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                        ServerSocket.sendConqueredCity(socket, game, in_game_player, <any>city_node.city, this);
                        is_conquered = true;
                    }
                });
                if (is_conquered) {
                    // if win condition disconnect players
                    App.io.sockets.sockets.get(game.getEnemyPlayers(player.token)[0].token).disconnect();
                    socket.disconnect();

                    MatchMaker.all_games.delete(game.token)

                    return;
                }
            }

            // show unit to player if the unit steps on a discovered node
            game.all_players.map((in_game_player: any) => {
                if (game.map.all_nodes[this.y][this.x].is_shown.includes(in_game_player.token)) {
                    if (in_game_player.token === player.token) {
                        ServerSocket.sendUnitMovementToOwner(socket, this, all_discovered_nodes, in_game_player);
                    } else {
                        ServerSocket.sendUnitMovementToAll(socket, this, in_game_player, game.token);
                    }

                } else {
                    if (in_game_player.token !== player.token) {
                        ServerSocket.sendDataToAll(socket, game.token, ServerSocket.response_types.ENEMY_UNIT_DISAPPEARED,
                                {
                                    unit: this.getData(),
                                })
                    }
                }
            })
            path.shift();
            this.moveAlongPath(game, player, socket, path);

        }, MOVEMENT_PER_A_MINUTE);
    }

    getId(): string {
        return this.id;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    // get rid of methods when sending object threw socket
    getData(): any {
        return {
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