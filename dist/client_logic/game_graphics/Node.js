import { a_star, DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, Graphics, WORLD_HEIGHT, WORLD_WIDTH, viewport } from "./Pixi.js";
import { hide_city_menu, hide_unit_info, show_unit_info, show_node_info, hide_node_info } from "../UI_logic.js";
import { City } from "./City/City.js";
import { ClientSocket } from "../ClientSocket.js";
import { Player } from "./Player.js";
var Node = /** @class */ (function () {
    function Node(x, y, id, type, line_borders_cords, city, sprite_name, harvest_cost, production_stars, is_harvested) {
        this.x = x;
        this.y = y;
        this.id = id;
        // null if node is city
        this.type = type;
        this.opacity = 1;
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite = null;
        this.stars_sprite = null;
        this.harvest_cost = harvest_cost;
        this.production_stars = production_stars;
        this.is_harvested = is_harvested;
        // null if this node doesn't have a city
        this.city = city;
        this.unit = null;
        this.line_borders = [];
        this.line_borders_cords = line_borders_cords;
        this.sprite_name = sprite_name;
        if (!this.is_hidden)
            this.set_border(Node.LAKE, 5, 1, this.line_borders_cords);
        // used for A* searching algorithm
        this.parent = null;
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
    Node.prototype.get_valid_movement_neighbours = function () {
        var valid_movement_neighbours = [];
        var neighbours = this.get_neighbours();
        neighbours.map(function (neighbour) {
            if (neighbour == null)
                return;
            if ((neighbour.type === Node.OCEAN || neighbour.type === Node.LAKE) && !Player.owned_technologies.includes("Ship Building"))
                return;
            valid_movement_neighbours.push(neighbour);
        });
        return valid_movement_neighbours;
    };
    Node.prototype.get_heuristic_value = function (start_node, goal_node) {
        var value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        return value + this.get_movement_time();
    };
    Node.prototype.add_node_to_stage = function () {
        var _this = this;
        // draw hex
        this.hex = new Graphics();
        if (this.city != null)
            this.hex.beginFill(this.city.get_node_color(), this.opacity);
        else if (this.is_hidden)
            this.hex.beginFill(Node.HIDDEN, this.opacity);
        else {
            if (this.can_be_harvested())
                this.hex.beginFill(Node.CAN_BE_HARVESTED, this.opacity);
            else if (this.is_harvested)
                this.hex.beginFill(Node.HARVESTED, this.opacity);
            else
                this.hex.beginFill(this.type, this.opacity);
        }
        this.hex.drawRegularPolygon(this.get_x_in_pixels(), this.get_y_in_pixels(), HEX_SIDE_SIZE, 6, 0);
        this.hex.endFill();
        this.hex.interactive = true;
        this.hex.button = true;
        this.hex.on('click', function () {
            _this.on_click();
        });
        this.hex.on('mouseover', function () { _this.set_hovered(); });
        viewport.addChild(this.hex);
        this.show_city(this.city);
        // draw node sprite
        this.show_sprite();
    };
    Node.prototype.show_city = function (city) {
        this.city = city;
    };
    Node.prototype.show_sprite = function () {
        if (this.sprite_name === "") {
            return;
        }
        // @ts-ignore
        this.sprite = PIXI.Sprite.from("/images/" + this.sprite_name);
        this.sprite.width = DISTANCE_BETWEEN_HEX * .7;
        this.sprite.height = DISTANCE_BETWEEN_HEX * .7;
        this.sprite.x = this.get_x_in_pixels() - DISTANCE_BETWEEN_HEX / 2.5;
        this.sprite.y = this.get_y_in_pixels() - DISTANCE_BETWEEN_HEX / 2.5;
        viewport.addChild(this.sprite);
    };
    Node.prototype.get_movement_time = function () {
        switch (this.type) {
            case Node.MOUNTAIN:
                return 4000;
            case Node.FOREST:
                return 2000;
            case Node.OCEAN:
                return 1000;
            case Node.LAKE:
                return 1000;
        }
        // GRASS
        return 1000;
    };
    Node.prototype.get_distance_to_node = function (node) {
        return Math.sqrt(Math.pow((node.get_x_in_pixels() - this.get_x_in_pixels()), 2) + Math.pow((node.get_y_in_pixels() - this.get_y_in_pixels()), 2));
    };
    Node.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    };
    Node.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
    };
    Node.prototype.get_unit_id = function () {
        var _a;
        return (_a = this.unit) === null || _a === void 0 ? void 0 : _a.id;
    };
    Node.prototype.set_border = function (color, thickness, opacity, borders) {
        this.line_borders.forEach(function (line) { return line.clear(); });
        this.line_borders = [];
        var line = new Graphics();
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
                        .moveTo(0, direction_bias * -HEX_SIDE_SIZE)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * -HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case Node.RIGHT:
                case Node.LEFT:
                    direction_bias = border === Node.RIGHT ? 1 : -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * -HEX_SIDE_SIZE / 2)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case Node.BOTTOM_RIGHT:
                case Node.TOP_LEFT:
                    direction_bias = border === Node.BOTTOM_RIGHT ? 1 : -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * HEX_SIDE_SIZE / 2)
                        .lineTo(0, direction_bias * HEX_SIDE_SIZE);
                    this.line_borders.push(line);
                    viewport.addChild(line);
            }
        }
    };
    Node.prototype.on_click = function () {
        var _a, _b;
        var is_moving_unit = false;
        // unit movement on second click (after selecting unit)
        if (Node.selected_node != null) {
            if (Node.selected_node !== this && Node.selected_node.unit != null && Node.selected_node.unit.is_friendly) {
                console.log((_a = Node.last_hovered_node) === null || _a === void 0 ? void 0 : _a.unit);
                // cannot move without hovering on above a node
                if (Node.last_hovered_node == null)
                    return;
                is_moving_unit = true;
                var to_node = Node.last_hovered_node;
                var node_from = Node.selected_node;
                // get cords of path to send to typescript application
                if (Node.path == null)
                    return;
                var path_node_cords = [];
                for (var _i = 0, _c = Node.path; _i < _c.length; _i++) {
                    var node = _c[_i];
                    path_node_cords.push([node.x, node.y]);
                }
                show_unit_info(Node.selected_node.unit);
                // send movement request to server
                ClientSocket.request_move_unit(Node.selected_node.unit, path_node_cords);
                to_node.update();
                node_from.update();
            }
        }
        Node.already_selected = this === Node.selected_node && !Node.already_selected;
        if (!Node.already_selected)
            (_b = Node.last_hovered_node) === null || _b === void 0 ? void 0 : _b.set_selected();
        else {
            this.remove_selected();
        }
        // show bottom information menu
        if (this.city != null && !Node.already_selected) {
            Node.bottom_menu_shown = !Node.bottom_menu_shown;
            // get bottom menu information
            ClientSocket.socket.emit("get_data", {
                request_type: ClientSocket.request_types.GET_MENU_INFO,
                data: {
                    game_token: localStorage.game_token,
                    player_token: localStorage.player_token,
                    city: this.city
                }
            });
        }
        else {
            hide_city_menu();
        }
        // unit info
        if (this.unit != null && !Node.already_selected) {
            if (this.unit.is_friendly) {
                show_unit_info(this.unit);
            }
        }
        else if (!is_moving_unit) {
            hide_unit_info();
        }
        // show node data
        if (this.unit == null && this.city == null) {
            show_node_info(this);
        }
        else {
            hide_node_info();
        }
    };
    Node.prototype.set_city = function (city_data, sprite_name) {
        this.city = new City(city_data);
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite_name = sprite_name;
        Player.all_cities.push(this.city);
        this.update();
        this.show_sprite();
    };
    Node.prototype.set_type = function (type, sprite_name) {
        this.type = type;
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite_name = sprite_name;
        this.update();
    };
    Node.prototype.get_type_string = function () {
        switch (this.type) {
            case Node.FOREST:
                return "Planes";
            case Node.MOUNTAIN:
                return "Mountains";
            case Node.GRASS:
                return "Beach";
            case Node.LAKE:
                return "Lake";
            case Node.OCEAN:
                return "Ocean";
        }
        return "Unknown";
    };
    Node.prototype.remove_selected = function () {
        if (Node.selected_line != null) {
            viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = null;
        this.update();
    };
    Node.prototype.remove_unit = function () {
        var _a;
        (_a = this.unit) === null || _a === void 0 ? void 0 : _a.remove_children();
        this.unit = null;
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
            viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = this;
        Node.selected_line = new Graphics();
        Node.selected_line.beginFill(Node.selected_color, Node.selected_opacity);
        // adding an outline to the node that is currently selected
        for (var i = 0, direction_bias = 1; i < 2; i++, direction_bias = -1) {
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(0, direction_bias * (-HEX_SIDE_SIZE + Node.selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (-HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2));
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (-HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2));
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2))
                .lineTo(0, direction_bias * (HEX_SIDE_SIZE - Node.selected_thickness / 2));
        }
        viewport.addChild(Node.selected_line);
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
                    if (Node.selected_node.unit != null && Node.selected_node.unit.is_friendly) {
                        if (Node.movement_hint_lines.length > 0) {
                            for (var _i = 0, _a = Node.movement_hint_lines; _i < _a.length; _i++) {
                                var movement_hint_line = _a[_i];
                                movement_hint_line.clear();
                            }
                            Node.movement_hint_lines = [];
                        }
                        Node.path = a_star(Node.selected_node, Node.last_hovered_node);
                        if (Node.path == null || Node.path.length === 0)
                            return;
                        var last_node = Node.selected_node;
                        for (var i = 1; i < Node.path.length; i++) {
                            var movement_hint_line = new Graphics();
                            viewport.addChild(movement_hint_line);
                            var last_x = last_node.get_x_in_pixels();
                            var last_y = last_node.get_y_in_pixels();
                            var current_x = Node.path[i].get_x_in_pixels();
                            var current_y = Node.path[i].get_y_in_pixels();
                            var path_color = void 0;
                            if (Node.last_hovered_node.unit != null) {
                                // if unit is friendly
                                if (Node.last_hovered_node.unit.is_friendly)
                                    return;
                                // if the unit is out of range don't show any attack or movement hint
                                if (Node.selected_node.unit.range >= Node.path.length - i) {
                                    path_color = Node.attack_hint_color;
                                }
                                else {
                                    path_color = Node.movement_hint_color;
                                }
                            }
                            else {
                                path_color = Node.movement_hint_color;
                            }
                            if (i === 1) {
                                movement_hint_line.position.set((last_x + current_x) / 2, (last_y + current_y) / 2);
                                movement_hint_line.lineStyle(Node.movement_hint_thickness, path_color)
                                    .moveTo(0, 0)
                                    .lineTo((current_x - last_x) / 2, (current_y - last_y) / 2);
                            }
                            else {
                                movement_hint_line.position.set(last_x, last_y);
                                movement_hint_line.lineStyle(Node.movement_hint_thickness, path_color)
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
    Node.prototype.can_be_harvested = function () {
        if (this.is_harvested || this.city != null)
            return false;
        var harvested_neighbours = 0;
        for (var _i = 0, _a = this.get_neighbours(); _i < _a.length; _i++) {
            var neighbour = _a[_i];
            if ((neighbour === null || neighbour === void 0 ? void 0 : neighbour.city) != null && (neighbour === null || neighbour === void 0 ? void 0 : neighbour.city.is_friendly) && (this === null || this === void 0 ? void 0 : this.type) !== Node.OCEAN && (this === null || this === void 0 ? void 0 : this.type) !== Node.LAKE) {
                return true;
            }
            if (neighbour === null || neighbour === void 0 ? void 0 : neighbour.is_harvested) {
                harvested_neighbours++;
            }
            if (harvested_neighbours === 2 && (this === null || this === void 0 ? void 0 : this.type) !== Node.OCEAN && (this === null || this === void 0 ? void 0 : this.type) !== Node.LAKE) {
                return true;
            }
        }
        return false;
    };
    Node.prototype.update = function () {
        var _a;
        (_a = this === null || this === void 0 ? void 0 : this.hex) === null || _a === void 0 ? void 0 : _a.clear();
        this.add_node_to_stage();
        if (this.unit != null) {
            this.unit.update_unit_on_stage();
        }
        if (this === Node.selected_node)
            this.set_selected();
        if (!this.is_hidden)
            this.set_border(Node.LAKE, 5, 1, this.line_borders_cords);
    };
    // types of nodes displayed as colors
    Node.OCEAN = 0x0AA3CF;
    Node.LAKE = 0x80C5DE;
    Node.GRASS = 0x7FFF55;
    Node.FOREST = 0x228B22;
    Node.MOUNTAIN = 0xF2F2F2;
    Node.HIDDEN = 0xE0D257;
    Node.CAN_BE_HARVESTED = 0xFFBF00;
    Node.HARVESTED = 0xFF7800;
    // if type is null => the node is a city therefore it has not type
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
    Node.movement_hint_thickness = 3;
    Node.attack_hint_color = 0xF53E3E;
    Node.bottom_menu_shown = false;
    Node.already_selected = false;
    Node.all_nodes = [];
    return Node;
}());
export { Node };
