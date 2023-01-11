// format of unit_data received from ClientSocket
import {Socket} from "socket.io";
import GameInterface from "../GameInterface";
import PlayerInterface from "../PlayerInterface";
import NodeInterface from "../Map/NodeInterface";
import MapInterface from "../Map/MapInterface";

export default interface UnitInterface {
    x: number;
    y: number;
    id: string;
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

    moveAndSendResponse(path: NodeInterface[], game: GameInterface, player: any, socket: Socket): void;

    moveAlongPath(game: GameInterface, player: PlayerInterface, socket: Socket, path: NodeInterface[]): void;
    moveAndSendResponse(path: NodeInterface[], game: GameInterface, player: PlayerInterface, socket: Socket): void;

    moveAlongPath(game: GameInterface, player: PlayerInterface, socket: Socket, path: NodeInterface[]): void;

    getClosestHiddenNode(map: MapInterface, owner: PlayerInterface): NodeInterface | undefined;

    getId(): string;

    getX(): any;

    getY(): any;

    getData(): UnitInterface;
}