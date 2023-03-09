import {Socket} from "socket.io";
import Player from "../../Classes/Player";
import NodeInterface from "../Map/NodeInterface";
import GameInterface from "../GameInterface";

export default interface CityInterface {
    owner: Player;
    x: number;
    y: number;
    cords_in_pixels_x: number;
    cords_in_pixels_y: number;
    name: string;
    can_be_harvested_nodes: NodeInterface[];
    harvested_nodes: NodeInterface[];
    population: number;
    number_of_harvested_nodes: number;

    produceUnitAndSendResponse(socket: Socket, unit_name: string, game: GameInterface): void;

    getXInPixels(): number;

    getYInPixels(): number;

    updateHarvestedNodes(): void;

    getHarvestCost(): number;

    addHarvestedNode(node: NodeInterface): void;

    getData(player_token: string): CityInterface;
}