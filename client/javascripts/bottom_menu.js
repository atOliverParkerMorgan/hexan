import {ClientSocket} from "./ClientSocket.js";
const KNIGHT = 0;


let bottom_menu = document.getElementById("bottom_menu");

export function show_bottom_menu(city){
    show_city_data(city);
    bottom_menu.style.visibility = "visible";
    console.log("here");
}
export function hide_bottom_menu(){
    bottom_menu.style.visibility = "hidden";
    console.log("here");
}
function show_city_data(city){
    document.getElementById("city_name").innerText = city.name;
    document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
    document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;
}

function request_production(){
    ClientSocket.send_data({
        request_type: KNIGHT,
        player_token: localStorage.player_token,
        game_token: localStorage.game_token,
        city_name: document.getElementById("city_name").textContent
    })
}

document.getElementById("warrior").addEventListener("click", request_production);