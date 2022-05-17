import {ClientSocket} from "./ClientSocket.js";

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
   // document.getElementById("city_name").innerText = city.name;
   // document.getElementById("food_per_a_minute").innerText = city.food_per_a_minute;
  //  document.getElementById("production_per_a_minute").innerText = city.production_per_a_minute;
}

function request_production(unit_type, time){

    ClientSocket.send_data({
        request_type: ClientSocket.request_types.PRODUCE_UNIT,
        data: {
            unit_type: unit_type,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
            city_name: document.getElementById("city_name").textContent
        }
    })
    setTimeout(()=>{
       // ClientSocket.get_data(ClientSocket.request_types.GET_UNITS, localStorage.game_token, localStorage.player_token);
    }, time);
}


document.getElementById("warrior").addEventListener("click", ()=>{request_production("UNITS", 5000)});