import { ClientSocket } from "./ClientSocket.js";
var REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH",
    START_GAME: "START_GAME"
};
export var interval_id_timer;
export var interval_id_start_game;
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
    console.log("heeea");
    play_button.onclick = function () {
        var nick_name = localStorage.getItem("nick_name");
        console.log("Nick Name: ", nick_name);
        if (nick_name == null)
            return;
        var main_div = document.getElementById("app");
        // replace index.html with findingAnOpponent.html
        main_div.innerHTML = loadFile("/views/findingAnOpponent.html");
        // starting time
        var start = Date.now();
        update_timer(main_div, start);
        // update the timer about every second
        interval_id_timer = setInterval(function () { return update_timer(main_div, start); }, 1000);
        ClientSocket.connect();
        if (game_mode === GAME_MODE_AI) {
            document.querySelector("#title").textContent = "LOADING AI";
            console.log("LOADING AI");
            ClientSocket.add_data_listener();
            ClientSocket.send_data({
                request_type: ClientSocket.request_types.FIND_AI_OPPONENT,
                data: { map_size: map_size }
            });
        }
        else if (game_mode === GAME_MODE_1v1) {
            console.log("LOADING 1v1");
            ClientSocket.add_data_listener();
            ClientSocket.send_data({
                request_type: ClientSocket.request_types.FIND_1v1_OPPONENT,
                data: { map_size: map_size }
            });
        }
    };
}
function show_opponent_found() {
    var info_div = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/opponent_found.html");
}
function show_waiting_for_opponent_to_accept() {
    var info_div = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/waiting_for_opponent.html");
}
function show_opponent_didnt_accept() {
    var info_div = document.getElementById("info");
    info_div.innerHTML = loadFile("/views/opponent_didnt_accept.html");
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
