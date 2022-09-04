import {ClientSocket} from "./ClientSocket.js";
import Unit from "./game_graphics/Unit/Unit.js";
import {Node} from "./game_graphics/Node.js";
import {viewport} from "./game_graphics/Pixi.js";

let is_city_menu_visible = false;
let is_mouse_on_city_menu = false;
let are_listeners_added = false;

let mouse_x: number | undefined;
let mouse_y: number | undefined;

// overwrite scroll
document.addEventListener("wheel", () => {
    if(is_city_menu_visible && is_mouse_on_city_menu) {
        //viewport.plugins.pause('wheel');
        if(mouse_x != null && mouse_y != null) {
            //TODO fix scrolling canvas
            //viewport.snap(mouse_x, mouse_y, {removeOnComplete: true});
        }
    }else{
        //viewport.plugins.resume('wheel');
    }
}, { passive: false });


// hot keys
document.addEventListener("keydown", (event)=>{
    if(event.key === "Escape"){
        hide_city_menu();
        hide_unit_info();
    }
})

export function show_node_info(node: Node){
    if(node.type === Node.HIDDEN) return

    update_node_action_button(node);

    (<HTMLInputElement >document.getElementById("node_info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("node_info_title")).innerText = node.get_type_string();


    const div_unit_info_menu: any = (<HTMLInputElement >document.getElementById("node_info_menu"));
    div_unit_info_menu.querySelector("#hide_node_info_button").onclick = hide_node_info;
    // div_unit_info_menu.querySelector("#action_button").onclick = () => unit_action(unit);
}

function update_node_action_button(node: Node){
    switch(node.type) {
        case Node.GRASS:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/grass_plane.png";
            break;
        case Node.MOUNTAIN:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/mountains.png";
            break;
        case Node.BEACH:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/beach.png";
            break;
    }
}

export function hide_node_info(){
    (<HTMLInputElement >document.getElementById("node_info_menu")).style.visibility = "hidden";
}

export function show_unit_info(unit: Unit){
    update_unit_action_button(unit);

    (<HTMLInputElement >document.getElementById("unit_info_image")).src =  unit.texture_path;
    (<HTMLInputElement >document.getElementById("unit_info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("unit_info_title")).innerText = unit.type;
    (<HTMLInputElement >document.getElementById("unit_info_attack_data")).innerText = unit.attack.toString();
    (<HTMLInputElement >document.getElementById("unit_info_health_data")).innerText = unit.health.toString();
    (<HTMLInputElement >document.getElementById("unit_info_range_data")).innerText = unit.range.toString();
    (<HTMLInputElement >document.getElementById("unit_info_movement_data")).innerText = unit.movement.toString();

    const div_unit_info_menu: any = (<HTMLInputElement >document.getElementById("unit_info_menu"));
    div_unit_info_menu.querySelector("#hide_unit_info_button").onclick = hide_unit_info;
    div_unit_info_menu.querySelector("#action_button").onclick = () => unit_action(unit);
}

function update_unit_action_button(unit: Unit){
    (<HTMLInputElement>document.getElementById("action_button_text")).innerText = unit.action;
    switch(unit.action){
        case Unit.FORTIFY:
            (<HTMLInputElement>document.getElementById("action_image")).src = "/images/shield.png";
            break;
        case Unit.SETTLE:
            (<HTMLInputElement>document.getElementById("action_image")).src = "/images/settler.png";
            break;
        case Unit.BUILD:
            break;
    }
}

// send a request for an unit action to the server
function unit_action(unit: Unit){
    ClientSocket.send_data({
        request_type: ClientSocket.request_types.SETTLE,
        data: {
            x: unit.x,
            y: unit.y,
            id: unit.id,
            player_token: localStorage.player_token,
            game_token: localStorage.game_token,
        }
    })
}

export function hide_unit_info(){
    (<HTMLInputElement >document.getElementById("unit_info_menu")).style.visibility = "hidden";
}

export function show_city_menu(city: any){
    if(!are_listeners_added) {
        (<HTMLInputElement>document.getElementById("city_side_menu")).addEventListener("mouseover", () => {
            is_mouse_on_city_menu = true
        }, false);


        (<HTMLInputElement>document.getElementById("city_side_menu")).addEventListener("mouseleave", () => {
            is_mouse_on_city_menu = false
        }, false);
        are_listeners_added = true;
    }

    mouse_x = city.cords_in_pixels_x;
    mouse_y = city.cords_in_pixels_y;


    is_city_menu_visible = true;
    show_city_data(city);
    (<HTMLInputElement> document.getElementById("city_side_menu")).style.visibility = "visible";
}
export function hide_city_menu(){
    is_city_menu_visible = false;
    // move info menu
    (<HTMLInputElement >document.getElementById("unit_info_menu")).style.right = "0";
    (<HTMLInputElement> document.getElementById("city_side_menu")).style.visibility = "hidden";
}


function show_city_data(city: any){
    // move info menu
   (<HTMLInputElement >document.getElementById("unit_info_menu")).style.right = "420px";
   (<HTMLInputElement >document.getElementById("city_name")).innerText = city.name;
   (<HTMLInputElement >document.getElementById("city_stars_per_min")).innerText = city.stars_per_a_minute;
   // (<HTMLInputElement >document.getElementById("city_population")).innerText = city.population;

   // show units that can be produced
   // create html menu with javascript
   const div_side_menu: any = (<HTMLInputElement >document.getElementById("city_side_menu"));
   div_side_menu.removeChild((<HTMLInputElement >document.getElementById("unit_menu")));

   div_side_menu.querySelector("#hide_city_menu_button").onclick = hide_city_menu;


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
                unit_item = set_unit_data(unit_item, "Settler", "/images/settler.png", Unit.SETTLER, 0, 20, 10);
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

export function update_star_info(total_owned_stars: number, star_production?: number){
    (<HTMLInputElement>document.getElementById("total_owned_stars")).innerText = total_owned_stars.toString();

    if(star_production != null) {
        (<HTMLInputElement>document.getElementById("star_production")).innerText = star_production.toString();
    }

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