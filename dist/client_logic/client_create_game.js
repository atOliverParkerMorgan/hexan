import { init_game } from "./game_graphics/Pixi.js";
var REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH"
};
var interval_id_timer;
var interval_id_match_request;
function settings_logic_init() {
    // slider logic
    var args = [400, 900, 1225, 1600, 2025, 2500];
    var element = document.querySelector('.slider');
    element.onchange = slider_onchange;
    element === null || element === void 0 ? void 0 : element.setAttribute('step', args[0].toString());
    var map_size = 1225;
    function slider_onchange() {
        element === null || element === void 0 ? void 0 : element.removeAttribute('step');
        map_size = element.value;
        for (var i = 0; i < args.length; i++) {
            if (args[i] > map_size) {
                map_size = args[i];
                element.value = args[i];
                break;
            }
        }
        var node_num_text = document.getElementById('number_of_nodes');
        node_num_text.innerText = map_size.toString();
    }
    // game mode button logic
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
    // play button logic
    var play_button = document.getElementById("play_button");
    play_button.onclick = function () {
        var nick_name = localStorage.getItem("nick_name");
        if (nick_name == null)
            return;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", window.location.href, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        console.log("nick_name: ".concat(nick_name, " map_size: ").concat(map_size, " game_mode: ").concat(game_mode, " request_type: ").concat(REQUEST_TYPES.GENERATE_PLAYER_TOKEN));
        xhr.send(JSON.stringify({
            nick_name: nick_name,
            map_size: map_size,
            game_mode: game_mode,
            request_type: REQUEST_TYPES.GENERATE_PLAYER_TOKEN
        }));
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var JSON_response_1 = JSON.parse(xhr.responseText);
                    localStorage.setItem("player_token", JSON_response_1.player_token);
                    var main_div_1 = document.getElementById("app");
                    // replace index.html with findingAnOpponent.html
                    main_div_1.innerHTML = loadFile("/views/findingAnOpponent.html");
                    if (game_mode === GAME_MODE_AI) {
                        var title = document.querySelector("#title");
                        if (title != null) {
                            title.textContent = "LOADING AI";
                        }
                    }
                    // starting time
                    var start_1 = Date.now();
                    update_timer(main_div_1, start_1);
                    // update the timer about every second
                    interval_id_timer = setInterval(function () { return update_timer(main_div_1, start_1); }, 1000);
                    // send POST request if there is available match
                    request_match_status_update(JSON_response_1.player_token, nick_name, map_size, game_mode);
                    interval_id_match_request = setInterval(function () { return request_match_status_update(JSON_response_1.player_token, nick_name, map_size, game_mode); }, 1000);
                }
            }
        };
    };
}
// ask if their server has a match
function request_match_status_update(player_token, nick_name, map_size, game_mode) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", window.location.href, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        nick_name: nick_name,
        player_token: player_token,
        map_size: map_size,
        game_mode: game_mode,
        request_type: REQUEST_TYPES.FIND_MATCH
    }));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // store game token
                var JSON_response = JSON.parse(xhr.responseText);
                localStorage.setItem("game_token", JSON_response.game_token);
                // init game
                var main_div = document.getElementById("app");
                //replace index.html with game.html
                main_div.innerHTML = loadFile("/views/game.html");
                init_game();
                clearInterval(interval_id_timer);
                clearInterval(interval_id_match_request);
            }
        }
    };
}
function update_timer(main_div, start) {
    var delta = Date.now() - start;
    var seconds = (Math.floor(delta / 1000));
    var minutes = Math.floor(seconds / 60);
    var seconds_string = seconds % 60 === 1 ? "second" : "seconds";
    var minute_string = minutes > 1 ? "minutes" : "minute";
    var minute_text = minutes === 0 ? "" : (minutes) + " " + minute_string + "  :  ";
    main_div.querySelector("span").innerText = minute_text + (seconds % 60) + " " + seconds_string;
}
var nick_input = document.getElementById("nick_input");
if (nick_input != null) {
    nick_input.addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter" && nick_input.value.length > 0) {
            localStorage.setItem("nick_name", nick_input.value);
            var main_div = document.getElementById("app");
            main_div.innerHTML = loadFile("/views/gameSettings.html");
            settings_logic_init();
        }
    });
}
export function loadFile(filePath) {
    var result = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status === 200) {
        result = xhr.responseText;
    }
    return result;
}
