"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class Continent {
    constructor(name, map) {
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
    addForestNode(node) {
        node.type = Utils_1.Utils.FOREST;
        node.production_stars = 2;
        node.sprite_name = "trees_" + Utils_1.Utils.randomInt(1, 2) + ".png";
        if (!this.forest_nodes.includes(node))
            this.forest_nodes.push(node);
        if (!this.all_nodes.includes(node))
            this.all_nodes.push(node);
    }
    removeForestNode(node) {
        node.sprite_name = "";
        this.forest_nodes.splice(this.forest_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.forest_nodes.indexOf(node), 1);
    }
    addGrassNode(node) {
        node.type = Utils_1.Utils.GRASS;
        node.production_stars = 1;
        node.sprite_name = "";
        if (!this.grass_nodes.includes(node))
            this.grass_nodes.push(node);
        if (!this.grass_nodes.includes(node))
            this.all_nodes.push(node);
    }
    removeGrassNode(node) {
        this.grass_nodes.splice(this.grass_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.grass_nodes.indexOf(node), 1);
    }
    addMountainNode(node, mountain_type) {
        node.type = Utils_1.Utils.MOUNTAIN;
        node.production_stars = 3;
        node.sprite_name = "mountain_" + Utils_1.Utils.randomInt(1, 3) + ".png";
        if (!this.mountain_nodes.includes(node))
            this.mountain_nodes.push(node);
        if (!this.all_nodes.includes(node))
            this.all_nodes.push(node);
    }
    removeMountainNode(node) {
        node.sprite_name = "";
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    }
    addAllRiverNodes() {
        this.all_nodes.map((node) => {
            if (node.isRiver())
                this.river_nodes.push(node);
        });
    }
    addLakeNode(node) {
        node.type = Utils_1.Utils.LAKE;
        node.sprite_name = "";
        this.lake_nodes.push(node);
        this.all_nodes.push(node);
    }
    removeLakeNode(node) {
        node.sprite_name = "";
        this.lake_nodes.splice(this.lake_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.lake_nodes.indexOf(node), 1);
    }
    getRandomRiverNode() {
        return this.river_nodes[this.randomInt(0, this.river_nodes.length - 1)];
    }
    changeNodeTo(node, new_type) {
        if (node.type === new_type)
            return;
        switch (new_type) {
            case Utils_1.Utils.FOREST:
                // make forest more random and clustered together
                if (Math.random() <= (.2 + node.numberOfForestNeighbour() * .05)) {
                    this.addForestNode(node);
                }
                else {
                    this.addGrassNode(node);
                }
                break;
            case Utils_1.Utils.GRASS:
                this.addGrassNode(node);
                break;
            case Utils_1.Utils.MOUNTAIN:
                this.addMountainNode(node, Utils_1.Utils.NORMAL_MOUNTAIN);
                break;
            case Utils_1.Utils.LAKE:
                this.addLakeNode(node);
                break;
        }
    }
    getRandomNode() {
        if (this.all_nodes.length === 0)
            return null;
        return this.all_nodes[this.randomInt(0, this.all_nodes.length - 1)];
    }
    getRandomBeachNode() {
        if (this.beach_nodes.length === 0)
            return undefined;
        return this.beach_nodes[this.randomInt(0, this.beach_nodes.length - 1)];
    }
    getRandomNodeOfType(type) {
        switch (type) {
            case Utils_1.Utils.FOREST:
                if (this.forest_nodes.length === 0)
                    return undefined;
                return this.forest_nodes[this.randomInt(0, this.forest_nodes.length - 1)];
            case Utils_1.Utils.GRASS:
                if (this.grass_nodes.length === 0)
                    return undefined;
                return this.grass_nodes[this.randomInt(0, this.grass_nodes.length - 1)];
            case Utils_1.Utils.MOUNTAIN:
                if (this.mountain_nodes.length === 0)
                    return undefined;
                return this.mountain_nodes[this.randomInt(0, this.mountain_nodes.length - 1)];
        }
    }
    // @TODO get rid of duplicate
    randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
exports.default = Continent;
Continent.NUMBER_OF_MOUNTAIN_SPRITES = 5;
