"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Pixi_js_1 = require("./game_graphics/Pixi.js");
var ClientSocket_js_1 = require("./ClientSocket.js");
// public game mode logic
var GAME_MODE_1v1 = "1v1";
var GAME_MODE_2v2 = "2v2";
var GAME_MODE_AI = "AI";
var GAME_MODE_FRIEND = "FRIEND";
var game_mode = GAME_MODE_1v1;
function change_last_selected_button_to_red() {
    switch (game_mode) {
        case GAME_MODE_1v1:
            game_mode_to_1v1_button === null || game_mode_to_1v1_button === void 0 ? void 0 : game_mode_to_1v1_button.classList.add("w3-red");
            game_mode_to_1v1_button === null || game_mode_to_1v1_button === void 0 ? void 0 : game_mode_to_1v1_button.classList.remove("w3-green");
            break;
        case GAME_MODE_2v2:
            game_mode_to_2v2_button === null || game_mode_to_2v2_button === void 0 ? void 0 : game_mode_to_2v2_button.classList.add("w3-red");
            game_mode_to_2v2_button === null || game_mode_to_2v2_button === void 0 ? void 0 : game_mode_to_2v2_button.classList.remove("w3-green");
            break;
        case GAME_MODE_AI:
            game_mode_to_AI_button === null || game_mode_to_AI_button === void 0 ? void 0 : game_mode_to_AI_button.classList.add("w3-red");
            game_mode_to_AI_button === null || game_mode_to_AI_button === void 0 ? void 0 : game_mode_to_AI_button.classList.remove("w3-green");
            break;
        case GAME_MODE_FRIEND:
            game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.classList.add("w3-red");
            game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.classList.remove("w3-green");
            break;
    }
}
var game_mode_to_1v1_button = document.getElementById("game_mode_to_1v1_button");
game_mode_to_1v1_button === null || game_mode_to_1v1_button === void 0 ? void 0 : game_mode_to_1v1_button.addEventListener("click", function onEvent() {
    change_last_selected_button_to_red();
    game_mode = GAME_MODE_1v1;
    game_mode_to_1v1_button.classList.remove("w3-red");
    game_mode_to_1v1_button.classList.add("w3-green");
});
var game_mode_to_2v2_button = document.getElementById("game_mode_to_2v2_button");
game_mode_to_2v2_button === null || game_mode_to_2v2_button === void 0 ? void 0 : game_mode_to_2v2_button.addEventListener("click", function onEvent() {
    change_last_selected_button_to_red();
    game_mode = GAME_MODE_2v2;
    game_mode_to_2v2_button.classList.remove("w3-red");
    game_mode_to_2v2_button.classList.add("w3-green");
});
var game_mode_to_AI_button = document.getElementById("game_mode_to_AI_button");
game_mode_to_AI_button === null || game_mode_to_AI_button === void 0 ? void 0 : game_mode_to_AI_button.addEventListener("click", function onEvent() {
    change_last_selected_button_to_red();
    game_mode = GAME_MODE_AI;
    game_mode_to_AI_button.classList.remove("w3-red");
    game_mode_to_AI_button.classList.add("w3-green");
});
var game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.addEventListener("click", function onEvent() {
    change_last_selected_button_to_red();
    game_mode = GAME_MODE_FRIEND;
    game_mode_to_FRIEND_button.classList.remove("w3-red");
    game_mode_to_FRIEND_button.classList.add("w3-green");
});
var JSON_response;
function update_timer(main_div, start) {
    var delta = Date.now() - start;
    var seconds = (Math.floor(delta / 1000));
    var minutes = Math.floor(seconds / 60);
    var seconds_string = seconds % 60 === 1 ? "second" : "seconds";
    var minute_string = minutes > 1 ? "minutes" : "minute";
    var minute_text = minutes === 0 ? "" : (minutes) + " " + minute_string + "  :  ";
    main_div.querySelector("span").innerText = minute_text + (seconds % 60) + " " + seconds_string;
}
function match_making_listener() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var response_type = args[0][0].response_type;
    var response_data = args[0][0].data;
    switch (response_type) {
        case ClientSocket_js_1.ClientSocket.response_types.FOUND_1v1_OPPONENT:
        case ClientSocket_js_1.ClientSocket.response_types.FOUND_2v2_OPPONENTS:
            (0, Pixi_js_1.init_game)();
    }
}
var nick_input = document.getElementById("nick_input");
if (nick_input != null) {
    nick_input.addEventListener("keypress", function onEvent(event) {
        var nick = nick_input.value;
        if (event.key === "Enter" && nick.length > 0) {
            //client_socket.send_data("create_game_with_ai", nick);
            var xhr_1 = new XMLHttpRequest();
            xhr_1.open("POST", "http://127.0.0.1:8000/", true);
            xhr_1.setRequestHeader('Content-Type', 'application/json');
            xhr_1.send(JSON.stringify({
                nick_name: nick,
                game_mode: game_mode,
                map_size: 2500,
            }));
            xhr_1.onreadystatechange = function () {
                if (xhr_1.readyState === 4) {
                    if (xhr_1.status === 200) {
                        JSON_response = JSON.parse(xhr_1.responseText);
                        localStorage.setItem("player_token", JSON_response.player_token);
                        localStorage.setItem("game_token", JSON_response.game_token);
                        var main_div_1 = document.getElementById("app");
                        console.log(game_mode);
                        if (game_mode === GAME_MODE_1v1 || game_mode === GAME_MODE_2v2) {
                            // replace index.html with findingAnOpponent.html
                            main_div_1.innerHTML = loadFile("/views/findingAnOpponent.html");
                            // starting time
                            var start_1 = Date.now();
                            update_timer(main_div_1, start_1);
                            // listen for match up!
                            ClientSocket_js_1.ClientSocket.add_data_listener(match_making_listener, JSON_response.player_token);
                            // update the timer about every second
                            setInterval(function () { return update_timer(main_div_1, start_1); }, 1000);
                        }
                        else {
                            //replace index.html with game.html
                            main_div_1.innerHTML = loadFile("/views/game.html");
                            (0, Pixi_js_1.init_game)();
                        }
                    }
                }
            };
        }
    });
}
function loadFile(filePath) {
    var result = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status === 200) {
        result = xhr.responseText;
    }
    return result;
}
