import City from "../../Classes/City/City";
import Player from "../../Classes/Player";
import Game from "../../Classes/Game";
import UnitInterface from "../Units/UnitInterface";

export default interface NodeInterface {

    neighbors: (NodeInterface | undefined)[]
    x: number;
    y: number;
    type: number | null;
    borders: any;
    production_stars: number;
    harvest_cost: number;
    is_harvested: boolean;
    is_shown: string[];
    city: City | null;
    unit: UnitInterface | null;
    parent: NodeInterface | null;
    sprite_name: string;

    addNeighbor(node: NodeInterface): void;

    getNeighborPosition(neighbor: NodeInterface): number;

    createRiver(border_side_start: number, border_side_end: number, direction_of_search: number, add_neighbouring_tile: boolean): any[];

    getNeighborOppositePosition(neighbor: NodeInterface): number | undefined;

    getRandomNeighbourInRange(min: number, max: number, type: number): NodeInterface | undefined;

    getRandomNeighbour(): NodeInterface;

    getRandomNeighbourOfType(type: number): NodeInterface | null;

    numberOfForestNeighbour(): number;

    isCoast(): boolean;

    isRiver(): boolean;

    isLake(): boolean;

    couldBeMountain(): boolean;

    randomInt(min: number, max: number): number;

    getDistanceToNode(node: NodeInterface): number;

    getXInPixels(): number;

    getYInPixels(): number;

    getXInUnits(): number;

    getYInUnits(): number;

    getHeuristicValue(player: Player | undefined, start_node: NodeInterface, goal_node: NodeInterface): any;

    harvest(player: Player, game: Game, socket: any): void;

    isWater(): boolean;

    getType(): string;

    getMovementTime(): number;

    getData(player_token: string): NodeInterface;
}