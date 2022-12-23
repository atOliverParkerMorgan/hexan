import { ClientSocket } from "./ClientSocket.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import { Node } from "./GameGraphics/Node.js";
import { Player } from "./GameGraphics/Player.js";
import { Technology, graph, interaction_nodes_values } from "./GameGraphics/Technology/Technology.js";
import { DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, viewport, WORLD_HEIGHT, WORLD_WIDTH } from "./GameGraphics/Pixi.js";
import { settingsLogicInit } from "./ClientCreateGame.js";
import { Interval } from "./GameGraphics/Interval.js";
export var renderer;
export var current_node;
var current_city;
var is_mouse_on_city_menu = false;
var are_listeners_added = false;
// hot keys
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        hideCityMenu();
        hideUnitInfo();
    }
});
export function showNodeInfo(node) {
    var _a, _b, _c, _d;
    if (node.type === Node.HIDDEN)
        return;
    current_node = node;
    updateNodeActionButtonAndInformation(node);
    document.getElementById("node_info_menu").style.visibility = "visible";
    document.getElementById("node_info_title").innerText = node.getTypeString();
    var div_unit_info_menu = document.getElementById("node_info_menu");
    div_unit_info_menu.querySelector("#hide_node_info_button").onclick = hideNodeInfo;
    if (node.canBeHarvested()) {
        div_unit_info_menu.querySelector("#harvest_button").style.visibility = "visible";
        if (Player.getTotalNumberOfStars() < node.harvest_cost) {
            (_a = document.getElementById("harvest_button")) === null || _a === void 0 ? void 0 : _a.classList.remove("w3-green");
            (_b = document.getElementById("harvest_button")) === null || _b === void 0 ? void 0 : _b.classList.add("w3-red");
        }
        else {
            (_c = document.getElementById("harvest_button")) === null || _c === void 0 ? void 0 : _c.classList.remove("w3-red");
            (_d = document.getElementById("harvest_button")) === null || _d === void 0 ? void 0 : _d.classList.add("w3-green");
        }
        div_unit_info_menu.querySelector("#harvest_button").onclick = function () { return ClientSocket.requestHarvest(node.x, node.y); };
    }
    else {
        div_unit_info_menu.querySelector("#harvest_button").style.visibility = "hidden";
    }
}
function updateNodeActionButtonAndInformation(node) {
    document.getElementById("harvest_cost").innerText = node.harvest_cost.toString();
    document.getElementById("gain_stars").innerText = node.production_stars.toString();
    switch (node.type) {
        case Node.FOREST:
            document.getElementById("node_info_image").src = "/images/grass_plane.png";
            break;
        case Node.MOUNTAIN:
            document.getElementById("node_info_image").src = "/images/mountains.png";
            break;
        case Node.GRASS:
            document.getElementById("node_info_image").src = "/images/grass_plane.png";
            break;
    }
}
export function hideNodeInfo() {
    document.getElementById("harvest_button").style.visibility = "hidden";
    document.getElementById("node_info_menu").style.visibility = "hidden";
}
export function showUnitInfo(unit) {
    updateUnitActionButton(unit);
    document.getElementById("unit_info_image").src = unit.texture_path;
    document.getElementById("unit_info_menu").style.visibility = "visible";
    document.getElementById("unit_info_title").innerText = unit.type;
    document.getElementById("unit_info_attack_data").innerText = unit.attack.toString();
    document.getElementById("unit_info_health_data").innerText = unit.health.toString();
    document.getElementById("unit_info_range_data").innerText = unit.range.toString();
    document.getElementById("unit_info_movement_data").innerText = unit.movement.toString();
    var div_unit_info_menu = document.getElementById("unit_info_menu");
    div_unit_info_menu.querySelector("#hide_unit_info_button").onclick = hideUnitInfo;
    div_unit_info_menu.querySelector("#action_button").onclick = function () { return unitAction(unit); };
}
function updateUnitActionButton(unit) {
    document.getElementById("action_button_text").innerText = unit.action;
    switch (unit.action) {
        case Unit.FORTIFY:
            document.getElementById("action_image").src = "/images/shield.png";
            break;
        case Unit.SETTLE:
            document.getElementById("action_image").src = "/images/settler.png";
            break;
        case Unit.BUILD:
            break;
    }
}
// send a request for a unit action to the server
function unitAction(unit) {
    ClientSocket.requestUnitAction(unit);
}
export function hideUnitInfo() {
    document.getElementById("unit_info_menu").style.visibility = "hidden";
}
export function showCityMenu(city) {
    current_city = city;
    if (!are_listeners_added) {
        document.getElementById("city_side_menu").addEventListener("mouseover", function () {
            if (!is_mouse_on_city_menu) {
                is_mouse_on_city_menu = true;
                viewport.plugins.pause('wheel');
                viewport.plugins.pause('drag');
                viewport.plugins.pause('decelerate');
                if (current_city != null) {
                    // get city cords
                    var row_bias = current_city.y % 2 === 0 ? DISTANCE_BETWEEN_HEX / 2 : 0;
                    var city_x = (current_city.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
                    var city_y = (current_city.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
                    viewport.snap(city_x, city_y, { removeOnComplete: true });
                }
            }
        }, false);
        document.getElementById("city_side_menu").addEventListener("mouseleave", function () {
            if (is_mouse_on_city_menu) {
                is_mouse_on_city_menu = false;
                viewport.plugins.resume('wheel');
                viewport.plugins.resume('drag');
                viewport.plugins.resume('decelerate');
            }
        }, false);
        are_listeners_added = true;
    }
    showCityData(city);
    document.getElementById("city_side_menu").style.visibility = "visible";
}
export function hideCityMenu() {
    // move info menu
    document.getElementById("unit_info_menu").style.right = "0";
    document.getElementById("city_side_menu").style.visibility = "hidden";
}
export function gameOver(title, message, w3_color_classname) {
    clearInterval(Interval.update_stars_interval_id);
    clearInterval(Interval.update_progress_bar_interval_id);
    document.getElementById("game_over_modal").style.display = "block";
    document.getElementById("game_over_modal_title").innerText = title;
    document.getElementById("game_over_modal_message").innerText = message;
    document.getElementById("game_over_modal_header").classList.add(w3_color_classname);
    document.getElementById("play_again").onclick = function () {
        var main_div = document.getElementById("app");
        main_div.innerHTML = loadFile("/views/gameSettings.html");
        settingsLogicInit();
    };
    document.getElementById("view_game").onclick = function () {
        document.getElementById("game_over_modal").style.display = "none";
    };
}
function showCityData(city) {
    // move info menu
    document.getElementById("unit_info_menu").style.right = "420px";
    document.getElementById("city_name").innerText = city.name;
    document.getElementById("city_stars_per_min").innerText = city.stars_per_a_minute;
    // (<HTMLInputElement >document.getElementById("city_population")).innerText = city.population;
    // show units that can be produced
    // create html menu with javascript
    var div_side_menu = document.getElementById("city_side_menu");
    div_side_menu.removeChild(document.getElementById("unit_menu"));
    div_side_menu.querySelector("#hide_city_menu_button").onclick = hideCityMenu;
    var ul_unit_menu = document.createElement("ul");
    ul_unit_menu.id = "unit_menu";
    ul_unit_menu.className = "w3-ul w3-card-4";
    if (Player.production_units.length === 0) {
        div_side_menu.querySelector("#unit_title").visibility = "hidden";
    }
    // unit item
    for (var _i = 0, _a = Player.production_units; _i < _a.length; _i++) {
        var unit = _a[_i];
        var unit_html = document.createElement("li");
        unit_html.className = "w3-bar";
        unit_html.innerHTML = loadFile("/views/unit_item.html");
        unit_html = setUnitData(unit_html, unit.name, "/images/" + unit.name.toLowerCase() + ".png", unit.type, unit.damage, unit.health, unit.movement, unit.cost);
        ul_unit_menu.appendChild(unit_html);
        div_side_menu.appendChild(ul_unit_menu);
    }
}
function setUnitData(unit_html, unit_name, src, type, damage, health, movement, cost) {
    unit_html.querySelector("#image").src = src;
    unit_html.querySelector("#produce").src = "/images/production.png";
    unit_html.querySelector("#produce").onclick = function () {
        ClientSocket.requestProduction(unit_name);
    };
    unit_html.querySelector("#name").innerText = unit_name;
    unit_html.querySelector("#type").innerText = type;
    unit_html.querySelector("#cost").innerText = cost;
    unit_html.querySelector("#damage").innerText = damage;
    unit_html.querySelector("#health").innerText = health;
    unit_html.querySelector("#movement").innerText = movement;
    return unit_html;
}
// updates the total stars on screen
export function updateStarInfo(total_owned_stars, star_production) {
    document.getElementById("star_info").style.visibility = "visible";
    if (current_node != null && (Number(total_owned_stars.toFixed(1)) - Math.floor(total_owned_stars)) === 0 && document.getElementById("node_info_menu").style.visibility === "visible") {
        showNodeInfo(current_node);
    }
    document.getElementById("total_owned_stars").innerText = Math.floor(total_owned_stars).toString();
    if (star_production != null) {
        document.getElementById("star_production").innerText = star_production.toString();
    }
}
export function updateProgressBar(total_owned_stars) {
    var number_of_bars = (Number(total_owned_stars.toFixed(1)) - Math.floor(total_owned_stars));
    var bars = "";
    for (var i = 0; i < Math.round(number_of_bars * 10); i++) {
        bars += "=";
    }
    document.getElementById("star_loading_bar").innerText = bars;
}
export function createTechTree() {
    //add canvas element
    var _a;
    var TECH_TREE_CANVAS_WIDTH = document.body.clientWidth;
    var TECH_TREE_CANVAS_HEIGHT = document.body.clientHeight;
    var SPACE_BETWEEN_NODES_X = 160;
    var SPACE_BETWEEN_NODES_Y = 100;
    // is used for selecting tech tree nodes
    var pan_x = 0;
    var pan_y = 0;
    var mouse_x = 0;
    var mouse_y = 0;
    var old_mouse_x = 0;
    var old_mouse_y = 0;
    var mouse_held = false;
    var tech_tree_canvas = document.createElement("canvas");
    tech_tree_canvas.id = "tech_tree";
    tech_tree_canvas.width = TECH_TREE_CANVAS_WIDTH;
    tech_tree_canvas.height = TECH_TREE_CANVAS_HEIGHT;
    tech_tree_canvas.style.border = "solid 1px black";
    tech_tree_canvas.style.borderRadius = "border-radius: 10px";
    tech_tree_canvas.onmousedown = function () {
        mouse_held = true;
        interaction_nodes_values.map(function (node_cords) {
            // make sure that user is hovering over this node and that it isn't already purchased
            if (node_cords[5] && !node_cords[6]) {
                ClientSocket.requestBuyTechnology(node_cords[0]);
                mouse_held = false;
                return;
            }
        });
    };
    tech_tree_canvas.onmousemove = function (event) {
        mouse_x = event.clientX;
        mouse_y = event.clientY;
        if (mouse_held) {
            pan_x += old_mouse_x - mouse_x;
            pan_y += old_mouse_y - mouse_y;
        }
        var x = mouse_x - TECH_TREE_CANVAS_WIDTH / 2;
        var y = mouse_y - TECH_TREE_CANVAS_HEIGHT / 2;
        interaction_nodes_values.map(function (node_cords) {
            if (node_cords[1] < x && node_cords[2] < y && node_cords[3] > x && node_cords[4] > y) {
                node_cords[5] = true;
                return;
            }
            else {
                node_cords[5] = false;
            }
        });
        old_mouse_x = mouse_x;
        old_mouse_y = mouse_y;
        renderer.start();
    };
    tech_tree_canvas.onmouseup = function () {
        mouse_held = false;
    };
    (_a = document.getElementById("tech_tree_container")) === null || _a === void 0 ? void 0 : _a.appendChild(tech_tree_canvas);
    // make a new graph
    Technology.initGraphArrays();
    // @ts-ignore
    var layout = new Springy.Layout.ForceDirected(graph, 300.0, // Spring stiffness
    800.0, // Node repulsion
    0.5 // Damping
    );
    var canvas = document.getElementById('tech_tree');
    var ctx = canvas.getContext('2d');
    var background_gradient = ctx.createLinearGradient(0, 0, TECH_TREE_CANVAS_WIDTH, TECH_TREE_CANVAS_HEIGHT);
    background_gradient.addColorStop(0, "#2c5364");
    background_gradient.addColorStop(0.5, "#203a43");
    background_gradient.addColorStop(1, "#0f2027");
    // @ts-ignore
    renderer = new Springy.Renderer(layout, function clear() {
        ctx.fillStyle = background_gradient;
        ctx.fillRect(0, 0, TECH_TREE_CANVAS_WIDTH, TECH_TREE_CANVAS_HEIGHT);
    }, function drawEdge(edge, p1, p2) {
        ctx.save();
        ctx.translate(TECH_TREE_CANVAS_WIDTH / 2, TECH_TREE_CANVAS_HEIGHT / 2);
        ctx.strokeStyle = 'rgba(255,255,255)';
        ctx.lineWidth = 3.0;
        ctx.beginPath();
        var x1 = p1.x * SPACE_BETWEEN_NODES_X - pan_x;
        var y1 = p1.y * SPACE_BETWEEN_NODES_Y - pan_y;
        var x2 = p2.x * SPACE_BETWEEN_NODES_X - pan_x;
        var y2 = p2.y * SPACE_BETWEEN_NODES_Y - pan_y;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }, function drawNode(node, p) {
        ctx.save();
        ctx.translate(TECH_TREE_CANVAS_WIDTH / 2, TECH_TREE_CANVAS_HEIGHT / 2);
        var name_measurement = ctx.measureText(node.data.name);
        var lines = node.data.description.split("\n");
        var longest_line = -1;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (longest_line < ctx.measureText(line).width) {
                longest_line = ctx.measureText(line).width;
            }
        }
        var x = p.x * SPACE_BETWEEN_NODES_X - pan_x;
        var y = p.y * SPACE_BETWEEN_NODES_Y - pan_y;
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        var image = new Image();
        image.src = node.data.image;
        // is used for root node
        if (node.data.name !== "") {
            var rect_x_1 = x - name_measurement.width / 2.0 - longest_line;
            var rect_y_1 = y - 70 - 10 * lines.length;
            var rect_width_1 = (longest_line) * 2;
            var rect_height_1 = 100 + 20 * lines.length;
            interaction_nodes_values.map(function (node_cords) {
                if (node_cords[0] === node.data.name) {
                    // console.log("update")
                    node_cords[1] = rect_x_1;
                    node_cords[2] = rect_y_1;
                    node_cords[3] = rect_x_1 + rect_width_1;
                    node_cords[4] = rect_y_1 + rect_height_1;
                    // color nodes depending on if they are owned by the player
                    if (!node_cords[6]) {
                        ctx.fillStyle = "#880808";
                    }
                    // is selected
                    if (node_cords[5]) {
                        ctx.fillStyle = "#808080";
                    }
                    if (node_cords[6]) {
                        ctx.fillStyle = "#15783D";
                    }
                    return;
                }
            });
            try {
                ctx.roundRect(rect_x_1, rect_y_1, rect_width_1, rect_height_1, [0, 50, 0, 25]);
            }
            catch (e) {
                // for Firefox
                ctx.rect(rect_x_1, rect_y_1, rect_width_1, rect_height_1);
            }
            ctx.drawImage(image, x + (longest_line) - 90, y - 60 - 10 * lines.length, 50, 50);
        }
        else {
            var width = 130;
            var height = 210;
            ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        }
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.font = "18px 'IM Fell English', 'Times New Roman', serif";
        ctx.fillStyle = '#FFFFFF';
        var y_bias = 1;
        for (var _a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
            var line = lines_2[_a];
            ctx.fillText(line, x - name_measurement.width / 2.0 + 10 - longest_line, y - 15 + 20 * y_bias);
            y_bias++;
        }
        ctx.font = "32px 'IM Fell English', 'Times New Roman', serif";
        ctx.fillText(node.data.name, x - name_measurement.width / 2.0 + 10 - longest_line, y - 40 - 10 * lines.length);
        if (node.data.name != "") {
            var star_image = new Image();
            star_image.src = "/images/star.png";
            var star_width = 30;
            ctx.drawImage(star_image, x + (longest_line) - 125, y - 35 - 10 * lines.length - star_width, star_width, star_width);
            ctx.fillText(node.data.cost, x + longest_line - 85, y - 40 - 10 * lines.length);
        }
        ctx.restore();
    });
    renderer.start();
}
var is_tech_tree_hidden = true;
export function setupTechTreeButton() {
    document.getElementById("tech_button").onclick = function () {
        if (is_tech_tree_hidden) {
            showTechTree();
        }
        else {
            hideTechTree();
        }
        is_tech_tree_hidden = !is_tech_tree_hidden;
    };
}
export function showTechTree() {
    document.getElementsByTagName("canvas")[0].style.visibility = "hidden";
    document.getElementById("star_info").style.color = "white";
    createTechTree();
}
export function hideTechTree() {
    var _a;
    document.getElementsByTagName("canvas")[1].style.visibility = "visible";
    document.getElementById("star_info").style.color = "black";
    (_a = document.getElementById("tech_tree_container")) === null || _a === void 0 ? void 0 : _a.removeChild(document.getElementById("tech_tree"));
}
export function showModal(title, message, w3_color_classname) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modal_title").innerText = title;
    document.getElementById("modal_message").innerText = message;
    document.getElementById("modal_header").classList.add(w3_color_classname);
}
function loadFile(filePath) {
    var result = null;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status === 200) {
        result = xhr.responseText;
    }
    else {
        return "";
    }
    return result;
}
