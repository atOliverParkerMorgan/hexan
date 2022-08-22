import {ClientSocket} from "./ClientSocket.js";
import Unit from "./game_graphics/Unit/Unit.js";

export function show_info(unit: Unit){
    (<HTMLInputElement >document.getElementById("info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("info_title")).innerText = unit.type;
    (<HTMLInputElement >document.getElementById("attack_data")).innerText = unit.attack.toString();
    (<HTMLInputElement >document.getElementById("health_data")).innerText = unit.health.toString();
    (<HTMLInputElement >document.getElementById("range_data")).innerText = unit.range.toString();
    (<HTMLInputElement >document.getElementById("movement_data")).innerText = unit.movement + "/min";
}

export  function hide_info(){
    (<HTMLInputElement >document.getElementById("info_menu")).style.visibility = "hidden";
}

export function show_city_bottom_menu(city: any){
    show_city_data(city);
    (<HTMLInputElement >document.getElementById("city_side_menu")).style.visibility = "visible";
}
export function hide_city_bottom_menu(){
    // move info menu
    (<HTMLInputElement >document.getElementById("info_menu")).style.right = "0";

    (<HTMLInputElement >document.getElementById("city_side_menu")).style.visibility = "hidden";
}


function show_city_data(city: any){
    // move info menu
    (<HTMLInputElement >document.getElementById("info_menu")).style.right = "420px";

   (<HTMLInputElement >document.getElementById("city_name")).innerText = city.name;
   (<HTMLInputElement >document.getElementById("food")).innerText = city.food_per_a_minute + " / min";
   (<HTMLInputElement >document.getElementById("production")).innerText = city.production_per_a_minute + " / min";
   (<HTMLInputElement >document.getElementById("science")).innerText = city.food_per_a_minute + " / min";
   (<HTMLInputElement >document.getElementById("culture")).innerText = city.production_per_a_minute + " / min";

   // show units that can be produced
   // create html menu with javascript
   const div_side_menu: any = (<HTMLInputElement >document.getElementById("city_side_menu"));
   div_side_menu.removeChild((<HTMLInputElement >document.getElementById("unit_menu")));

   div_side_menu.querySelector("#hide_button").onclick = hide_city_bottom_menu;


   const ul_unit_menu = document.createElement("ul");
   ul_unit_menu.id = "unit_menu";
   ul_unit_menu.className = "w3-ul w3-card-4";

   if(city.owner.production_unit_types.lenght === 0){
       div_side_menu.querySelector("#unit_title").visibility = "hidden";
   }
   // unit item
   for(const unit_type of city.owner.production_unit_types){
       let unit_item  = document.createElement("li");
       unit_item.className = "w3-bar";
       unit_item.innerHTML = loadFile("/views/unit_item.html")

       switch (unit_type) {

           case Unit.MELEE:
                unit_item = set_unit_data(unit_item, "Warrior", "/images/warrior.png", Unit.MELEE, 40, 100, 10);
                break;
           case Unit.RANGE:
                unit_item = set_unit_data(unit_item, "Slinger", "/images/slinger.png", Unit.RANGE, 20, 80, 10);
                break;
            case Unit.SETTLER:
                unit_item = set_unit_data(unit_item, "Settler", "images/settler.png", Unit.SETTLER, 0, 20, 10);
                break;
       }

       ul_unit_menu.appendChild(unit_item);
       div_side_menu.appendChild(ul_unit_menu)
   }
}

function set_unit_data(unit_type: any, name: string, src: string, type: string, damage: number, health: number, movement: number){
    unit_type.querySelector("#image").src = src
    unit_type.querySelector("#produce").src = "/images/production.png"
    unit_type.querySelector("#produce").onclick = function () {
        request_production(type);
    };
    unit_type.querySelector("#name").innerText = name;
    unit_type.querySelector("#type").innerText = type;
    unit_type.querySelector("#damage").innerText = damage;
    unit_type.querySelector("#health").innerText = health;
    unit_type.querySelector("#movement").innerText = movement;

    return unit_type;
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

function loadFile(filePath: string):string {
    let result: string | null = null;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.send();
    if (xhr.status===200) {
        result = xhr.responseText;
    }else{
        return ""
    }

    return result;
}