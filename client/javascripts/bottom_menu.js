import {ClientSocket} from "./ClientSocket.js";

let bottom_menu = document.getElementById("bottom_menu");

export function show_bottom_menu(city){
    console.log("CITYYY");
    console.log(city);
    show_city_data(city);
    bottom_menu.style.visibility = "visible";
}
export function hide_bottom_menu(){
    bottom_menu.style.visibility = "hidden";
}
function show_city_data(city){
   document.getElementById("city_name").innerText = city.name;
   document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
   document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;

   // show units that can be produced
   // create html element
   const unit_img = document.createElement("img");
   unit_img.src = "/images/helmet.png"
   const produce_unit_div =  document.createElement("div");
   produce_unit_div.className = "w3-center w3-border"
   const col_div = document.createElement("div");
   col_div.className = "w3-col";
   col_div.style.width = "64px"
   col_div.append(produce_unit_div)


   for(const unit_type of city.production_unit_types){
        document.getElementById("production_menu").att
   }
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

//document.getElementById("warrior").addEventListener("click", ()=>{request_production("UNITS")});