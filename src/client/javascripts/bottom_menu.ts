import {ClientSocket} from "./ClientSocket.js";

import Unit from "./game_graphics/Unit/Unit";

function get_unit_div(units: any){

}

export function show_city_bottom_menu(city: any){
    show_city_data(city);
    (<HTMLInputElement >document.getElementById("bottom_city_menu")).style.visibility = "visible";
}
export function hide_city_bottom_menu(){
    (<HTMLInputElement >document.getElementById("bottom_city_menu")).style.visibility = "hidden";
}
function show_city_data(city: any){
   (<HTMLInputElement >document.getElementById("city_name")).innerText = city.name;
   (<HTMLInputElement >document.getElementById("food_per_a_minute")).innerText = city.food_per_a_minute;
   (<HTMLInputElement >document.getElementById("production_per_a_minute")).innerText = city.production_per_a_minute;

   // show units that can be produced
   // create html menu with javascript
   const div_production_menu = (<HTMLInputElement >document.getElementById("production_menu"));
   div_production_menu.removeChild((<HTMLInputElement >document.getElementById("unit_menu")));
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

       if(unit_type === Unit.MELEE) {
           unit_img.src = "/images/warrior.png"
           unit_img.onclick = function () {
               request_production(Unit.MELEE);
           };
       }else if(unit_type === Unit.RANGE){
           unit_img.src = "/images/slinger.png"
           unit_img.onclick = function () {
               request_production(Unit.RANGE);
           };
       }else if(unit_type === Unit.CAVALRY){
           unit_img.src = "/images/knight.png"
           unit_img.onclick = function () {
               request_production(Unit.CAVALRY);
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
       row_div?.appendChild(col_div)

       div_unit_menu.appendChild(<HTMLInputElement> row_div);
       div_production_menu.appendChild(div_unit_menu)
   }
}

export function show_unit_info_bottom_menu(units: any){
    show_city_data(units);
    (<HTMLInputElement>document.getElementById("bottom_unit_menu")).style.visibility = "visible";
}
export function hide_unit_info_bottom_menu() {
    (<HTMLInputElement>document.getElementById("bottom_unit_menu")).style.visibility = "hidden";
}
function show_unit_data(units: any){

}


function request_production(unit_type: string){
    ClientSocket.send_data({
        request_type: ClientSocket.request_types.PRODUCE_UNIT,
        data: {
            unit_type: unit_type,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
            city_name: (<HTMLInputElement >document.getElementById("city_name")).textContent
        }
    })
}

