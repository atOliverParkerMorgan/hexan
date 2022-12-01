"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Node_1 = require("./Node");
var Continent = /** @class */ (function () {
    function Continent(name, map) {
        this.name = name;
        this.map = map;
        this.all_nodes = [];
        this.grass_nodes = [];
        this.beach_nodes = [];
        this.mountain_nodes = [];
        this.has_player = false;
    }
    Continent.prototype.add_grass_node = function (node) {
        node.type = Node_1.Node.GRASS;
        this.grass_nodes.push(node);
        this.all_nodes.push(node);
    };
    Continent.prototype.remove_grass_node = function (node) {
        this.grass_nodes.splice(this.grass_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.grass_nodes.indexOf(node), 1);
    };
    Continent.prototype.add_beach_node = function (node) {
        node.type = Node_1.Node.BEACH;
        this.beach_nodes.push(node);
        this.all_nodes.push(node);
    };
    Continent.prototype.remove_beach_node = function (node) {
        this.beach_nodes.splice(this.beach_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.beach_nodes.indexOf(node), 1);
    };
    Continent.prototype.add_mountain_node = function (node) {
        node.type = Node_1.Node.MOUNTAIN;
        this.mountain_nodes.push(node);
        this.all_nodes.push(node);
    };
    Continent.prototype.remove_mountain_node = function (node) {
        this.mountain_nodes.splice(this.mountain_nodes.indexOf(node), 1);
        this.all_nodes.splice(this.mountain_nodes.indexOf(node), 1);
    };
    Continent.prototype.get_random_river_node = function () {
        var all_river_nodes = [];
        for (var _i = 0, _a = this.all_nodes; _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.is_river())
                all_river_nodes.push(node);
        }
        return all_river_nodes[this.random_int(0, all_river_nodes.length - 1)];
    };
    Continent.prototype.change_node_to = function (node, new_type) {
        if (node.type === new_type)
            return;
        var old_type = node.type;
        switch (new_type) {
            case Node_1.Node.GRASS:
                this.add_grass_node(node);
                break;
            case Node_1.Node.BEACH:
                this.add_beach_node(node);
                break;
            case Node_1.Node.MOUNTAIN:
                this.add_mountain_node(node);
                break;
        }
        switch (old_type) {
            case Node_1.Node.GRASS:
                this.remove_grass_node(node);
                break;
            case Node_1.Node.BEACH:
                this.remove_beach_node(node);
                break;
            case Node_1.Node.MOUNTAIN:
                this.remove_mountain_node(node);
                break;
        }
    };
    Continent.prototype.get_random_node = function () {
        if (this.all_nodes.length === 0)
            return null;
        return this.all_nodes[this.random_int(0, this.all_nodes.length - 1)];
    };
    Continent.prototype.get_random_node_of_type = function (type) {
        switch (type) {
            case Node_1.Node.GRASS:
                if (this.grass_nodes.length === 0)
                    return undefined;
                return this.grass_nodes[this.random_int(0, this.grass_nodes.length - 1)];
            case Node_1.Node.BEACH:
                if (this.beach_nodes.length === 0)
                    return undefined;
                return this.beach_nodes[this.random_int(0, this.beach_nodes.length - 1)];
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
    return Continent;
}());
exports.default = Continent;
// module.exports = Continent;
