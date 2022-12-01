"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ServerSocket_1 = require("../../ServerSocket");
var Unit = /** @class */ (function () {
    function Unit(x, y, id, type, speed) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.speed = speed;
        this.sight = 3;
    }
    // send response to public if the unit has successfully moved
    Unit.prototype.move_and_send_response = function (path, game, player, socket) {
        this.move_along_path(game, player, socket, path);
        // don't send invalid move
        // }else{
        //     ServerSocket.send_data(socket,
        //         {
        //         response_type: ServerSocket.response_types.INVALID_MOVE,
        //         data: {unit: this}
        //         },
        //         player.token)
        // }
    };
    // move this Unit along a valid path provided by the public
    Unit.prototype.move_along_path = function (game, player, socket, path) {
        var _this = this;
        if (path.length === 0)
            return;
        setTimeout(function () {
            var current_node = path[0];
            _this.x = current_node.x;
            _this.y = current_node.y;
            var all_discovered_nodes = [];
            for (var _i = 0, _a = current_node.neighbors; _i < _a.length; _i++) {
                var node = _a[_i];
                if (node != null) {
                    game.map.make_neighbour_nodes_shown(player, node);
                    all_discovered_nodes.push(node.get_data(player.token));
                }
            }
            all_discovered_nodes.push(current_node.get_data(player.token));
            ServerSocket_1.ServerSocket.send_data(socket, {
                response_type: ServerSocket_1.ServerSocket.response_types.UNIT_MOVED_RESPONSE,
                data: {
                    unit: _this.get_data(),
                    nodes: all_discovered_nodes
                }
            }, player.token);
            path.shift();
            _this.move_along_path(game, player, socket, path);
        }, this.speed);
    };
    Unit.prototype.get_id = function () {
        return this.id;
    };
    Unit.prototype.get_data = function () {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
        };
    };
    Unit.WATER = 0x80C5DE;
    Unit.CAVALRY = "CAVALRY";
    Unit.MELEE = "MELEE";
    Unit.RANGE = "RANGE";
    return Unit;
}());
exports.default = Unit;
