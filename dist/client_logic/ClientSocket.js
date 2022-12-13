import { Player } from "./game_graphics/Player.js";
import { init_canvas, HEX_SIDE_SIZE, setup_tech_tree, } from "./game_graphics/Pixi.js";
import Unit from "./game_graphics/Unit/Unit.js";
import { Node } from "./game_graphics/Node.js";
import { show_city_menu, show_modal } from "./UI_logic.js";
import { City } from "./game_graphics/City/City.js";
import { loadFile } from "./client_create_game.js";
// singleton
export var ClientSocket;
(function (ClientSocket) {
    ClientSocket.response_types = {
        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        UNIT_RESPONSE: "UNIT_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",
        ENEMY_FOUND_RESPONSE: "ENEMY_FOUND_RESPONSE",
        ATTACK_UNIT_RESPONSE: "ATTACK_UNIT_RESPONSE",
        NEW_CITY: "NEW_CITY",
        CANNOT_SETTLE: "CANNOT_SETTLE",
        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",
        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_COST_RESPONSE: "HARVEST_COST_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE",
        END_GAME_RESPONSE: "END_GAME_RESPONSE"
    };
    ClientSocket.request_types = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        GET_STARS_DATA: "GET_STARS_DATA",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        HARVEST_NODE: "HARVEST_NODE",
        HARVEST_COST: "HARVEST_COST",
        PURCHASE_TECHNOLOGY: "PURCHASE_TECHNOLOGY",
        MOVE_UNITS: "MOVE_UNITS",
        SETTLE: "SETTLE",
        ATTACK_UNIT: "ATTACK_UNIT",
        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    // @ts-ignore
    ClientSocket.socket = io("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port), { transports: ['websocket', 'polling'] });
    console.log("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port));
    function send_data(data) {
        ClientSocket.socket.emit("send-data", data);
    }
    ClientSocket.send_data = send_data;
    function add_data_listener(player_token) {
        ClientSocket.socket.on(player_token, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log("RESPONSE: " + args[0].response_type);
            var response_type = args[0].response_type;
            var response_data = args[0].data;
            switch (response_type) {
                case ClientSocket.response_types.UNITS_RESPONSE:
                    for (var _a = 0, _b = response_data.units; _a < _b.length; _a++) {
                        var unit = _b[_a];
                        unit = unit;
                        Player.reset_units();
                        var graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);
                        Player.all_units.push(graphics_unit);
                        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
                    }
                    break;
                case ClientSocket.response_types.UNIT_RESPONSE:
                    console.log(response_data.unit);
                    if (Node.all_nodes[response_data.unit.y][response_data.unit.x].city.is_friendly) {
                        Player.add_unit(response_data.unit);
                        Player.update_total_number_of_stars(response_data);
                    }
                    else {
                        Player.add_enemy_unit(response_data.unit);
                        Node.all_nodes[response_data.unit.y][response_data.unit.x].update();
                    }
                    break;
                case ClientSocket.response_types.ALL_RESPONSE:
                    var map = response_data.map;
                    var cities = response_data.cities;
                    init_canvas(map, cities);
                    // adding nodes from linear array to 2d array
                    var y = 0;
                    var row = [];
                    for (var _c = 0, map_1 = map; _c < map_1.length; _c++) {
                        var node_1 = map_1[_c];
                        if (node_1.y !== y) {
                            Node.all_nodes.push(row);
                            row = [];
                            y = node_1.y;
                        }
                        // init node => add nodes to PIXI stage
                        var city = node_1.city_data != null ? new City(node_1.city_data) : null;
                        if (city != null) {
                            Player.all_cities.push(city);
                        }
                        row.push(new Node(node_1.x, node_1.y, node_1.id, node_1.type, node_1.borders, city, node_1.sprite_name, node_1.harvest_cost, node_1.production_stars, node_1.is_harvested));
                    }
                    Node.all_nodes.push(row);
                    for (var _d = 0, _e = Node.all_nodes; _d < _e.length; _d++) {
                        var row_of_nodes = _e[_d];
                        for (var _f = 0, row_of_nodes_1 = row_of_nodes; _f < row_of_nodes_1.length; _f++) {
                            var node_2 = row_of_nodes_1[_f];
                            node_2.update();
                        }
                    }
                    console.log(response_data.production_units);
                    Player.production_units = response_data.production_units;
                    setup_tech_tree(response_data.root_tech_tree_node);
                    // get star data after game setup is initialized
                    ClientSocket.get_data(ClientSocket.request_types.GET_STARS_DATA, localStorage.getItem("game_token"), player_token);
                    break;
                case ClientSocket.response_types.MENU_INFO_RESPONSE:
                    // update production info
                    console.log("response_data.player.production_units");
                    console.log(response_data.production_units);
                    Player.production_units = response_data.production_units;
                    show_city_menu(response_data.city_data);
                    break;
                // deal with sever UNIT_MOVED response
                case ClientSocket.response_types.UNIT_MOVED_RESPONSE:
                    if (Player.all_units == null) {
                        return;
                    }
                    // update nodes
                    response_data.nodes.map(function (node) {
                        if (node.type != null) {
                            Node.all_nodes[node.y][node.x].set_type(node.type, node.sprite_name);
                        }
                        else if (node.city_data != null) {
                            Node.all_nodes[node.y][node.x].set_city(node.city_data, node.sprite_name);
                        }
                    });
                    // find the unit in question
                    if (!move_unit(response_data.unit)) {
                        console.error("Error, something has gone wrong with the sever public communication");
                        break;
                    }
                    break;
                case ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE:
                    if (!move_enemy_units(response_data.unit)) {
                        Player.add_enemy_unit(response_data.unit);
                    }
                    break;
                case ClientSocket.response_types.ENEMY_FOUND_RESPONSE:
                    Player.add_enemy_unit(response_data.unit);
                    break;
                case ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED:
                    Player.delete_enemy_visible_unit(response_data.unit);
                    break;
                case ClientSocket.response_types.HARVEST_COST_RESPONSE:
                    for (var _g = 0, _h = response_data.node_cords; _g < _h.length; _g++) {
                        var cords = _h[_g];
                        Node.all_nodes[cords[1]][cords[0]].harvest_cost = response_data.harvest_cost;
                    }
                    break;
                case ClientSocket.response_types.NEW_CITY:
                    var current_node = Node.all_nodes[response_data.city_y][response_data.city_x];
                    current_node.set_city(response_data.city_node.city_data, response_data.city_node.sprite_name);
                    for (var _j = 0, _k = current_node.get_neighbours(); _j < _k.length; _j++) {
                        var neighbour = _k[_j];
                        if (neighbour != null) {
                            neighbour.update();
                        }
                    }
                    current_node.remove_unit();
                    break;
                case ClientSocket.response_types.ATTACK_UNIT_RESPONSE:
                    // updates unit graphics after attack
                    console.log(response_data);
                    if (response_data.is_unit_1_dead) {
                        Player.delete_friendly_unit(response_data.unit_1);
                        Player.delete_enemy_visible_unit(response_data.unit_1);
                    }
                    else {
                        Player.update_units_after_attack(response_data.unit_1);
                    }
                    if (response_data.is_unit_2_dead) {
                        Player.delete_friendly_unit(response_data.unit_2);
                        Player.delete_enemy_visible_unit(response_data.unit_2);
                    }
                    else {
                        Player.update_units_after_attack(response_data.unit_2);
                    }
                    break;
                case ClientSocket.response_types.CANNOT_SETTLE:
                    // TODO custom alarm
                    console.log("Cannot settle");
                    break;
                case ClientSocket.response_types.STARS_DATA_RESPONSE:
                    Player.setup_star_production(response_data);
                    break;
                case ClientSocket.response_types.SOMETHING_WRONG_RESPONSE:
                    console.log("here");
                    show_modal(response_data.title, response_data.message, "w3-red");
                    break;
                case ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE:
                    setup_tech_tree(response_data.root_tech_tree_node);
                    Player.update_total_number_of_stars(response_data);
                    break;
                case ClientSocket.response_types.HARVEST_NODE_RESPONSE:
                    // update node to show that it is harvested
                    Player.setup_star_production(response_data);
                    document.getElementById("harvest_button").style.visibility = "hidden";
                    var node = Node.all_nodes[response_data.node.y][response_data.node.x];
                    node.is_harvested = response_data.node.is_harvested;
                    node.update();
                    for (var _l = 0, _m = node.get_neighbours(); _l < _m.length; _l++) {
                        var neighbor = _m[_l];
                        neighbor === null || neighbor === void 0 ? void 0 : neighbor.update();
                    }
                    break;
                case ClientSocket.response_types.CONQUERED_CITY_RESPONSE:
                    // if player conquered a city
                    var city_node = Node.all_nodes[response_data.city.y][response_data.city.x];
                    city_node.city.is_friendly = response_data.city.is_friendly;
                    city_node.update();
                    for (var _o = 0, _p = city_node.get_neighbours(); _o < _p.length; _o++) {
                        var neighbour = _p[_o];
                        neighbour === null || neighbour === void 0 ? void 0 : neighbour.update();
                    }
                    if (city_node.city.is_friendly) {
                        move_unit(response_data.unit);
                    }
                    else {
                        move_enemy_units(response_data.unit);
                    }
                    break;
                case ClientSocket.response_types.END_GAME_RESPONSE:
                    var main_div = document.getElementById("app");
                    main_div.innerHTML = loadFile("/views/end_screen.html");
                    break;
            }
        });
    }
    ClientSocket.add_data_listener = add_data_listener;
    // return if unit move was valid
    function move_unit(response_unit) {
        // find the unit in question
        for (var _i = 0, _a = Player.all_units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.id === response_unit.id) {
                // transform unit into ship if on a water node
                unit.is_on_water = response_unit.is_on_water;
                unit.move_to(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }
    function move_enemy_units(response_unit) {
        // find the unit in question
        for (var _i = 0, _a = Player.all_enemy_visible_units; _i < _a.length; _i++) {
            var enemy_unit = _a[_i];
            if (enemy_unit.id === response_unit.id) {
                // transform unit into ship if on a water node
                enemy_unit.is_on_water = response_unit.is_on_water;
                enemy_unit.move_to(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }
    function get_data(request_type, game_token, player_token) {
        console.log("REQUEST: " + request_type);
        ClientSocket.socket.emit("get_data", {
            request_type: request_type,
            data: {
                game_token: game_token,
                player_token: player_token
            }
        });
    }
    ClientSocket.get_data = get_data;
    function request_production(unit_name) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.PRODUCE_UNIT,
            data: {
                unit_type: unit_name,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
                city_name: document.getElementById("city_name").textContent
            }
        });
    }
    ClientSocket.request_production = request_production;
    function request_unit_action(unit) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.SETTLE,
            data: {
                x: unit.x,
                y: unit.y,
                id: unit.id,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
            }
        });
    }
    ClientSocket.request_unit_action = request_unit_action;
    function request_harvest(node_x, node_y) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.HARVEST_NODE,
            data: {
                node_x: node_x,
                node_y: node_y,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token
            }
        });
    }
    ClientSocket.request_harvest = request_harvest;
    function request_buy_technology(tech_name) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.PURCHASE_TECHNOLOGY,
            data: {
                tech_name: tech_name,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token
            }
        });
    }
    ClientSocket.request_buy_technology = request_buy_technology;
    function request_move_unit(unit, path) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.MOVE_UNITS,
            data: {
                game_token: localStorage.game_token,
                player_token: localStorage.player_token,
                unit_id: unit === null || unit === void 0 ? void 0 : unit.id,
                path: path
            }
        });
        unit === null || unit === void 0 ? void 0 : unit.set_current_path(path);
    }
    ClientSocket.request_move_unit = request_move_unit;
})(ClientSocket || (ClientSocket = {}));
