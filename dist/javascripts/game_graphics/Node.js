"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = void 0;
var Pixi_js_1 = require("./Pixi.js");
var bottom_menu_1 = require("../bottom_menu");
var PIXI = __importStar(require("pixi.js"));
var ClientSocket_1 = require("../ClientSocket");
var Node = /** @class */ (function () {
    function Node(x, y, id, type, line_borders, city) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.opacity = 1;
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite = null;
        // -1 if this node doesn't have a city
        this.city = city;
        this.units = [];
        this.line_borders = [];
        this.line_borders_cords = [];
        this.add_node_to_stage();
        if (!this.is_hidden)
            this.set_border(Node.WATER, 5, 1, this.line_borders_cords);
        // used for A* searching algorithm
        this.parent = null;
        this.hex = null;
    }
    Node.prototype.get_neighbours = function () {
        var cords;
        if (this.y % 2 === 0) {
            cords = [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
        }
        else {
            cords = [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
        }
        var neighbours = [];
        for (var _i = 0, cords_1 = cords; _i < cords_1.length; _i++) {
            var cord = cords_1[_i];
            var x = this.x + cord[0];
            var y = this.y + cord[1];
            if (x >= 0 && y >= 0 && x < Node.all_nodes.length && y < Node.all_nodes.length) {
                neighbours.push(Node.all_nodes[y][x]);
            }
            else {
                neighbours.push(undefined);
            }
        }
        return neighbours;
    };
    Node.prototype.get_heuristic_value = function (start_node, goal_node) {
        var value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        if (this.is_hidden)
            return value;
        if (this.type === Node.WATER)
            return value + 1000;
        if (this.type === Node.MOUNTAIN)
            return value + Node.MOUNTAIN_TRAVEL_BIAS;
        return value;
    };
    Node.prototype.add_node_to_stage = function () {
        var _this = this;
        this.hex = new Pixi_js_1.Graphics();
        if (this.city != null)
            this.hex.beginFill(Node.CITY, this.opacity);
        else if (this.is_hidden)
            this.hex.beginFill(Node.HIDDEN, this.opacity);
        else
            this.hex.beginFill(this.type, this.opacity);
        // this.hex.drawRegularPolygon(this.get_x_in_pixels(), this.get_y_in_pixels(), HEX_SIDE_SIZE, 6, 0);
        this.hex.drawPolygon(this.get_x_in_pixels(), this.get_y_in_pixels(), Pixi_js_1.HEX_SIDE_SIZE, 6, 0);
        this.hex.endFill();
        this.hex.interactive = true;
        this.hex.on('pointerdown', function () { _this.on_click(); });
        this.hex.on('mouseover', function () { _this.set_hovered(); });
        // changing color of city
        Pixi_js_1.viewport.addChild(this.hex);
        if (this.city != null) {
            this.sprite = PIXI.Sprite.from("/images/village.png");
            this.sprite.width = Pixi_js_1.DISTANCE_BETWEEN_HEX * .7;
            this.sprite.height = Pixi_js_1.DISTANCE_BETWEEN_HEX * .7;
            this.sprite.x = this.get_x_in_pixels() - Pixi_js_1.DISTANCE_BETWEEN_HEX / 2.5;
            this.sprite.y = this.get_y_in_pixels() - Pixi_js_1.DISTANCE_BETWEEN_HEX / 2.5;
            Pixi_js_1.viewport.addChild(this.sprite);
        }
    };
    Node.prototype.get_distance_to_node = function (node) {
        return Math.sqrt(Math.pow((node.get_x_in_pixels() - this.get_x_in_pixels()), 2) + Math.pow((node.get_y_in_pixels() - this.get_y_in_pixels()), 2));
    };
    Node.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? Pixi_js_1.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Pixi_js_1.DISTANCE_BETWEEN_HEX + row_bias) - Pixi_js_1.WORLD_WIDTH / 2;
    };
    Node.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * Pixi_js_1.HEX_SIDE_SIZE) - Pixi_js_1.WORLD_HEIGHT / 2;
    };
    Node.prototype.get_unit_ids = function () {
        var all_unit_data = [];
        for (var _i = 0, _a = this.units; _i < _a.length; _i++) {
            var unit = _a[_i];
            all_unit_data.push(unit.id);
        }
        return all_unit_data;
    };
    Node.prototype.set_border = function (color, thickness, opacity, borders) {
        this.line_borders.forEach(function (line) { return line.clear(); });
        this.line_borders = [];
        var line = new Pixi_js_1.Graphics();
        line.beginFill(color, opacity);
        // drawing border lines
        for (var _i = 0, borders_1 = borders; _i < borders_1.length; _i++) {
            var border = borders_1[_i];
            var direction_bias = void 0;
            switch (border) {
                case Node.TOP_RIGHT:
                case Node.BOTTOM_LEFT:
                    direction_bias = border === Node.TOP_RIGHT ? 1 : -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(0, direction_bias * -Pixi_js_1.HEX_SIDE_SIZE)
                        .lineTo(direction_bias * Pixi_js_1.DISTANCE_BETWEEN_HEX / 2, direction_bias * -Pixi_js_1.HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    Pixi_js_1.viewport.addChild(line);
                    break;
                case Node.RIGHT:
                case Node.LEFT:
                    direction_bias = border === Node.RIGHT ? 1 : -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * Pixi_js_1.DISTANCE_BETWEEN_HEX / 2, direction_bias * -Pixi_js_1.HEX_SIDE_SIZE / 2)
                        .lineTo(direction_bias * Pixi_js_1.DISTANCE_BETWEEN_HEX / 2, direction_bias * Pixi_js_1.HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    Pixi_js_1.viewport.addChild(line);
                    break;
                case Node.BOTTOM_RIGHT:
                case Node.TOP_LEFT:
                    direction_bias = border === Node.BOTTOM_RIGHT ? 1 : -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * Pixi_js_1.DISTANCE_BETWEEN_HEX / 2, direction_bias * Pixi_js_1.HEX_SIDE_SIZE / 2)
                        .lineTo(0, direction_bias * Pixi_js_1.HEX_SIDE_SIZE);
                    this.line_borders.push(line);
                    Pixi_js_1.viewport.addChild(line);
            }
        }
    };
    Node.prototype.on_click = function () {
        var _a;
        // unit movement
        if (Node.selected_node != null) {
            if (Node.selected_node !== this && Node.selected_node.units.length > 0) {
                var to_node = Node.last_hovered_node;
                var node_from = Node.selected_node;
                // get cords of path to send to typescript application
                var path_node_cords = [];
                for (var _i = 0, _b = Node.path; _i < _b.length; _i++) {
                    var node = _b[_i];
                    path_node_cords.push([node.x, node.y]);
                }
                ClientSocket_1.ClientSocket.send_data({
                    request_type: ClientSocket_1.ClientSocket.request_types.MOVE_UNITS,
                    data: {
                        game_token: localStorage.game_token,
                        player_token: localStorage.player_token,
                        unit_ids: Node.selected_node.get_unit_ids(),
                        path: path_node_cords
                    }
                });
                to_node.update();
                node_from.update();
            }
        }
        Node.already_selected = this === Node.selected_node && !Node.already_selected;
        if (!Node.already_selected)
            (_a = Node.last_hovered_node) === null || _a === void 0 ? void 0 : _a.set_selected();
        else {
            this.remove_selected();
        }
        // show bottom information menu
        if (this.city != null && !Node.already_selected) {
            Node.bottom_menu_shown = !Node.bottom_menu_shown;
            // get bottom menu information
            ClientSocket_1.ClientSocket.socket.emit("get-data", {
                request_type: ClientSocket_1.ClientSocket.request_types.GET_MENU_INFO,
                data: {
                    game_token: localStorage.game_token,
                    player_token: localStorage.player_token,
                    city: this.city
                }
            });
            (0, bottom_menu_1.show_city_bottom_menu)(this.city);
        }
        else {
            (0, bottom_menu_1.hide_city_bottom_menu)();
        }
    };
    Node.prototype.set_type = function (type) {
        this.type = type;
        this.is_hidden = this.type === Node.HIDDEN;
        this.update();
    };
    Node.prototype.remove_selected = function () {
        if (Node.selected_line != null) {
            Pixi_js_1.viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = null;
        this.update();
    };
    Node.prototype.set_selected = function () {
        // clear all hint lines
        for (var _i = 0, _a = Node.movement_hint_lines; _i < _a.length; _i++) {
            var movement_hint_line = _a[_i];
            movement_hint_line.clear();
        }
        Node.movement_hint_lines = [];
        if (Node.selected_line != null) {
            Pixi_js_1.viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = this;
        Node.selected_line = new Pixi_js_1.Graphics();
        Node.selected_line.beginFill(Node.selected_color, Node.selected_opacity);
        // adding an outline to the node that is currently selected
        for (var i = 0, direction_bias = 1; i < 2; i++, direction_bias = -1) {
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(0, direction_bias * (-Pixi_js_1.HEX_SIDE_SIZE + Node.selected_thickness / 2))
                .lineTo(direction_bias * (Pixi_js_1.DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (-Pixi_js_1.HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2));
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (Pixi_js_1.DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (-Pixi_js_1.HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2))
                .lineTo(direction_bias * (Pixi_js_1.DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (Pixi_js_1.HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2));
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (Pixi_js_1.DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (Pixi_js_1.HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2))
                .lineTo(0, direction_bias * (Pixi_js_1.HEX_SIDE_SIZE - Node.selected_thickness / 2));
        }
        Pixi_js_1.viewport.addChild(Node.selected_line);
    };
    Node.prototype.set_hovered = function () {
        function set_last_node_hovered(this_node) {
            Node.last_hovered_node = this_node;
            this_node.opacity = .5;
            this_node.update();
        }
        // restores last node to original value
        if (Node.last_hovered_node != null) {
            if (Node.last_hovered_node.x !== this.x || Node.last_hovered_node.y !== this.y) {
                Node.last_hovered_node.opacity = 1;
                Node.last_hovered_node.update();
                // sets new node (this node) to hovered
                set_last_node_hovered(this);
                if (Node.selected_node != null) {
                    if (Node.selected_node.units.length > 0) {
                        if (Node.movement_hint_lines.length > 0) {
                            for (var _i = 0, _a = Node.movement_hint_lines; _i < _a.length; _i++) {
                                var movement_hint_line = _a[_i];
                                movement_hint_line.clear();
                            }
                            Node.movement_hint_lines = [];
                        }
                        Node.path = (0, Pixi_js_1.a_star)(Node.selected_node, Node.last_hovered_node);
                        if (Node.path == null)
                            return;
                        var last_node = Node.selected_node;
                        for (var i = 1; i < Node.path.length; i++) {
                            var movement_hint_line = new Pixi_js_1.Graphics();
                            Pixi_js_1.viewport.addChild(movement_hint_line);
                            var last_x = last_node.get_x_in_pixels();
                            var last_y = last_node.get_y_in_pixels();
                            var current_x = Node.path[i].get_x_in_pixels();
                            var current_y = Node.path[i].get_y_in_pixels();
                            if (i === 1) {
                                movement_hint_line.position.set((last_x + current_x) / 2, (last_y + current_y) / 2);
                                movement_hint_line.lineStyle(Node.movement_hint_thickness, Node.movement_hint_color)
                                    .moveTo(0, 0)
                                    .lineTo((current_x - last_x) / 2, (current_y - last_y) / 2);
                            }
                            else {
                                movement_hint_line.position.set(last_x, last_y);
                                movement_hint_line.lineStyle(Node.movement_hint_thickness, Node.movement_hint_color)
                                    .moveTo(0, 0)
                                    .lineTo(current_x - last_x, current_y - last_y);
                            }
                            Node.movement_hint_lines.push(movement_hint_line);
                            last_node = Node.path[i];
                        }
                    }
                }
            }
        }
        // initial hover - no previous node
        else {
            set_last_node_hovered(this);
        }
    };
    Node.prototype.update = function () {
        var _a;
        (_a = this.hex) === null || _a === void 0 ? void 0 : _a.clear();
        this.add_node_to_stage();
        for (var _i = 0, _b = this.units; _i < _b.length; _i++) {
            var unit = _b[_i];
            unit.add_unit_to_stage();
        }
        if (this === Node.selected_node)
            this.set_selected();
        if (!this.is_hidden)
            this.set_border(Node.WATER, 5, 1, this.line_borders_cords);
    };
    // types of nodes displayed as colors
    Node.WATER = 0x80C5DE;
    Node.GRASS = 0x7FFF55;
    Node.BEACH = 0xFFFF00;
    Node.MOUNTAIN = 0xF2F2F2;
    Node.HIDDEN = 0xE0D257;
    Node.CITY = 0xF53E3E;
    Node.LEFT = 0;
    Node.RIGHT = 1;
    Node.TOP_LEFT = 2;
    Node.TOP_RIGHT = 3;
    Node.BOTTOM_LEFT = 4;
    Node.BOTTOM_RIGHT = 5;
    Node.MOUNTAIN_TRAVEL_BIAS = 10;
    Node.last_hovered_node = null;
    Node.selected_node = null;
    Node.selected_color = 0xFFAC1C;
    Node.selected_opacity = 1;
    Node.selected_thickness = 4;
    Node.movement_hint_lines = [];
    Node.movement_hint_color = 0xFFAC1C;
    Node.movement_hint_opacity = 1;
    Node.movement_hint_thickness = 3;
    Node.bottom_menu_shown = false;
    Node.already_selected = false;
    Node.all_nodes = [];
    return Node;
}());
exports.Node = Node;
