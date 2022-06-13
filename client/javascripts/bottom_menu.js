import {ClientSocket} from "./ClientSocket.js";

import {MELEE} from "./game_graphics/Unit/Unit.js";
import {RANGE} from "./game_graphics/Unit/Unit.js";
import {CAVALRY} from "./game_graphics/Unit/Unit.js";

function get_unit_div(units){

}

export function show_city_bottom_menu(city){
    show_city_data(city);
    document.getElementById("bottom_city_menu").style.visibility = "visible";
}
export function hide_city_bottom_menu(){
    document.getElementById("bottom_city_menu").style.visibility = "hidden";
}
function show_city_data(city){
   document.getElementById("city_name").innerText = city.name;
   document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
   document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;

   // show units that can be produced
   // create html menu with javascript
   const div_production_menu = document.getElementById("production_menu");
   div_production_menu.removeChild(document.getElementById("unit_menu"));
   const div_unit_menu = document.createElement("div");
   div_unit_menu.id = "unit_menu";

   let index = 0;
   for(const unit_type of city.owner.production_unit_types){
       let row_div;

       if(index % 3 === 0) {
           row_div = document.createElement("div");
           row_div.className = "w3-row"
       }

       const unit_img = document.createElement("img");

       if(unit_type === MELEE) {
           unit_img.src = "/images/helmet.png"
           unit_img.onclick = function () {
               request_production(MELEE);
           };
       }else if(unit_type === RANGE){
           unit_img.src = "/images/archer.png"
           unit_img.onclick = function () {
               request_production(RANGE);
           };
       }else if(unit_type === CAVALRY){
           unit_img.src = "/images/knight.png"
           unit_img.onclick = function () {
               request_production(CAVALRY);
           };
       }
       unit_img.style.width = "50px";

       const produce_unit_div =  document.createElement("div");
       produce_unit_div.className = "w3-center w3-border"

       const col_div = document.createElement("div");
       col_div.className = "w3-col";
       col_div.style.width = "64px"
       col_div.id = index.toString();

       produce_unit_div.appendChild(unit_img);
       col_div.appendChild(produce_unit_div)
       row_div.appendChild(col_div)

       div_unit_menu.appendChild(row_div);
       div_production_menu.appendChild(div_unit_menu)
   }
}

export function show_unit_info_bottom_menu(units){
    show_city_data(units);
    document.getElementById("bottom_unit_menu").style.visibility = "visible";
}
export function hide_unit_info_bottom_menu() {
    document.getElementById("bottom_unit_menu").style.visibility = "hidden";
}
function show_unit_data(units){

}


function request_production(unit_type){
    ClientSocket.send_data({
        request_type: ClientSocket.request_types.PRODUCE_UNIT,
        data: {
            unit_type: unit_type,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
            city_name: document.getElementById("city_name").textContent
        }
    })
}

