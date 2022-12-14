"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils_1 = require("../../../Utils");
var Map_1 = __importDefault(require("./Map"));
var Node_1 = require("./Node");
var Continent = /** @class */ (function () {
    function Continent(name, map) {
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
    Continent.prototype.add_forest_node = function (node) {
        node.type = Node_1.Node.FOREST;
        node.production_stars = 2;
        node.sprite_name = "trees_" + Utils_1.Utils.random_int(1, 2) + ".png";
        if (!this.forest_nodes.includes(node))
            this.forest_nodes.push(node);
        if (!this.all_nodes.includes(node))
            this.all_nodes.push(node);
    };
    Continent.prototype.remove_forest_node = function (node) {
        node.sprite_name = "";
        this.forest_nodes.splice(this.forest_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.forest_nodes.indexOf(node), 1);
    };
    Continent.prototype.add_grass_node = function (node) {
        node.type = Node_1.Node.GRASS;
        node.production_stars = 1;
        node.sprite_name = "";
        if (!this.grass_nodes.includes(node))
            this.grass_nodes.push(node);
        if (!this.grass_nodes.includes(node))
            this.all_nodes.push(node);
    };
    Continent.prototype.remove_grass_node = function (node) {
        this.grass_nodes.splice(this.grass_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.grass_nodes.indexOf(node), 1);
    };
    Continent.prototype.add_mountain_node = function (node, mountain_type) {
        node.type = Node_1.Node.MOUNTAIN;
        node.production_stars = 3;
        node.sprite_name = "mountain_" + Utils_1.Utils.random_int(1, 3) + ".png";
        if (!this.mountain_nodes.includes(node))
            this.mountain_nodes.push(node);
        if (!this.all_nodes.includes(node))
            this.all_nodes.push(node);
    };
    Continent.prototype.remove_mountain_node = function (node) {
        node.sprite_name = "";
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    };
    Continent.prototype.add_all_river_nodes = function () {
        var _this = this;
        this.all_nodes.map(function (node) {
            if (node.is_river())
                _this.river_nodes.push(node);
        });
    };
    Continent.prototype.add_lake_node = function (node) {
        node.type = Node_1.Node.LAKE;
        node.sprite_name = "";
        this.lake_nodes.push(node);
        this.all_nodes.push(node);
    };
    Continent.prototype.remove_lake_node = function (node) {
        node.sprite_name = "";
        this.lake_nodes.splice(this.lake_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.lake_nodes.indexOf(node), 1);
    };
    Continent.prototype.get_random_river_node = function () {
        return this.river_nodes[this.random_int(0, this.river_nodes.length - 1)];
    };
    Continent.prototype.change_node_to = function (node, new_type) {
        if (node.type === new_type)
            return;
        switch (new_type) {
            case Node_1.Node.FOREST:
                // make forest more random and clustered together
                if (Math.random() <= (.2 + node.number_of_forest_neighbour() * .05)) {
                    this.add_forest_node(node);
                }
                else {
                    this.add_grass_node(node);
                }
                break;
            case Node_1.Node.GRASS:
                this.add_grass_node(node);
                break;
            case Node_1.Node.MOUNTAIN:
                this.add_mountain_node(node, Map_1.default.NORMAL_MOUNTAIN);
                break;
            case Node_1.Node.LAKE:
                this.add_lake_node(node);
                break;
        }
    };
    Continent.prototype.get_random_node = function () {
        if (this.all_nodes.length === 0)
            return null;
        return this.all_nodes[this.random_int(0, this.all_nodes.length - 1)];
    };
    Continent.prototype.get_random_beach_node = function () {
        if (this.beach_nodes.length === 0)
            return undefined;
        return this.beach_nodes[this.random_int(0, this.beach_nodes.length - 1)];
    };
    Continent.prototype.get_random_node_of_type = function (type) {
        switch (type) {
            case Node_1.Node.FOREST:
                if (this.forest_nodes.length === 0)
                    return undefined;
                return this.forest_nodes[this.random_int(0, this.forest_nodes.length - 1)];
            case Node_1.Node.GRASS:
                if (this.grass_nodes.length === 0)
                    return undefined;
                return this.grass_nodes[this.random_int(0, this.grass_nodes.length - 1)];
            case Node_1.Node.MOUNTAIN:
                if (this.mountain_nodes.length === 0)
                    return undefined;
                return this.mountain_nodes[this.random_int(0, this.mountain_nodes.length - 1)];
        }
    };
    // @TODO get rid of duplicate
    Continent.prototype.random_int = function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    Continent.NUMBER_OF_MOUNTAIN_SPRITES = 5;
    return Continent;
}());
exports.default = Continent;
// module.exports = Continent;
