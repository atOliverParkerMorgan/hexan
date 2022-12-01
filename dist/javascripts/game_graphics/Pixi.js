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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init_game = exports.a_star = exports.Graphics = exports.app = exports.all_units = exports.viewport = exports.WORLD_HEIGHT = exports.WORLD_WIDTH = exports.DISTANCE_BETWEEN_HEX = exports.HEX_SIDE_SIZE = void 0;
var PIXI = __importStar(require("pixi.js"));
var Node_1 = require("./Node");
var ClientSocket_1 = require("../ClientSocket");
var pixi_viewport_1 = require("pixi-viewport");
var Unit_1 = __importDefault(require("./Unit/Unit"));
var Melee_js_1 = require("./Unit/Melee.js");
var Range_js_1 = require("./Unit/Range.js");
// import {Cavalry} from "./Unit/Cavalry.ts";
var bottom_menu_1 = require("../bottom_menu");
exports.all_units = [];
exports.app = new PIXI.Application({ resizeTo: window, transparent: true, }); // autoresize: true
exports.Graphics = PIXI.Graphics;
// @TODO public a_star doesn't always match sever a_star
// get the shortest path between two nodes
function a_star(start_node, goal_node) {
    var open_set = [start_node];
    var closed_set = [];
    while (open_set.length > 0) {
        var current_node = open_set[0];
        var current_index = 0;
        for (var i = 0; i < open_set.length; i++) {
            if (open_set[i].get_heuristic_value(start_node, goal_node) < current_node.get_heuristic_value(start_node, goal_node)) {
                current_node = open_set[i];
                current_index = i;
            }
        }
        open_set.splice(current_index, 1);
        closed_set.push(current_node);
        if (current_node.x === goal_node.x && current_node.y === goal_node.y) {
            var solution_path = [current_node];
            while (solution_path[solution_path.length - 1] !== start_node) {
                solution_path.push(solution_path[solution_path.length - 1].parent);
            }
            return solution_path.reverse();
        }
        for (var _i = 0, _a = current_node.get_neighbours(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node == null) {
                continue;
            }
            if (closed_set.includes(node)) {
                continue;
            }
            var distance_from_start = node.get_distance_to_node(start_node);
            var current_score = distance_from_start + current_node.get_distance_to_node(node);
            var is_better = false;
            if (!open_set.includes(node)) {
                open_set.push(node);
                is_better = true;
            }
            else if (current_score < distance_from_start) {
                is_better = true;
            }
            if (is_better) {
                node.parent = current_node;
            }
        }
    }
    return null;
}
exports.a_star = a_star;
function init_canvas(map, cities) {
    exports.HEX_SIDE_SIZE = Math.pow(map.length, .5);
    exports.DISTANCE_BETWEEN_HEX = 2 * Math.pow((Math.pow(exports.HEX_SIDE_SIZE, 2) - Math.pow((exports.HEX_SIDE_SIZE / 2), 2)), .5);
    exports.WORLD_WIDTH = exports.DISTANCE_BETWEEN_HEX * exports.HEX_SIDE_SIZE;
    exports.WORLD_HEIGHT = exports.HEX_SIDE_SIZE * 1.5 * exports.HEX_SIDE_SIZE;
    document.body.appendChild(exports.app.view);
    exports.viewport = new pixi_viewport_1.Viewport({
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
        worldWidth: exports.WORLD_WIDTH,
        worldHeight: exports.WORLD_HEIGHT,
        interaction: exports.app.renderer.plugins.interaction // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
    });
    var starting_city = cities[0];
    var row_bias = starting_city.y % 2 === 0 ? exports.DISTANCE_BETWEEN_HEX / 2 : 0;
    var city_x = (starting_city.x * exports.DISTANCE_BETWEEN_HEX + row_bias) - exports.WORLD_WIDTH / 2;
    var city_y = (starting_city.y * 1.5 * exports.HEX_SIDE_SIZE) - exports.WORLD_HEIGHT / 2;
    exports.viewport
        .drag()
        .pinch()
        .decelerate()
        .moveCenter(0, 0)
        .snap(city_x, city_y, { removeOnComplete: true })
        .clamp({ top: -exports.WORLD_HEIGHT / 2 - exports.HEX_SIDE_SIZE, left: -exports.WORLD_WIDTH / 2 - exports.HEX_SIDE_SIZE,
        right: exports.WORLD_WIDTH / 2 + exports.DISTANCE_BETWEEN_HEX - exports.HEX_SIDE_SIZE,
        bottom: exports.WORLD_HEIGHT / 2 - exports.HEX_SIDE_SIZE / 2 + exports.HEX_SIDE_SIZE / 2 });
    exports.app.stage.addChild(exports.viewport);
    document.body.appendChild(exports.app.view);
    exports.app.ticker.add(function (delta) { return loop(); });
}
var process_data = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var response_type = args[0][0].response_type;
    var response_data = args[0][0].data;
    switch (response_type) {
        case ClientSocket_1.ClientSocket.response_types.UNITS_RESPONSE:
            exports.all_units = [];
            for (var _a = 0, _b = response_data.units; _a < _b.length; _a++) {
                var unit = _b[_a];
                var graphics_unit = void 0;
                // get the correct sprite for unit depending on it's type
                if (unit.type === Unit_1.default.MELEE) {
                    graphics_unit = new Melee_js_1.Melee(unit.x, unit.y, unit.id, exports.HEX_SIDE_SIZE * .75, exports.HEX_SIDE_SIZE * .75, "../../images/warrior.png");
                }
                else if (unit.type === Unit_1.default.RANGE) {
                    graphics_unit = new Range_js_1.Range(unit.x, unit.y, unit.id, exports.HEX_SIDE_SIZE * .75, exports.HEX_SIDE_SIZE * .75, "../../images/slinger.png");
                }
                if (graphics_unit == null) {
                    return;
                }
                exports.all_units.push(graphics_unit);
                Node_1.Node.all_nodes[unit.y][unit.x].units = [graphics_unit];
            }
            break;
        case ClientSocket_1.ClientSocket.response_types.ALL_RESPONSE:
            var map = response_data.map;
            var cities = response_data.cities;
            init_canvas(map, cities);
            // adding nodes from linear array to 2d array
            var y = 0;
            var row = [];
            for (var _c = 0, map_1 = map; _c < map_1.length; _c++) {
                var node = map_1[_c];
                if (node.y !== y) {
                    Node_1.Node.all_nodes.push(row);
                    row = [];
                    y = node.y;
                }
                // init node => add nodes to PIXI stage
                row.push(new Node_1.Node(node.x, node.y, node.id, node.type, node.borders, node.city));
            }
            Node_1.Node.all_nodes.push(row);
            break;
        case ClientSocket_1.ClientSocket.response_types.MENU_INFO_RESPONSE:
            (0, bottom_menu_1.show_city_bottom_menu)(response_data.city);
            break;
        // deal with sever UNIT_MOVED response
        case ClientSocket_1.ClientSocket.response_types.UNIT_MOVED_RESPONSE:
            var found = false;
            if (exports.all_units == null) {
                return;
            }
            // find the unit in question
            for (var _d = 0, all_units_1 = exports.all_units; _d < all_units_1.length; _d++) {
                var unit = all_units_1[_d];
                if ((unit === null || unit === void 0 ? void 0 : unit.id) === response_data.unit.id) {
                    found = true;
                    unit === null || unit === void 0 ? void 0 : unit.move_to(response_data.unit.x, response_data.unit.y);
                }
            }
            // update nodes
            for (var _e = 0, _f = response_data.nodes; _e < _f.length; _e++) {
                var node = _f[_e];
                Node_1.Node.all_nodes[node.y][node.x].set_type(node.type);
            }
            // if not found something went wrong
            if (!found) {
                console.error("Error, something has gone wrong with the sever public communication");
                break;
            }
            break;
    }
    // add units
    //let unit = new Unit(0, 0, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png");
    // all_nodes[2][2].units.push(new Unit(2, 2, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png"));
};
function init_game() {
    var player_token = localStorage.getItem("player_token");
    var game_token = localStorage.getItem("game_token");
    // the typescript hasn't provided a token for the public
    if (player_token == null || game_token == null) {
        return;
    }
    ClientSocket_1.ClientSocket.add_data_listener(process_data, player_token);
    ClientSocket_1.ClientSocket.get_data(ClientSocket_1.ClientSocket.request_types.GET_ALL, game_token, player_token);
}
exports.init_game = init_game;
function loop() {
}
