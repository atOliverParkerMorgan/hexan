var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ClientSocket } from "./ClientSocket.js";
// Preload the HTML file
function preloadHtmlFiles(urls) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, urls_1, url, response, html, cache, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, urls_1 = urls;
                    _a.label = 1;
                case 1:
                    if (!(_i < urls_1.length)) return [3 /*break*/, 9];
                    url = urls_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    console.log("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port, ":").concat(window.location.port, "/").concat(url));
                    return [4 /*yield*/, fetch("".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port, "/").concat(url))];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.text()];
                case 4:
                    html = _a.sent();
                    return [4 /*yield*/, window.caches.open("html-preload")];
                case 5:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.put(url, new Response(html))];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error preloading HTML file ".concat(window.location.protocol, "//").concat(window.location.hostname, ":").concat(window.location.port, ": ").concat(error_1.message));
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
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
        loadFile("/views/gameRules.html").then(function (html_file) {
            main_div.innerHTML = html_file;
            var rulesBackArrow = document.getElementById("rulesBackArrow");
            rulesBackArrow.onclick = function () {
                var main_div = document.getElementById("app");
                loadFile("/views/gameSettings.html").then(function (html_file) {
                    main_div.innerHTML = html_file;
                    settingsLogicInit();
                });
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
    });
    var game_mode_to_FRIEND_button = document.getElementById("game_mode_to_FRIEND_button");
    game_mode_to_FRIEND_button === null || game_mode_to_FRIEND_button === void 0 ? void 0 : game_mode_to_FRIEND_button.addEventListener("click", function onEvent() {
        changeLastSelectedButtonToRed();
        game_mode = GAME_MODE_FRIEND;
        game_mode_to_FRIEND_button.classList.remove("w3-red");
        game_mode_to_FRIEND_button.classList.add("w3-green");
        var friend_code;
        var main_div = document.getElementById("app");
        loadFile("/views/friendSettings.html").then(function (html_file) {
            main_div.innerHTML = html_file;
            // arrow back logic
            var friendSettingsBackArrow = document.getElementById("friendBackArrow");
            friendSettingsBackArrow.onclick = function () {
                var main_div = document.getElementById("app");
                loadFile("/views/gameSettings.html").then(function (html_file) {
                    main_div.innerHTML = html_file;
                    settingsLogicInit();
                });
            };
            // connect
            ClientSocket.connect();
            ClientSocket.socket.on("connect", function () {
                document.getElementById("code").innerText = ClientSocket.socket.id.substring(0, 5);
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
    });
    var edit_nickname_button = document.getElementById("editNicknameButton");
    edit_nickname_button.onclick = function () {
        var currentNickname = localStorage.getItem("nickname");
        localStorage.removeItem("nickname");
        var main_div = document.getElementById("app");
        loadFile("/views/nicknameSettings.html").then(function (html_file) {
            main_div.innerHTML = html_file;
            document.getElementById("nick_input").value = currentNickname;
            checkForNicknameInput();
        });
    };
    // play button logic
    var play_button = document.getElementById("play_button");
    play_button.onclick = function () {
        var nickname = localStorage.getItem("nickname");
        if (nickname == null)
            return;
        var main_div = document.getElementById("app");
        // replace index.html with findingAnOpponent.html
        loadFile("/views/findingAnOpponent.html").then(function (html_file) {
            main_div.innerHTML = html_file;
            // starting time
            var start = Date.now();
            updateTimer(main_div, start);
            // update the timer about every second
            interval_id_timer = setInterval(function () { return updateTimer(main_div, start); }, 1000);
            ClientSocket.connect();
            if (game_mode === GAME_MODE_1v1) {
                ClientSocket.addDataListener();
                ClientSocket.sendData(ClientSocket.request_types.FIND_1v1_OPPONENT, {
                    map_size: map_size
                });
            }
        });
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
        var main_div_1 = document.getElementById("app");
        loadFile("/views/gameSettings.html").then(function (html_file) {
            main_div_1.innerHTML = html_file;
            settingsLogicInit();
        });
    }
    var nick_input = document.getElementById("nick_input");
    if (nick_input != null) {
        nick_input.addEventListener("keypress", function onEvent(event) {
            if (event.key === "Enter" && nick_input.value.length > 0) {
                localStorage.setItem("nickname", nick_input.value);
                var main_div_2 = document.getElementById("app");
                loadFile("/views/gameSettings.html").then(function (html_file) {
                    main_div_2.innerHTML = html_file;
                    settingsLogicInit();
                });
            }
        });
    }
}
// export function loadFile(filePath: string) {
//     let result = null;
//     let xhr = new XMLHttpRequest();
//     xhr.open("GET", filePath, false);
//     xhr.send();
//     if (xhr.status===200) {
//         result = xhr.responseText;
//     }
//     return result;
// }
// Get the HTML data from cache
export function loadFile(url) {
    return __awaiter(this, void 0, void 0, function () {
        var cache, cachedResponse, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, window.caches.open('html-preload')];
                case 1:
                    cache = _a.sent();
                    return [4 /*yield*/, cache.match(url)];
                case 2:
                    cachedResponse = _a.sent();
                    if (!cachedResponse) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, cachedResponse.text()];
                case 3: 
                // Return the HTML data
                return [2 /*return*/, _a.sent()];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error retrieving HTML file ".concat(url, " from cache: ").concat(error_2.message));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// preload all files
preloadHtmlFiles(['views/gameSettings.html', 'views/friendSettings.html', 'views/gameRules.html', 'views/findingAnOpponent.html', 'views/nicknameSettings.html', 'views/unit_item.html', 'views/game.html']).then(function () {
    document.getElementById("loading").style.display = 'none';
    document.getElementById("nick_input_form").style.display = 'block';
    // check for input by default because index page starts on nickname input
    checkForNicknameInput();
});
