import Node from "../../Classes/Map/Node";
import Continent from "../../Classes/Map/Continent";

import NodeInterface from "./NodeInterface";
import PlayerInterface from "../PlayerInterface";

export default interface MapInterface {
    number_of_land_nodes: number;
    continent_size: number;
    side_length: number;
    number_of_continents: number;
    all_nodes: Node[][];
    all_continents: Continent[];
    all_beach_nodes: Node[];

    createNodes(): void;

    addNeighborsToNodes(): void;

    getNode(x: number, y: number): Node | undefined;

    generateIslandMap(): void;

    generateContinent(seed_x: number, seed_y: number, continent_size: number, continent_name: string): void;

    generateMountains(seed_x: number, seed_y: number, size: number, current_continent: Continent, mountain_type: number): void;

    generateRiver(continent: Continent): void;

    generateLakes(continent: Continent): void;

    printPosition(pos: number): string | undefined;

    switchPosition(pos: number): number | undefined;

    aStar(start_node: Node, goal_node: Node, player?: PlayerInterface): Node[] | null;

    format(player_token: string): any;

    shuffleArray(array: any[]): any[];

    getContinent(name: string): Continent | null;

    makeNeighbourNodesShown(player: PlayerInterface, node: NodeInterface | undefined): void;

    getNumberOfHiddenNodes(player_token:string): number
}