"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSocket = void 0;
var socket_io_client_1 = require("socket.io-client");
// singleton
var ClientSocket;
(function (ClientSocket) {
    ClientSocket.response_types = {
        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        // match making
        FOUND_1v1_OPPONENT: "FOUND_1v1_OPPONENT",
        FOUND_2v2_OPPONENTS: "FOUND_2v2_OPPONENTS"
    };
    ClientSocket.request_types = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        PRODUCE_UNIT: "PRODUCE_UNIT",
        MOVE_UNITS: "MOVE_UNIT",
        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };
    ClientSocket.socket = (0, socket_io_client_1.io)("ws://127.0.0.1:8082", { transports: ['websocket'] });
    function send_data(data) {
        ClientSocket.socket.emit("send-data", data);
    }
    ClientSocket.send_data = send_data;
    function add_data_listener(fun, player_token) {
        console.log("add_data_listener");
        ClientSocket.socket.on(player_token, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.log("RESPONSE: " + args[0].response_type);
            fun(args);
        });
    }
    ClientSocket.add_data_listener = add_data_listener;
    function get_data(request_type, game_token, player_token) {
        console.log("REQUEST: " + request_type);
        ClientSocket.socket.emit("get-data", {
            request_type: request_type,
            data: {
                game_token: game_token,
                player_token: player_token
            }
        });
    }
    ClientSocket.get_data = get_data;
})(ClientSocket = exports.ClientSocket || (exports.ClientSocket = {}));
