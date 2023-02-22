import { ClientSocket } from "./ClientSocket.js";
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
    // const GAME_MODE_AI = "AI";
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
    var game_mode_rules = document.getElementById("game_mode_rules");
    game_mode_rules === null || game_mode_rules === void 0 ? void 0 : game_mode_rules.addEventListener("click", function onEvent() {
        var main_div = document.getElementById("app");
        main_div.innerHTML = loadFile("/views/gameRules.html");
        var rulesBackArrow = document.getElementById("rulesBackArrow");
        rulesBackArrow.onclick = function () {
            var main_div = document.getElementById("app");
            main_div.innerHTML = loadFile("/views/gameSettings.html");
            settingsLogicInit();
        };
        var enButton = document.getElementById("enButton");
        var czButton = document.getElementById("czButton");
        enButton.onclick = function () {
            document.getElementById('cs').style.display = 'none';
            document.getElementById('en').style.display = 'block';
            enButton.classList.remove("w3-red");
            enButton.classList.add("w3-green");
            czButton.classList.remove("w3-green");
            czButton.classList.add("w3-red");
        };
        czButton.onclick = function () {
            document.getElementById('cs').style.display = 'block';
            document.getElementById('en').style.display = 'none';
            czButton.classList.remove("w3-red");
            czButton.classList.add("w3-green");
            enButton.classList.remove("w3-green");
            enButton.classList.add("w3-red");
        };
    });
    var game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
    game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.addEventListener("click", function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_FRIEND;
        game_mode_to_FRIEND_button.classList.remove("w3-red");
        game_mode_to_FRIEND_button.classList.add("w3-green");
        var friend_code;
        var main_div = document.getElementById("app");
        main_div.innerHTML = loadFile("/views/friendSettings.html");
        // arrow back logic
        var friendSettingsBackArrow = document.getElementById("friendBackArrow");
        friendSettingsBackArrow.onclick = function () {
            var main_div = document.getElementById("app");
            main_div.innerHTML = loadFile("/views/gameSettings.html");
            settingsLogicInit();
        };
        // connect
        ClientSocket.connect();
        ClientSocket.socket.on("connect", function () {
            friend_code = ClientSocket.socket.id.substring(0, 5);
            document.getElementById("code").innerText = ClientSocket.socket.id.substring(0, 5);
            ;
            ClientSocket.sendData(ClientSocket.request_types.GENERATE_FRIEND_TOKEN, {
                map_size: map_size
            });
            ClientSocket.addDataListener();
        });
        var copy_button = document.getElementById("copy_button");
        if (copy_button != null) {
            copy_button.onclick = function () {
                // Copy the text inside the text field
                navigator.clipboard.writeText(friend_code)
                    .then(function () {
                    // change icon
                    copy_button.classList.remove("fa-copy");
                    copy_button.classList.add("fa-check");
                })
                    .catch(function () {
                    console.error("Error, something went wrong");
                });
            };
        }
        var connect_button = document.getElementById("connect_button");
        connect_button.onclick = function () {
            var friend_code = document.getElementById("friend_code").value;
            if (friend_code.length != 5) {
                document.getElementById("error_msg").innerText = "Invalid friend code! Must be 5 characters long.";
            }
            else {
                document.getElementById("error_msg").innerText = "";
                ClientSocket.sendData(ClientSocket.request_types.CONNECT_WITH_FRIEND, {
                    friend_code: friend_code
                });
            }
        };
    });
    var edit_nickname_button = document.getElementById("editNicknameButton");
    edit_nickname_button.onclick = function () {
        var currentNickname = localStorage.getItem("nickname");
        localStorage.removeItem("nickname");
        var main_div = document.getElementById("app");
        main_div.innerHTML = loadFile("/views/nicknameSettings.html");
        document.getElementById("nick_input").value = currentNickname;
        checkForNicknameInput();
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
        // if (game_mode === GAME_MODE_AI) {
        //     (<HTMLInputElement>document.querySelector("#title")).textContent = "LOADING AI";
        //
        //     console.log("LOADING AI");
        //     ClientSocket.addDataListener()
        //     ClientSocket.sendData(ClientSocket.request_types.FIND_AI_OPPONENT,
        //         {
        //             map_size: map_size
        //         });
        // }
        if (game_mode === GAME_MODE_1v1) {
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
function checkForNicknameInput() {
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
// check for input by default because index page starts on nickname input
checkForNicknameInput();
