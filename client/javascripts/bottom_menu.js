import {ClientSocket} from "./ClientSocket.js";

export function show_bottom_menu(city){
    show_city_data(city);
    document.getElementById("bottom_menu").style.visibility = "visible";
}
export function hide_bottom_menu(){
    document.getElementById("bottom_menu").style.visibility = "hidden";
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
       unit_img.src = "/images/helmet.png"
       unit_img.style.width = "50px";
       unit_img.onclick = function () {
           console.log("click")
           request_production("UNIT")
       };

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

