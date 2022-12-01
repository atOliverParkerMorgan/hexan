"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Path = /** @class */ (function () {
    function Path(game, path_cords_nodes) {
        this.path = [];
        for (var _i = 0, path_cords_nodes_1 = path_cords_nodes; _i < path_cords_nodes_1.length; _i++) {
            var node_cords = path_cords_nodes_1[_i];
            var node = game.map.get_node(node_cords[0], node_cords[1]);
            if (node == null) {
                console.trace("Error, invalid path");
                this.path = [];
                return;
            }
            this.path.push(node);
        }
    }
    Path.prototype.is_valid = function () {
        for (var i = 0; i < this.path.length - 1; i++) {
            if (!this.path[i].neighbors.includes(this.path[i + 1])) {
                return false;
            }
        }
        return true;
    };
    return Path;
}());
exports.default = Path;
// module.exports.Path = Path;
