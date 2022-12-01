import { ClientSocket } from "./ClientSocket.js";
import Unit from "./game_graphics/Unit/Unit.js";
function get_unit_div(units) {
}
export function show_city_bottom_menu(city) {
    show_city_data(city);
    document.getElementById("city_side_menu").style.visibility = "visible";
}
export function hide_city_bottom_menu() {
    document.getElementById("city_side_menu").style.visibility = "hidden";
}
function show_city_data(city) {
    document.getElementById("city_name").innerText = city.name;
    document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
    document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;
    // show units that can be produced
    // create html menu with javascript
    var div_side_menu = document.getElementById("city_side_menu");
    div_side_menu.removeChild(document.getElementById("unit_menu"));
    var div_unit_menu = document.createElement("div");
    div_unit_menu.id = "unit_menu";
    var index = 0;
    for (var _i = 0, _a = city.owner.production_unit_types; _i < _a.length; _i++) {
        var unit_type = _a[_i];
        var row_div = void 0;
        row_div = document.createElement("div");
        // row_div.className = "w3-row"
        var unit_img = document.createElement("img");
        if (unit_type === Unit.MELEE) {
            unit_img.src = "/images/warrior.png";
            unit_img.onclick = function () {
                request_production(Unit.MELEE);
            };
        }
        else if (unit_type === Unit.RANGE) {
            unit_img.src = "/images/slinger.png";
            unit_img.onclick = function () {
                request_production(Unit.RANGE);
            };
        }
        else if (unit_type === Unit.CAVALRY) {
            unit_img.src = "/images/knight.png";
            unit_img.onclick = function () {
                request_production(Unit.CAVALRY);
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
        div_side_menu.appendChild(div_unit_menu);
    }
}
export function show_unit_info_bottom_menu(units) {
    show_city_data(units);
    document.getElementById("bottom_unit_menu").style.visibility = "visible";
}
export function hide_unit_info_bottom_menu() {
    document.getElementById("bottom_unit_menu").style.visibility = "hidden";
}
function show_unit_data(units) {
}
function request_production(unit_type) {
    ClientSocket.send_data({
        request_type: ClientSocket.request_types.PRODUCE_UNIT,
        data: {
            unit_type: unit_type,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
            city_name: document.getElementById("city_name").textContent
        }
    });
}
