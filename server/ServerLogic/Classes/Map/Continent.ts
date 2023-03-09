import {Utils} from "../Utils";

import ContinentInterface from "../../Interfaces/Map/ContinentInterface";
import NodeInterface from "../../Interfaces/Map/NodeInterface";
import MapInterface from "../../Interfaces/Map/MapInterface";


export default class Continent implements ContinentInterface {

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

    constructor(name: string, map: MapInterface) {
        this.name = name;
        this.map = map;

        this.all_nodes = [];

        this.beach_nodes = [];
        this.forest_nodes = [];
        this.grass_nodes = [];
        this.mountain_nodes = [];
        this.river_nodes = [];
        this.lake_nodes = [];

        this.has_player = false;

    }

    addForestNode(node: NodeInterface): void {
        node.type = Utils.FOREST;
        node.production_stars = 1;

        node.sprite_name = "trees_" + Utils.randomInt(1, 2) + ".png";

        if (!this.forest_nodes.includes(node)) this.forest_nodes.push(node);
        if (!this.all_nodes.includes(node)) this.all_nodes.push(node);
    }

    removeForestNode(node: NodeInterface): void {
        node.sprite_name = "";
        this.forest_nodes.splice(this.forest_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.forest_nodes.indexOf(node), 1);
    }

    addGrassNode(node: NodeInterface): void {
        node.type = Utils.GRASS;
        node.production_stars = 1;

        node.sprite_name = "";

        if (!this.grass_nodes.includes(node)) this.grass_nodes.push(node);
        if (!this.grass_nodes.includes(node)) this.all_nodes.push(node);
    }

    removeGrassNode(node: NodeInterface): void {
        this.grass_nodes.splice(this.grass_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.grass_nodes.indexOf(node), 1);
    }

    addMountainNode(node: NodeInterface, mountain_type: number): void {
        node.type = Utils.MOUNTAIN;
        node.production_stars = 1;

        node.sprite_name = "mountain_" + Utils.randomInt(1, 3) + ".png"

        if (!this.mountain_nodes.includes(node)) this.mountain_nodes.push(node);
        if (!this.all_nodes.includes(node)) this.all_nodes.push(node);
    }

    removeMountainNode(node: NodeInterface): void {
        node.sprite_name = "";
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    }

    addAllRiverNodes(): void {
        this.all_nodes.map((node: NodeInterface) => {
            if (node.isRiver()) this.river_nodes.push(node);
        })
    }

    addLakeNode(node: NodeInterface): void {
        node.type = Utils.LAKE;
        node.sprite_name = "";
        this.lake_nodes.push(node);
        this.all_nodes.push(node);
    }

    removeLakeNode(node: NodeInterface): void {
        node.sprite_name = "";
        this.lake_nodes.splice(this.lake_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.lake_nodes.indexOf(node), 1);
    }

    getRandomRiverNode(): NodeInterface | undefined {
        return this.river_nodes[this.randomInt(0, this.river_nodes.length - 1)];
    }

    changeNodeTo(node: NodeInterface, new_type: number): void {
        if (node.type === new_type) return;

        switch (new_type) {
            case Utils.FOREST:
                // make forest more random and clustered together
                if (Math.random() <= (.2 + node.numberOfForestNeighbour() * .05)) {
                    this.addForestNode(node);
                } else {
                    this.addGrassNode(node);
                }
                break;
            case Utils.GRASS:
                this.addGrassNode(node);
                break;
            case Utils.MOUNTAIN:
                this.addMountainNode(node, Utils.NORMAL_MOUNTAIN);
                break;
            case Utils.LAKE:
                this.addLakeNode(node);
                break;
        }
    }

    getRandomNode(): NodeInterface | null {
        if (this.all_nodes.length === 0) return null;
        return this.all_nodes[this.randomInt(0, this.all_nodes.length - 1)];
    }

    getRandomBeachNode(): NodeInterface | undefined {
        if (this.beach_nodes.length === 0) return undefined;
        return this.beach_nodes[this.randomInt(0, this.beach_nodes.length - 1)];
    }

    getRandomNodeOfType(type: number): NodeInterface | undefined {
        switch (type) {
            case Utils.FOREST:
                if (this.forest_nodes.length === 0) return undefined;
                return this.forest_nodes[this.randomInt(0, this.forest_nodes.length - 1)];
            case Utils.GRASS:
                if (this.grass_nodes.length === 0) return undefined;
                return this.grass_nodes[this.randomInt(0, this.grass_nodes.length - 1)];
            case Utils.MOUNTAIN:
                if (this.mountain_nodes.length === 0) return undefined;
                return this.mountain_nodes[this.randomInt(0, this.mountain_nodes.length - 1)];
        }
    }

    // @TODO get rid of duplicate
    randomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}