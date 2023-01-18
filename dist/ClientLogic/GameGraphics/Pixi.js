import { Node } from "./Node.js";
import { ClientSocket } from "../ClientSocket.js";
import { setupTechTreeButton } from "../UiLogic.js";
import { Technology } from "./Technology/Technology.js";
import { Player } from "./Player.js";
import { interval_id_timer, loadFile } from "../ClientCreateGame.js";
import { City } from "./City/City.js";
import { Interval } from "./Interval.js";
export var HEX_SIDE_SIZE;
export var DISTANCE_BETWEEN_HEX;
export var WORLD_WIDTH;
export var WORLD_HEIGHT;
export var viewport;
export var tech_tree_root;
export function setupTechTreeNode(node) {
    var children_node = [];
    if (node.children != null) {
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            children_node.push(setupTechTreeNode(child));
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
export function setupTechTree(tech_tree) {
    // get player owned technologies into array
    Player.owned_technologies = [];
    tech_tree_root = setupTechTreeNode(tech_tree);
    Technology.initGraphArrays();
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
export function aStar(start_node, goal_node) {
    var open_set = [start_node];
    var closed_set = [];
    while (open_set.length > 0) {
        var current_node = open_set[0];
        var current_index = 0;
        for (var i = 0; i < open_set.length; i++) {
            if (open_set[i].getHeuristicValue(start_node, goal_node) < current_node.getHeuristicValue(start_node, goal_node)) {
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
        for (var _i = 0, _a = current_node.getValidMovementNeighbours(); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node == null) {
                continue;
            }
            if (closed_set.includes(node)) {
                continue;
            }
            var distance_from_start = node.getDistanceToNode(start_node);
            var current_score = distance_from_start + current_node.getDistanceToNode(node);
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
export function initCanvas(map, cities) {
    setupTechTreeButton();
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
        .clamp({ top: -WORLD_HEIGHT / 2 - HEX_SIDE_SIZE - 80, left: -WORLD_WIDTH / 2 - HEX_SIDE_SIZE - 20,
        right: WORLD_WIDTH / 2 + DISTANCE_BETWEEN_HEX - HEX_SIDE_SIZE + 450,
        bottom: WORLD_HEIGHT / 2 - HEX_SIDE_SIZE / 2 + HEX_SIDE_SIZE / 2 + 80 });
    document.body.appendChild(app.view);
    // @ts-ignore
    app.ticker.add(function (delta) { return loop(delta); });
}
export function initGame(player_token, game_token) {
    // init game
    var main_div = document.getElementById("app");
    //replace index.html with game.html
    main_div.innerHTML = loadFile("/views/game.html");
    localStorage.setItem("player_token", player_token);
    localStorage.setItem("game_token", game_token);
    clearInterval(Interval.update_stars_interval_id);
    clearInterval(interval_id_timer);
    // the typescript hasn't provided a token for the public
    if (player_token == null || game_token == null) {
        return;
    }
    ClientSocket.sendData(ClientSocket.request_types.GET_ALL, {});
}
export function updateBoard() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var response_data = args[0][0];
    var map = response_data.map;
    var cities = response_data.cities;
    initCanvas(map, cities);
    // adding nodes from linear array to 2d array
    var y = 0;
    var row = [];
    for (var _a = 0, map_1 = map; _a < map_1.length; _a++) {
        var node = map_1[_a];
        if (node.y !== y) {
            Node.all_nodes.push(row);
            row = [];
            y = node.y;
        }
        // init node => add nodes to PIXI stage
        var city = node.city_data != null ? new City(node.city_data) : null;
        if (city != null) {
            Player.all_cities.push(city);
        }
        row.push(new Node(node.x, node.y, node.id, node.type, node.borders, city, node.sprite_name, node.harvest_cost, node.production_stars, node.is_harvested));
    }
    Node.all_nodes.push(row);
    for (var _b = 0, _c = Node.all_nodes; _b < _c.length; _b++) {
        var row_of_nodes = _c[_b];
        for (var _d = 0, row_of_nodes_1 = row_of_nodes; _d < row_of_nodes_1.length; _d++) {
            var node = row_of_nodes_1[_d];
            node.update();
        }
    }
    Player.production_units = response_data.production_units;
    setupTechTree(response_data.root_tech_tree_node);
    // get star data after game setup is initialized
    ClientSocket.sendData(ClientSocket.request_types.GET_STARS_DATA, {});
}
function loop() { }
