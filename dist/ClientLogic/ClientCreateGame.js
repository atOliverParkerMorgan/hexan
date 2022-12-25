import { ClientSocket } from "./ClientSocket.js";
var REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH",
    START_GAME: "START_GAME"
};
export var interval_id_timer;
export function settingsLogicInit() {
    // setup nickname
    document.getElementById("nickname").textContent = localStorage.getItem("nickname");
    // slider logic
    var args = [400, 900, 1225, 1600, 2025, 2500];
    var element = document.querySelector('.slider');
    element.onchange = sliderOnchange;
    element === null || element === void 0 ? void 0 : element.setAttribute('step', args[0].toString());
    var map_size = 1225;
    function sliderOnchange() {
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
    function changeLastSelectedButtonToRed() {
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
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_1v1;
        game_mode_to_1v1_button.classList.remove("w3-red");
        game_mode_to_1v1_button.classList.add("w3-green");
    });
    var game_mode_to_2v2_button = document.getElementById("game_mode_to_2v2_button");
    game_mode_to_2v2_button === null || game_mode_to_2v2_button === void 0 ? void 0 : game_mode_to_2v2_button.addEventListener("click", function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_2v2;
        game_mode_to_2v2_button.classList.remove("w3-red");
        game_mode_to_2v2_button.classList.add("w3-green");
    });
    var game_mode_to_AI_button = document.getElementById("game_mode_to_AI_button");
    game_mode_to_AI_button === null || game_mode_to_AI_button === void 0 ? void 0 : game_mode_to_AI_button.addEventListener("click", function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_AI;
        game_mode_to_AI_button.classList.remove("w3-red");
        game_mode_to_AI_button.classList.add("w3-green");
    });
    var game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
    game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.addEventListener("click", function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_FRIEND;
        game_mode_to_FRIEND_button.classList.remove("w3-red");
        game_mode_to_FRIEND_button.classList.add("w3-green");
    });
    var edit_nickname_button = document.getElementById("edit_nickname");
    edit_nickname_button.onclick = function () {
        localStorage.removeItem("nickname");
        window.location.reload();
    };
    // play button logic
    var play_button = document.getElementById("play_button");
    play_button.onclick = function () {
        var nickname = localStorage.getItem("nickname");
        console.log("Nick Name: ", nickname);
        if (nickname == null)
            return;
        var main_div = document.getElementById("app");
        // replace index.html with findingAnOpponent.html
        main_div.innerHTML = loadFile("/views/findingAnOpponent.html");
        // starting time
        var start = Date.now();
        updateTimer(main_div, start);
        // update the timer about every second
        interval_id_timer = setInterval(function () { return updateTimer(main_div, start); }, 1000);
        ClientSocket.connect();
        if (game_mode === GAME_MODE_AI) {
            document.querySelector("#title").textContent = "LOADING AI";
            console.log("LOADING AI");
            ClientSocket.addDataListener();
            ClientSocket.sendData(ClientSocket.request_types.FIND_AI_OPPONENT, {
                map_size: map_size
            });
        }
        else if (game_mode === GAME_MODE_1v1) {
            console.log("LOADING 1v1");
            ClientSocket.addDataListener();
            ClientSocket.sendData(ClientSocket.request_types.FIND_1v1_OPPONENT, {
                map_size: map_size
            });
        }
    };
}
function updateTimer(main_div, start) {
    var delta = Date.now() - start;
    var seconds = (Math.floor(delta / 1000));
    var minutes = Math.floor(seconds / 60);
    var seconds_string = seconds % 60 === 1 ? "second" : "seconds";
    var minute_string = minutes > 1 ? "minutes" : "minute";
    var minute_text = minutes === 0 ? "" : (minutes) + " " + minute_string + "  :  ";
    main_div.querySelector("span").innerText = minute_text + (seconds % 60) + " " + seconds_string;
}
// load right away if a nickname exists
if (localStorage.getItem("nickname") != null) {
    var main_div = document.getElementById("app");
    main_div.innerHTML = loadFile("/views/gameSettings.html");
    settingsLogicInit();
}
var nick_input = document.getElementById("nick_input");
if (nick_input != null) {
    nick_input.addEventListener("keypress", function onEvent(event) {
        if (event.key === "Enter" && nick_input.value.length > 0) {
            localStorage.setItem("nickname", nick_input.value);
            var main_div = document.getElementById("app");
            main_div.innerHTML = loadFile("/views/gameSettings.html");
            settingsLogicInit();
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
