import MapInterface from "./MapInterface";
import NodeInterface from "./NodeInterface";

export default interface ContinentInterface {
    name: string;
    map: MapInterface;
    has_player: boolean;
    all_nodes: NodeInterface[];
    beach_nodes: NodeInterface[];
    forest_nodes: NodeInterface[];
    grass_nodes: NodeInterface[];
    mountain_nodes: NodeInterface[];
    river_nodes: NodeInterface[];
    lake_nodes: NodeInterface[];

    addForestNode(node: NodeInterface): void;

    removeForestNode(node: NodeInterface): void;

    addGrassNode(node: NodeInterface): void;

    removeGrassNode(node: NodeInterface): void;

    addMountainNode(node: NodeInterface, mountain_type: number): void;

    removeMountainNode(node: NodeInterface): void;

    addAllRiverNodes(): void;

    addLakeNode(node: NodeInterface): void;

    removeLakeNode(node: NodeInterface): void;

    getRandomRiverNode(): NodeInterface | undefined;

    changeNodeTo(node: NodeInterface, new_type: number): void;

    getRandomNode(): NodeInterface | null;

    getRandomBeachNode(): NodeInterface | undefined;

    getRandomNodeOfType(type: number): NodeInterface | undefined;

    randomInt(min: number, max: number): number;
}