import { Player } from "./GameGraphics/Player.js";
import { HEX_SIDE_SIZE, setup_tech_tree, init_game, updateBoard, } from "./GameGraphics/Pixi.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import { Node } from "./GameGraphics/Node.js";
import { game_over, show_city_menu, show_modal } from "./UiLogic.js";
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
        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",
        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",
        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_COST_RESPONSE: "HARVEST_COST_RESPONSE",
        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE",
        END_GAME_RESPONSE: "END_GAME_RESPONSE",
        FOUND_GAME_RESPONSE: "FOUND_GAME_RESPONSE"
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
        FIND_AI_OPPONENT: "FIND_AI_OPPONENT",
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    console.log("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port));
    function connect() {
        // @ts-ignore
        ClientSocket.socket = io("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port), { transports: ['websocket', 'polling'] });
    }
    ClientSocket.connect = connect;
    function send_data(data) {
        ClientSocket.socket.emit("send_data", data);
    }
    ClientSocket.send_data = send_data;
    function add_data_listener() {
        ClientSocket.socket.on(ClientSocket.response_types.ALL_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            updateBoard(args);
        });
        ClientSocket.socket.on(ClientSocket.response_types.FOUND_GAME_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            init_game(ClientSocket.socket.id, response_data.game_token);
        });
        ClientSocket.socket.on(ClientSocket.response_types.MENU_INFO_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // update production info
            console.log("response_data.player.production_units");
            console.log(response_data.production_units);
            Player.production_units = response_data.production_units;
            show_city_menu(response_data.city_data);
        });
        ClientSocket.socket.on(ClientSocket.response_types.UNITS_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            for (var _a = 0, _b = response_data.units; _a < _b.length; _a++) {
                var unit = _b[_a];
                unit = unit;
                Player.reset_units();
                var graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);
                Player.all_units.push(graphics_unit);
                Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.UNIT_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            console.log(response_data.unit);
            if (Node.all_nodes[response_data.unit.y][response_data.unit.x].city.is_friendly) {
                Player.add_unit(response_data.unit);
                Player.update_total_number_of_stars(response_data);
            }
            else {
                Player.add_enemy_unit(response_data.unit);
                Node.all_nodes[response_data.unit.y][response_data.unit.x].update();
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.UNIT_MOVED_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
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
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            if (!move_enemy_units(response_data.unit)) {
                Player.add_enemy_unit(response_data.unit);
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_FOUND_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.add_enemy_unit(response_data.unit);
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.delete_enemy_visible_unit(response_data.unit);
        });
        ClientSocket.socket.on(ClientSocket.response_types.HARVEST_COST_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            for (var _a = 0, _b = response_data.node_cords; _a < _b.length; _a++) {
                var cords = _b[_a];
                Node.all_nodes[cords[1]][cords[0]].harvest_cost = response_data.harvest_cost;
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.NEW_CITY, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            var current_node = Node.all_nodes[response_data.city_y][response_data.city_x];
            current_node.set_city(response_data.city_node.city_data, response_data.city_node.sprite_name);
            for (var _a = 0, _b = current_node.get_neighbours(); _a < _b.length; _a++) {
                var neighbour = _b[_a];
                if (neighbour != null) {
                    neighbour.update();
                }
            }
            current_node.remove_unit();
        });
        ClientSocket.socket.on(ClientSocket.response_types.ATTACK_UNIT_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
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
        });
        ClientSocket.socket.on(ClientSocket.response_types.STARS_DATA_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.setup_star_production(response_data);
        });
        ClientSocket.socket.on(ClientSocket.response_types.SOMETHING_WRONG_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            show_modal(response_data.title, response_data.message, "w3-red");
        });
        ClientSocket.socket.on(ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            setup_tech_tree(response_data.root_tech_tree_node);
            Player.update_total_number_of_stars(response_data);
        });
        ClientSocket.socket.on(ClientSocket.response_types.HARVEST_NODE_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // update node to show that it is harvested
            Player.setup_star_production(response_data);
            document.getElementById("harvest_button").style.visibility = "hidden";
            var node = Node.all_nodes[response_data.node.y][response_data.node.x];
            node.is_harvested = response_data.node.is_harvested;
            node.update();
            for (var _a = 0, _b = node.get_neighbours(); _a < _b.length; _a++) {
                var neighbor = _b[_a];
                neighbor === null || neighbor === void 0 ? void 0 : neighbor.update();
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.CONQUERED_CITY_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // if player conquered a city
            var city_node = Node.all_nodes[response_data.city.y][response_data.city.x];
            city_node.city.is_friendly = response_data.city.is_friendly;
            city_node.update();
            for (var _a = 0, _b = city_node.get_neighbours(); _a < _b.length; _a++) {
                var neighbour = _b[_a];
                neighbour === null || neighbour === void 0 ? void 0 : neighbour.update();
            }
            if (city_node.city.is_friendly) {
                move_unit(response_data.unit);
            }
            else {
                move_enemy_units(response_data.unit);
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.END_GAME_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            game_over();
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
    function get_data(request_type) {
        console.log("REQUEST: " + request_type);
        ClientSocket.socket.emit("get_data", {
            request_type: request_type,
            data: {
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
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
