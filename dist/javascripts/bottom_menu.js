"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hide_unit_info_bottom_menu = exports.show_unit_info_bottom_menu = exports.hide_city_bottom_menu = exports.show_city_bottom_menu = void 0;
var ClientSocket_js_1 = require("./ClientSocket.js");
var Unit_1 = __importDefault(require("./game_graphics/Unit/Unit"));
function get_unit_div(units) {
}
function show_city_bottom_menu(city) {
    show_city_data(city);
    document.getElementById("bottom_city_menu").style.visibility = "visible";
}
exports.show_city_bottom_menu = show_city_bottom_menu;
function hide_city_bottom_menu() {
    document.getElementById("bottom_city_menu").style.visibility = "hidden";
}
exports.hide_city_bottom_menu = hide_city_bottom_menu;
function show_city_data(city) {
    document.getElementById("city_name").innerText = city.name;
    document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
    document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;
    // show units that can be produced
    // create html menu with javascript
    var div_production_menu = document.getElementById("production_menu");
    div_production_menu.removeChild(document.getElementById("unit_menu"));
    var div_unit_menu = document.createElement("div");
    div_unit_menu.id = "unit_menu";
    var index = 0;
    for (var _i = 0, _a = city.owner.production_unit_types; _i < _a.length; _i++) {
        var unit_type = _a[_i];
        var row_div = void 0;
        if (index % 3 === 0) {
            row_div = document.createElement("div");
            row_div.className = "w3-row";
        }
        var unit_img = document.createElement("img");
        if (unit_type === Unit_1.default.MELEE) {
            unit_img.src = "/images/warrior.png";
            unit_img.onclick = function () {
                request_production(Unit_1.default.MELEE);
            };
        }
        else if (unit_type === Unit_1.default.RANGE) {
            unit_img.src = "/images/slinger.png";
            unit_img.onclick = function () {
                request_production(Unit_1.default.RANGE);
            };
        }
        else if (unit_type === Unit_1.default.CAVALRY) {
            unit_img.src = "/images/knight.png";
            unit_img.onclick = function () {
                request_production(Unit_1.default.CAVALRY);
            };
        }
        unit_img.style.width = "50px";
        var produce_unit_div = document.createElement("div");
        produce_unit_div.className = "w3-center w3-border";
        var col_div = document.createElement("div");
        col_div.className = "w3-col";
        col_div.style.width = "64px";
        col_div.id = index.toString();
        produce_unit_div.appendChild(unit_img);
        col_div.appendChild(produce_unit_div);
        row_div === null || row_div === void 0 ? void 0 : row_div.appendChild(col_div);
        div_unit_menu.appendChild(row_div);
        div_production_menu.appendChild(div_unit_menu);
    }
}
function show_unit_info_bottom_menu(units) {
    show_city_data(units);
    document.getElementById("bottom_unit_menu").style.visibility = "visible";
}
exports.show_unit_info_bottom_menu = show_unit_info_bottom_menu;
function hide_unit_info_bottom_menu() {
    document.getElementById("bottom_unit_menu").style.visibility = "hidden";
}
exports.hide_unit_info_bottom_menu = hide_unit_info_bottom_menu;
function show_unit_data(units) {
}
function request_production(unit_type) {
    ClientSocket_js_1.ClientSocket.send_data({
        request_type: ClientSocket_js_1.ClientSocket.request_types.PRODUCE_UNIT,
        data: {
            unit_type: unit_type,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
            city_name: document.getElementById("city_name").textContent
        }
    });
}
