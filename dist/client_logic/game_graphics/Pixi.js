import { Node } from "./Node.js";
import { ClientSocket } from "../ClientSocket.js";
import { setup_tech_tree_button } from "../UI_logic.js";
import { Technology } from "./Technology/Technology.js";
import { Player } from "./Player.js";
export var HEX_SIDE_SIZE;
export var DISTANCE_BETWEEN_HEX;
export var WORLD_WIDTH;
export var WORLD_HEIGHT;
export var viewport;
export var tech_tree_root;
export function setup_tech_tree_node(node) {
    var children_node = [];
    if (node.children != null) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            children_node.push(setup_tech_tree_node(child));
        }
    }
    else {
        children_node = null;
    }
    if (node.is_owned && node.name !== "") {
        Player.owned_technologies.push(node.name);
    }
    return new Technology(children_node, node.name, node.image, node.description, node.cost, node.is_owned);
}
export function setup_tech_tree(tech_tree) {
    // get player owned technologies into array
    Player.owned_technologies = [];
    tech_tree_root = setup_tech_tree_node(tech_tree);
    Technology.init_graph_arrays();
}
// @ts-ignore
export var app = new PIXI.Application({ resizeTo: window, transparent: true, autoresize: true, antialias: true });
// @ts-ignore
export var Graphics = PIXI.Graphics;
// @ts-ignore
export var Sprite = PIXI.Sprite;
// @ts-ignore
export var Texture = PIXI.Texture;
// @ts-ignore
export var TilingSprite = PIXI.TilingSprite;
// @TODO public a_star doesn't always match sever a_star
// get the shortest path between two nodes
export function a_star(start_node, goal_node) {
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
        for (var _i = 0, _a = current_node.get_valid_movement_neighbours(); _i < _a.length; _i++) {
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
export function init_canvas(map, cities) {
    setup_tech_tree_button();
    if (viewport != null) {
        Node.all_nodes = [];
        return;
    }
    HEX_SIDE_SIZE = Math.pow(map.length, .5);
    DISTANCE_BETWEEN_HEX = 2 * Math.pow((Math.pow(HEX_SIDE_SIZE, 2) - Math.pow((HEX_SIDE_SIZE / 2), 2)), .5);
    WORLD_WIDTH = DISTANCE_BETWEEN_HEX * HEX_SIDE_SIZE;
    WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * HEX_SIDE_SIZE;
    document.body.appendChild(app.view);
    var starting_city = cities[0];
    var row_bias = starting_city.y % 2 === 0 ? DISTANCE_BETWEEN_HEX / 2 : 0;
    var city_x = (starting_city.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    var city_y = (starting_city.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
    //TODO remove after testing
    // save friendly and enemy city cords for testing
    var my_div_city = document.querySelector("#my_city_cords");
    var player_token = localStorage.getItem("player_token");
    var game_token = localStorage.getItem("game_token");
    if (my_div_city != null && player_token != null && game_token != null) {
        my_div_city.textContent = city_x + " " + city_y;
        // ClientSocket.get_data("enemy_city", game_token, player_token)
    }
    // @ts-ignore
    viewport = app.stage.addChild(new pixi_viewport.Viewport());
    viewport
        .drag()
        .decelerate()
        .moveCenter(0, 0)
        .snap(city_x, city_y, { removeOnComplete: true })
        .wheel()
        .clampZoom({ minWidth: 4 * HEX_SIDE_SIZE, minHeight: 4 * HEX_SIDE_SIZE, maxWidth: WORLD_WIDTH, maxHeight: WORLD_HEIGHT })
        .clamp({ top: -WORLD_HEIGHT / 2 - HEX_SIDE_SIZE, left: -WORLD_WIDTH / 2 - HEX_SIDE_SIZE,
        right: WORLD_WIDTH / 2 + DISTANCE_BETWEEN_HEX - HEX_SIDE_SIZE,
        bottom: WORLD_HEIGHT / 2 - HEX_SIDE_SIZE / 2 + HEX_SIDE_SIZE / 2 });
    document.body.appendChild(app.view);
    // @ts-ignore
    app.ticker.add(function (delta) { return loop(delta); });
}
export function init_game() {
    var player_token = localStorage.getItem("player_token");
    var game_token = localStorage.getItem("game_token");
    // the typescript hasn't provided a token for the public
    if (player_token == null || game_token == null) {
        return;
    }
    ClientSocket.connect();
    ClientSocket.add_data_listener(player_token);
    ClientSocket.get_data(ClientSocket.request_types.GET_ALL, game_token, player_token);
}
function loop() {
}
