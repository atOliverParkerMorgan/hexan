import {ClientSocket} from "./ClientSocket.js";
import Unit from "./game_graphics/Unit/Unit.js";
import {Node} from "./game_graphics/Node.js";
import {Player} from "./game_graphics/Player.js";
import {tech_tree_root} from "./game_graphics/Pixi.js";
import {Technology} from "./game_graphics/Technology/Technology";

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

    update_node_action_button_and_information(node);

    (<HTMLInputElement >document.getElementById("node_info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("node_info_title")).innerText = node.get_type_string();

    const div_unit_info_menu: any = (<HTMLInputElement >document.getElementById("node_info_menu"));
    div_unit_info_menu.querySelector("#hide_node_info_button").onclick = hide_node_info;
    div_unit_info_menu.querySelector("#harvest_button").onclick = () => ClientSocket.request_harvest(node.x, node.y);
}

function update_node_action_button_and_information(node: Node){
    (<HTMLInputElement>document.getElementById("harvest_cost")).innerText = node.harvest_cost.toString();
    (<HTMLInputElement>document.getElementById("gain_stars")).innerText = node.production_stars.toString();
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
    ClientSocket.request_unit_action(unit);
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

   if(Player.production_unit_types.length === 0){
       div_side_menu.querySelector("#unit_title").visibility = "hidden";
   }
   // unit item
   for(const unit_type of Player.production_unit_types){
       let unit_item  = document.createElement("li");
       unit_item.className = "w3-bar";
       unit_item.innerHTML = loadFile("/views/unit_item.html")

       switch (unit_type) {

           case Unit.MELEE:
                unit_item = set_unit_data(unit_item, "Warrior", "/images/warrior.png", Unit.MELEE, 40, 100, 10, 4);
                break;
           case Unit.RANGE:
                unit_item = set_unit_data(unit_item, "Slinger", "/images/slinger.png", Unit.RANGE, 20, 80, 10, 6);
                break;
            case Unit.SETTLER:
                unit_item = set_unit_data(unit_item, "Settler", "/images/settler.png", Unit.SETTLER, 0, 20, 10, 20);
                break;
       }

       ul_unit_menu.appendChild(unit_item);
       div_side_menu.appendChild(ul_unit_menu)
   }
}

function set_unit_data(unit_type: any, unit_name: string, src: string, type: string, damage: number, health: number, movement: number, cost: number){
    unit_type.querySelector("#image").src = src
    unit_type.querySelector("#produce").src = "/images/production.png"
    unit_type.querySelector("#produce").onclick = function () {
        ClientSocket.request_production(unit_name);
    };
    unit_type.querySelector("#name").innerText = unit_name;
    unit_type.querySelector("#type").innerText = type;
    unit_type.querySelector("#cost").innerText = cost;
    unit_type.querySelector("#damage").innerText = damage;
    unit_type.querySelector("#health").innerText = health;
    unit_type.querySelector("#movement").innerText = movement;

    return unit_type;
}

// updates the total stars on screen
export function update_star_info(total_owned_stars: number, star_production?: number){
    (<HTMLInputElement>document.getElementById("star_info")).style.visibility = "visible";

    (<HTMLInputElement>document.getElementById("total_owned_stars")).innerText = total_owned_stars.toString();
    if(star_production != null) {
        (<HTMLInputElement>document.getElementById("star_production")).innerText = star_production.toString();
    }
}

export function update_progress_bar(total_owned_stars: number){

    let number_of_bars = (Number(total_owned_stars.toFixed(1)) - Math.floor(total_owned_stars));
    let bars = "";
    for (let i = 0; i < Math.round(number_of_bars * 10) ; i++) {
        bars += "=";
    }
    (<HTMLInputElement>document.getElementById("star_loading_bar")).innerText = bars;
}

export function create_tech_tree(){
    //add canvas element

    const TECH_TREE_CANVAS_WIDTH: number = document.body.clientWidth - 256;
    const TECH_TREE_CANVAS_HEIGHT: number = document.body.clientHeight - 512;
    const SPACE_BETWEEN_NODES_X = 50;
    const SPACE_BETWEEN_NODES_Y = 40;

    let pan_x = 0;
    let pan_y = 0;
    let mouse_x = 0;
    let mouse_y = 0;
    let old_mouse_x = 0;
    let old_mouse_y = 0;
    let mouse_held = false;

    const tech_tree_canvas = document.createElement("canvas");
    tech_tree_canvas.id = "tech_tree";

    tech_tree_canvas.width =  TECH_TREE_CANVAS_WIDTH;
    tech_tree_canvas.height = TECH_TREE_CANVAS_HEIGHT;
    tech_tree_canvas.style.border = "solid 1px black";
    tech_tree_canvas.style.borderRadius = "border-radius: 10px";
    tech_tree_canvas.onmousedown = (event: any)=>{
        mouse_held = true;
        console.log("onmousedown")
    }

    tech_tree_canvas.onmousemove = (event: any)=>{
        mouse_x = event.clientX;
        mouse_y = event.clientY;
        console.log("onmousemove")

        if (mouse_held) {
            pan_x += old_mouse_x - mouse_x;
            pan_y += old_mouse_y - mouse_y;
        }

        old_mouse_x = mouse_x;
        old_mouse_y = mouse_y;

        renderer.start();
    }

    tech_tree_canvas.onmouseup = (event: any)=>{
        mouse_held = false;
        console.log("onmouseup")
    }
    document.getElementById("tech_tree_container")?.appendChild(tech_tree_canvas);
    // make a new graph
    // @ts-ignore
    let graph = new Springy.Graph();

    let nodes = [[tech_tree_root, graph.newNode({
        name: tech_tree_root.name,
        image: tech_tree_root.image,
        description: tech_tree_root.description,
        cost: tech_tree_root.cost,
        is_owned: tech_tree_root.is_owned
    })]]

    while (nodes.length !== 0){
        let node_data: any = nodes.shift()
        node_data[0].children?.forEach((child: Technology)=>{
            if(child != null){
                let graph_node_child = graph.newNode({
                    name: child.name,
                    image: child.image,
                    description: child.description,
                    cost: child.cost,
                    is_owned: child.is_owned
                })

                graph.newEdge(node_data[1], graph_node_child);
                nodes.push([child, graph_node_child]);
            }
        })

    }

    // @ts-ignore
    let layout = new Springy.Layout.ForceDirected(
        graph,
        300.0, // Spring stiffness
        800.0, // Node repulsion
        0.5 // Damping
    );

    let canvas: any = document.getElementById('tech_tree');
    let ctx = canvas?.getContext('2d');

    // @ts-ignore
    let renderer = new Springy.Renderer(layout,
        function clear() {
            ctx.clearRect(0, 0, TECH_TREE_CANVAS_WIDTH, TECH_TREE_CANVAS_HEIGHT);
        },
        function drawEdge(edge: any, p1: any, p2:any) {
            ctx.save();
            ctx.translate(TECH_TREE_CANVAS_WIDTH/2, TECH_TREE_CANVAS_HEIGHT/2);

            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 3.0;

            ctx.beginPath();
            ctx.moveTo(p1.x * SPACE_BETWEEN_NODES_X - pan_x, p1.y * SPACE_BETWEEN_NODES_Y - pan_y);
            ctx.lineTo(p2.x * SPACE_BETWEEN_NODES_X - pan_x, p2.y * SPACE_BETWEEN_NODES_Y - pan_y);
            ctx.stroke();

            ctx.restore();
        },
        function drawNode(node: any, p: any) {
            console.log(pan_x, pan_y);
            ctx.save();
            ctx.translate(TECH_TREE_CANVAS_WIDTH/2, TECH_TREE_CANVAS_HEIGHT/2);

            let width = ctx.measureText(node.data.name).width;
            let x = p.x * SPACE_BETWEEN_NODES_X - pan_x;
            let y = p.y * SPACE_BETWEEN_NODES_Y - pan_y;
            ctx.clearRect(x - width / 2.0 - 2, y - 10, width + 4, 20);
            ctx.font = "18px 'IM Fell English', 'Times New Roman', serif";
            ctx.fillText(node.data.description, x - width / 2.0, y + 25)
            ctx.fillStyle = '#000000';
            ctx.font = "28px 'IM Fell English', 'Times New Roman', serif";
            ctx.fillText(node.data.name, x - width / 2.0 , y + 5);
            ctx.restore();
        }
    );

    renderer.start();
}

let is_tech_tree_hidden: boolean = true;
export function setup_tech_tree_button(){
    (<HTMLInputElement>document.getElementById("tech_button")).onclick = ()=>{
        if(is_tech_tree_hidden){
            show_tech_tree();
        }else{
            hide_tech_tree();
        }
        is_tech_tree_hidden = !is_tech_tree_hidden;
    }
}

export function show_tech_tree(){
    document.getElementsByTagName("canvas")[0].style.visibility = "hidden";
    (<HTMLInputElement>document.getElementById("tech_tree_container")).style.padding = "128px"
    create_tech_tree();
}

export function hide_tech_tree(){
    document.getElementsByTagName("canvas")[1].style.visibility = "visible";
    (<HTMLInputElement>document.getElementById("tech_tree_container")).style.padding = "0px"
    document.getElementById("tech_tree_container")?.removeChild(<HTMLInputElement>document.getElementById("tech_tree"))
}


export function show_modal(title: string, message: string, w3_color_classname: string){
    (<HTMLInputElement>document.getElementById("modal")).style.display = "block";
    (<HTMLInputElement>document.getElementById("modal_title")).innerText = title;
    (<HTMLInputElement>document.getElementById("modal_message")).innerText = message;
    (<HTMLInputElement>document.getElementById("modal_header")).classList.add(w3_color_classname);
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