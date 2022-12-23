import { Player } from "./GameGraphics/Player.js";
import { HEX_SIDE_SIZE, setupTechTree, initGame, updateBoard, } from "./GameGraphics/Pixi.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import { Node } from "./GameGraphics/Node.js";
import { gameOver, showCityMenu, showModal } from "./UiLogic.js";
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
    function sendData(request, data) {
        console.log(request);
        data.player_token = localStorage.player_token;
        data.game_token = localStorage.game_token;
        ClientSocket.socket.emit(request, data);
    }
    ClientSocket.sendData = sendData;
    function addDataListener() {
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
            initGame(ClientSocket.socket.id, response_data.game_token);
        });
        ClientSocket.socket.on(ClientSocket.response_types.MENU_INFO_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // update production info
            Player.production_units = response_data.production_units;
            showCityMenu(response_data.city_data);
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
                Player.resetUnits();
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
            if (Node.all_nodes[response_data.unit.y][response_data.unit.x].city.is_friendly) {
                Player.addUnit(response_data.unit);
                Player.updateTotalNumberOfStars(response_data);
            }
            else {
                Player.addEnemyUnit(response_data.unit);
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
                    Node.all_nodes[node.y][node.x].setType(node.type, node.sprite_name);
                }
                else if (node.city_data != null) {
                    Node.all_nodes[node.y][node.x].setCity(node.city_data, node.sprite_name);
                }
            });
            // find the unit in question
            if (!moveUnit(response_data.unit)) {
                console.error("Error, something has gone wrong with the sever public communication");
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            if (!moveEnemyUnits(response_data.unit)) {
                Player.addEnemyUnit(response_data.unit);
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_FOUND_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.addEnemyUnit(response_data.unit);
        });
        ClientSocket.socket.on(ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.deleteEnemyVisibleUnit(response_data.unit);
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
            current_node.setCity(response_data.city_node.city_data, response_data.city_node.sprite_name);
            for (var _a = 0, _b = current_node.getNeighbours(); _a < _b.length; _a++) {
                var neighbour = _b[_a];
                if (neighbour != null) {
                    neighbour.update();
                }
            }
            current_node.removeUnit();
        });
        ClientSocket.socket.on(ClientSocket.response_types.ATTACK_UNIT_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // updates unit graphics after attack
            if (response_data.is_unit_1_dead) {
                Player.deleteFriendlyUnit(response_data.unit_1);
                Player.deleteEnemyVisibleUnit(response_data.unit_1);
            }
            else {
                Player.updateUnitsAfterAttack(response_data.unit_1);
            }
            if (response_data.is_unit_2_dead) {
                Player.deleteFriendlyUnit(response_data.unit_2);
                Player.deleteEnemyVisibleUnit(response_data.unit_2);
            }
            else {
                Player.updateUnitsAfterAttack(response_data.unit_2);
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.STARS_DATA_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            Player.setupStarProduction(response_data);
        });
        ClientSocket.socket.on(ClientSocket.response_types.SOMETHING_WRONG_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            showModal(response_data.title, response_data.message, "w3-red");
        });
        ClientSocket.socket.on(ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            setupTechTree(response_data.root_tech_tree_node);
            Player.updateTotalNumberOfStars(response_data);
        });
        ClientSocket.socket.on(ClientSocket.response_types.HARVEST_NODE_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            // update node to show that it is harvested
            Player.setupStarProduction(response_data);
            document.getElementById("harvest_button").style.visibility = "hidden";
            var node = Node.all_nodes[response_data.node.y][response_data.node.x];
            node.is_harvested = response_data.node.is_harvested;
            node.update();
            for (var _a = 0, _b = node.getNeighbours(); _a < _b.length; _a++) {
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
            for (var _a = 0, _b = city_node.getNeighbours(); _a < _b.length; _a++) {
                var neighbour = _b[_a];
                neighbour === null || neighbour === void 0 ? void 0 : neighbour.update();
            }
            if (city_node.city.is_friendly) {
                moveUnit(response_data.unit);
            }
            else {
                moveEnemyUnits(response_data.unit);
            }
        });
        ClientSocket.socket.on(ClientSocket.response_types.END_GAME_RESPONSE, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var response_data = args[0];
            if (response_data.won) {
                gameOver("YOU WON!", "Congrats annihilate all your enemies and won!", "w3-green");
            }
            else {
                gameOver("YOU LOST!", "Oh no you got recked and lost better luck next time!", "w3-red");
            }
        });
    }
    ClientSocket.addDataListener = addDataListener;
    // return if unit move was valid
    function moveUnit(response_unit) {
        // find the unit in question
        for (var _i = 0, _a = Player.all_units; _i < _a.length; _i++) {
            var unit = _a[_i];
            if (unit.id === response_unit.id) {
                // transform unit into ship if on a water node
                unit.is_on_water = response_unit.is_on_water;
                unit.moveTo(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }
    function moveEnemyUnits(response_unit) {
        // find the unit in question
        for (var _i = 0, _a = Player.all_enemy_visible_units; _i < _a.length; _i++) {
            var enemy_unit = _a[_i];
            if (enemy_unit.id === response_unit.id) {
                // transform unit into ship if on a water node
                enemy_unit.is_on_water = response_unit.is_on_water;
                enemy_unit.moveTo(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }
    function requestProduction(unit_name) {
        ClientSocket.sendData(ClientSocket.request_types.PRODUCE_UNIT, {
            unit_type: unit_name,
            city_name: document.getElementById("city_name").textContent
        });
    }
    ClientSocket.requestProduction = requestProduction;
    function requestUnitAction(unit) {
        ClientSocket.sendData(ClientSocket.request_types.SETTLE, {
            x: unit.x,
            y: unit.y,
            id: unit.id,
        });
    }
    ClientSocket.requestUnitAction = requestUnitAction;
    function requestHarvest(node_x, node_y) {
        ClientSocket.sendData(ClientSocket.request_types.HARVEST_NODE, {
            node_x: node_x,
            node_y: node_y,
        });
    }
    ClientSocket.requestHarvest = requestHarvest;
    function requestBuyTechnology(tech_name) {
        ClientSocket.sendData(ClientSocket.request_types.PURCHASE_TECHNOLOGY, {
            tech_name: tech_name,
        });
    }
    ClientSocket.requestBuyTechnology = requestBuyTechnology;
    function requestMoveUnit(unit, path) {
        ClientSocket.sendData(ClientSocket.request_types.MOVE_UNITS, {
            unit_id: unit === null || unit === void 0 ? void 0 : unit.id,
            path: path
        });
        unit === null || unit === void 0 ? void 0 : unit.setCurrentPath(path);
    }
    ClientSocket.requestMoveUnit = requestMoveUnit;
})(ClientSocket || (ClientSocket = {}));
