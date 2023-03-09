import {ClientSocket} from "./ClientSocket.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import {Node} from "./GameGraphics/Node.js";
import {Player} from "./GameGraphics/Player.js";
import {Technology, graph,interaction_nodes_values} from "./GameGraphics/Technology/Technology.js";
import {
    DISTANCE_BETWEEN_HEX,
    HEX_SIDE_SIZE, tech_tree_root,
    viewport,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./GameGraphics/Pixi.js";
import {loadFile} from "./ClientCreateGame.js";
import {Interval} from "./GameGraphics/Interval.js";

export let renderer: any;
export let current_node: Node | undefined;

let current_city: any;
let is_mouse_on_city_menu = false;
let are_listeners_added = false;

// hot keys
document.addEventListener("keydown", (event)=>{
    if(event.key === "Escape"){
        hideCityMenu();
        hideUnitInfo();
        hideNodeInfo();
        hideModal();
    }
})

export function friendTokenNotFound(){
    (<HTMLElement>document.getElementById("error_msg")).innerText = "Friend code doesn't exist";
}

export function showNodeInfo(node: Node){
    if(node.type === Node.HIDDEN) return;

    current_node = node;

    updateNodeActionButtonAndInformation(node);

    (<HTMLInputElement >document.getElementById("node_info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("node_info_title")).innerText = node.getTypeString();

    const div_unit_info_menu: any = (<HTMLInputElement >document.getElementById("node_info_menu"));
    div_unit_info_menu.querySelector("#hide_node_info_button").onclick = hideNodeInfo;
    if(node.canBeHarvested()){
        div_unit_info_menu.querySelector("#harvest_button").style.visibility = "visible";

        if(Player.getTotalNumberOfStars() < node.harvest_cost){
            document.getElementById("harvest_button")?.classList.remove("w3-green");
            document.getElementById("harvest_button")?.classList.add("w3-red");
        }else{
            document.getElementById("harvest_button")?.classList.remove("w3-red");
            document.getElementById("harvest_button")?.classList.add("w3-green");
        }
        div_unit_info_menu.querySelector("#harvest_button").onclick = () => ClientSocket.requestHarvest(node.x, node.y);
    }else{
        div_unit_info_menu.querySelector("#harvest_button").style.visibility = "hidden";
    }
}

function updateNodeActionButtonAndInformation(node: Node){
    // check if player owns mining or construction technology
    let production_stars = node.production_stars.toString();
    if(Technology.ownsTechnology(tech_tree_root, "Mining") && node.type === Node.MOUNTAIN){
        production_stars = "2";
    }else if(Technology.ownsTechnology(tech_tree_root, "Construction") && node.type === Node.FOREST){
        production_stars = "2";
    }

    (<HTMLInputElement>document.getElementById("harvest_cost")).innerText = node.harvest_cost.toString();
    (<HTMLInputElement>document.getElementById("gain_stars")).innerText = production_stars;
    switch(node.type) {
        case Node.FOREST:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/forest.png";
            break;
        case Node.MOUNTAIN:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/mountains.png";
            break;
        case Node.GRASS:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/grass_plane.png";
            break;
        case Node.OCEAN:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/ocean.png";
            break;
        case Node.LAKE:
            (<HTMLInputElement>document.getElementById("node_info_image")).src = "/images/lake.png";
            break;

    }
}

export function hideNodeInfo(){
    (<HTMLInputElement>document.getElementById("harvest_button")).style.visibility = "hidden";
    (<HTMLInputElement>document.getElementById("node_info_menu")).style.visibility = "hidden";
}

export function showUnitInfo(unit: Unit){
    updateUnitActionButton(unit);

    (<HTMLInputElement >document.getElementById("unit_info_image")).src =  unit.texture_path;
    (<HTMLInputElement >document.getElementById("unit_info_menu")).style.visibility = "visible";
    (<HTMLInputElement >document.getElementById("unit_info_title")).innerText = unit.type;
    (<HTMLInputElement >document.getElementById("unit_info_attack_data")).innerText = unit.attack.toString();
    (<HTMLInputElement >document.getElementById("unit_info_health_data")).innerText = unit.health.toString();
    (<HTMLInputElement >document.getElementById("unit_info_range_data")).innerText = unit.range.toString();
    (<HTMLInputElement >document.getElementById("unit_info_movement_data")).innerText = unit.movement.toString();

    const div_unit_info_menu: any = (<HTMLInputElement >document.getElementById("unit_info_menu"));
    div_unit_info_menu.querySelector("#hide_unit_info_button").onclick = hideUnitInfo;
    div_unit_info_menu.querySelector("#action_button").onclick = () => unitAction(unit);

}

function updateUnitActionButton(unit: Unit){
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

// send a request for a unit action to the server
function unitAction(unit: Unit){
    ClientSocket.requestUnitAction(unit);
}

export function hideUnitInfo(){
    (<HTMLInputElement >document.getElementById("unit_info_menu")).style.visibility = "hidden";
}

export function showCityMenu(city: any){
    current_city = city

    if(!are_listeners_added) {
        (<HTMLInputElement>document.getElementById("city_side_menu")).addEventListener("mouseover", () => {
            if(!is_mouse_on_city_menu) {
                is_mouse_on_city_menu = true;

                viewport.plugins.pause('wheel');
                viewport.plugins.pause('drag');
                viewport.plugins.pause('decelerate');

                if(current_city != null) {

                    // get city cords
                    let row_bias = current_city.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
                    const city_x = (current_city.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
                    const city_y = (current_city.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;

                    viewport.snap(city_x, city_y, {removeOnComplete: true});


                }
            }
        }, false);


        (<HTMLInputElement>document.getElementById("city_side_menu")).addEventListener("mouseleave", () => {
            if(is_mouse_on_city_menu) {
                is_mouse_on_city_menu = false;
                viewport.plugins.resume('wheel');
                viewport.plugins.resume('drag');
                viewport.plugins.resume('decelerate');
            }
        }, false);
        are_listeners_added = true;
    }

    showCityData(city);
    (<HTMLInputElement> document.getElementById("city_side_menu")).style.visibility = "visible";
}
export function hideCityMenu(){
    // move info menu
    (<HTMLInputElement> document.getElementById("unit_info_menu")).style.right = "0";
    (<HTMLInputElement> document.getElementById("city_side_menu")).style.visibility = "hidden";
}

export function gameOver(title: string, message: string, w3_color_classname: string){
    clearInterval(Interval.update_stars_interval_id);
    clearInterval(Interval.update_progress_bar_interval_id);

    (<HTMLInputElement>document.getElementById("game_over_modal")).style.display = "block";
    (<HTMLInputElement>document.getElementById("game_over_modal_title")).innerText = title;
    (<HTMLInputElement>document.getElementById("game_over_modal_message")).innerText = message;
    (<HTMLInputElement>document.getElementById("game_over_modal_header")).classList.add(w3_color_classname);

    (<HTMLInputElement>document.getElementById("play_again")).onclick = ()=>{
        window.location.reload();
    }

    (<HTMLInputElement>document.getElementById("view_game")).onclick = ()=>{
        (<HTMLInputElement>document.getElementById("game_over_modal")).style.display = "none";
        (<HTMLInputElement>document.getElementById("star_info")).innerHTML = "<button onclick='window.location.reload();' id=\"play_again\" class=\"w3-button w3-round w3-padding-64 w3-green\">Play Again</button>";
    }

}

function showCityData(city: any){
    // move info menu
   (<HTMLInputElement >document.getElementById("unit_info_menu")).style.right = "420px";
   (<HTMLInputElement >document.getElementById("city_name")).innerText = city.name;
   (<HTMLInputElement >document.getElementById("number_of_harvested_nodes")).innerText = city.number_of_harvested_nodes;
   // (<HTMLInputElement >document.getElementById("city_population")).innerText = city.population;

   // show units that can be produced
   // create html menu with javascript
   const div_side_menu: any = (<HTMLInputElement >document.getElementById("city_side_menu"));
   div_side_menu.removeChild((<HTMLInputElement >document.getElementById("unit_menu")));

   div_side_menu.querySelector("#hide_city_menu_button").onclick = hideCityMenu;


   const ul_unit_menu = document.createElement("ul");
   ul_unit_menu.id = "unit_menu";
   ul_unit_menu.className = "w3-ul w3-card-4";

   if(Player.production_units.length === 0){
       div_side_menu.querySelector("#unit_title").visibility = "hidden";
   }
   // unit item
   for(const unit of Player.production_units){
       let unit_html  = document.createElement("li");
       unit_html.className = "w3-bar";
       loadFile("/views/unit_item.html").then((html_file)=>{
           if (html_file != null) {
               unit_html.innerHTML = html_file;
           }

           unit_html = setUnitData(unit_html, unit.name, "/images/"+unit.name.toLowerCase()+".png", unit.type, unit.attack, unit.health, unit.range, unit.movement, unit.cost);

           ul_unit_menu.appendChild(unit_html);
           div_side_menu.appendChild(ul_unit_menu)
       });

   }
}

function setUnitData(unit_html: any, unit_name: string, src: string, type: string, attack: number, health: number, range: number, movement: number, cost: number){
    unit_html.querySelector("#image").src = src
    unit_html.querySelector("#produce").src = "/images/production.png"
    unit_html.querySelector("#produce").onclick = function () {
        ClientSocket.requestProduction(unit_name);
    };
    unit_html.querySelector("#name").innerText = unit_name;
    unit_html.querySelector("#type").innerText = type;
    unit_html.querySelector("#cost").innerText = cost;
    unit_html.querySelector("#attack").innerText = attack;
    unit_html.querySelector("#range").innerText = range;
    unit_html.querySelector("#health").innerText = health;
    unit_html.querySelector("#movement").innerText = movement;

    return unit_html;
}

// updates the total stars on screen
export function updateStarInfo(total_owned_stars: number, star_production?: number){
    (<HTMLInputElement>document.getElementById("star_info")).style.visibility = "visible";
    if(current_node != null && (Number(total_owned_stars.toFixed(1)) - Math.floor(total_owned_stars)) === 0 && (<HTMLInputElement >document.getElementById("node_info_menu")).style.visibility === "visible") {
        showNodeInfo(current_node);
    }

    (<HTMLInputElement>document.getElementById("total_owned_stars")).innerText = Math.floor(total_owned_stars).toString();
    if(star_production != null) {
        (<HTMLInputElement>document.getElementById("star_production")).innerText = star_production.toString();
    }
}

export function updateProgressBar(total_owned_stars: number){

    let number_of_bars = (Number(total_owned_stars.toFixed(1)) - Math.floor(total_owned_stars));
    let bars = "";
    for (let i = 0; i < Math.round(number_of_bars * 10) ; i++) {
        bars += "=";
    }
    (<HTMLInputElement>document.getElementById("star_loading_bar")).innerText = bars;
}

export function createTechTree(){
    //add canvas element

    const TECH_TREE_CANVAS_WIDTH: number = document.body.clientWidth;
    const TECH_TREE_CANVAS_HEIGHT: number = document.body.clientHeight;
    const SPACE_BETWEEN_NODES_X = 160;
    const SPACE_BETWEEN_NODES_Y = 100;

    // is used for selecting tech tree nodes

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


    tech_tree_canvas.onmousedown = ()=>{
        mouse_held = true;
        interaction_nodes_values.map((node_cords: (string | number | boolean)[])=>{
            // make sure that user is hovering over this node and that it isn't already purchased
            if(node_cords[5] && !node_cords[6]){
                ClientSocket.requestBuyTechnology(<string> node_cords[0])
                mouse_held = false;
                return
            }
        });
    }

    tech_tree_canvas.onmousemove = (event: any)=>{
        mouse_x = event.clientX;
        mouse_y = event.clientY;

        if (mouse_held) {
            pan_x += old_mouse_x - mouse_x;
            pan_y += old_mouse_y - mouse_y;
        }
        const x = mouse_x - TECH_TREE_CANVAS_WIDTH/2;
        const y = mouse_y - TECH_TREE_CANVAS_HEIGHT/2;


        interaction_nodes_values.map((node_cords: (string | number | boolean)[])=>{
            if(node_cords[1] < x && node_cords[2] < y && node_cords[3] > x && node_cords[4] > y){
                node_cords[5] = true;
                return
            }else{
                node_cords[5] = false;
            }
        })

        old_mouse_x = mouse_x;
        old_mouse_y = mouse_y;

        renderer.start();
    }

    tech_tree_canvas.onmouseup = ()=>{
        mouse_held = false;
    }
    document.getElementById("tech_tree_container")?.appendChild(tech_tree_canvas);

    // make a new graph
    Technology.initGraphArrays();

    // @ts-ignore
    let layout = new Springy.Layout.ForceDirected(
        graph,
        300.0, // Spring stiffness
        800.0, // Node repulsion
        0.5 // Damping
    );

    let canvas: any = document.getElementById('tech_tree');
    let ctx = canvas.getContext('2d');
    let background_gradient=ctx.createLinearGradient(0, 0, TECH_TREE_CANVAS_WIDTH, TECH_TREE_CANVAS_HEIGHT);
    background_gradient.addColorStop(0, "#2c5364");
    background_gradient.addColorStop(0.5, "#203a43");
    background_gradient.addColorStop(1, "#0f2027");

    // @ts-ignore
   renderer = new Springy.Renderer(layout,
        function clear() {
            ctx.fillStyle = background_gradient;
            ctx.fillRect(0, 0, TECH_TREE_CANVAS_WIDTH, TECH_TREE_CANVAS_HEIGHT);
        },
        function drawEdge(edge: any, p1: any, p2:any) {
            ctx.save();
            ctx.translate(TECH_TREE_CANVAS_WIDTH/2, TECH_TREE_CANVAS_HEIGHT/2);

            ctx.strokeStyle = 'rgba(255,255,255)';
            ctx.lineWidth = 3.0;

            ctx.beginPath();
            let x1 = p1.x * SPACE_BETWEEN_NODES_X - pan_x;
            let y1 = p1.y * SPACE_BETWEEN_NODES_Y - pan_y;
            let x2 = p2.x * SPACE_BETWEEN_NODES_X - pan_x;
            let y2 = p2.y * SPACE_BETWEEN_NODES_Y - pan_y;

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            ctx.restore();
        },
        function drawNode(node: any, p: any) {
            ctx.save();
            ctx.translate(TECH_TREE_CANVAS_WIDTH/2, TECH_TREE_CANVAS_HEIGHT/2);

            let name_measurement = ctx.measureText(node.data.name);
            let lines = node.data.description.split("\n");

            let longest_line = -1;
            for (const line of lines) {
                if(longest_line < ctx.measureText(line).width){
                    longest_line = ctx.measureText(line).width;
                }
            }

            let x = p.x * SPACE_BETWEEN_NODES_X - pan_x;
            let y = p.y * SPACE_BETWEEN_NODES_Y - pan_y;

            ctx.strokeStyle = '#FFFFFF';
            ctx.beginPath();

            let image = new Image();
            image.src = node.data.image;

            // is used for root node
            if(node.data.name !== "") {
                const rect_x = x - name_measurement.width / 2.0 - longest_line;
                const rect_y = y - 70 - 10 * lines.length;
                const rect_width = (longest_line) * 2;
                const rect_height = 100 + 20 * lines.length;

                interaction_nodes_values.map((node_cords: (string | number | boolean)[])=>{
                    if(node_cords[0] === node.data.name){
                        node_cords[1] = rect_x;
                        node_cords[2] = rect_y;
                        node_cords[3] = rect_x + rect_width;
                        node_cords[4] = rect_y + rect_height;

                        // color nodes depending on if they are owned by the player

                        if(!node_cords[6]) {
                            ctx.fillStyle = "#880808"
                        }
                        // is selected
                        if(node_cords[5]){
                            ctx.fillStyle = "#808080"
                        }

                        if(node_cords[6]) {
                            ctx.fillStyle = "#15783D"
                        }
                        return;
                    }
                })

                try {
                    ctx.roundRect(rect_x, rect_y, rect_width, rect_height, [0, 50, 0, 25]);
                }catch (e) {
                    // for Firefox
                    ctx.rect(rect_x, rect_y, rect_width, rect_height);
                }

                ctx.drawImage(image, x + (longest_line) - 90 , y - 60 - 10 * lines.length , 50 , 50);
            }else{
                const width = 130;
                const height = 210;
                ctx.drawImage(image, x - width / 2, y - height / 2, width, height);

            }
            ctx.fill();
            ctx.stroke();


            ctx.beginPath();
            ctx.font = "18px 'IM Fell English', 'Times New Roman', serif";
            ctx.fillStyle = '#FFFFFF';
            let y_bias = 1;
            for (const line of lines) {
                ctx.fillText(line, x - name_measurement.width / 2.0 + 10 - longest_line, y - 15 + 20 * y_bias);
                y_bias ++;
            }
            ctx.font = "32px 'IM Fell English', 'Times New Roman', serif";
            ctx.fillText(node.data.name, x - name_measurement.width / 2.0 + 10 - longest_line , y - 40 - 10 * lines.length);

            if(node.data.name != "") {
                let star_image = new Image();
                star_image.src = "/images/star.png";
                const star_width = 30;
                ctx.drawImage(star_image, x + (longest_line) - 125 , y -35 - 10 * lines.length - star_width, star_width, star_width);
                ctx.fillText(node.data.cost, x + longest_line - 85, y - 40 - 10 * lines.length)
            }
            ctx.restore();
        }
    );

    renderer.start();
}

let is_tech_tree_hidden: boolean = true;
export function setupTechTreeButton(){
    (<HTMLInputElement>document.getElementById("tech_button")).onclick = ()=>{
        if(is_tech_tree_hidden){
            showTechTree();
        }else{
            hideTechTree();
        }
        is_tech_tree_hidden = !is_tech_tree_hidden;
    }
}

export function showTechTree(){
    hideNodeInfo();
    hideCityMenu();

    document.getElementsByTagName("canvas")[0].style.visibility = "hidden";
    (<HTMLInputElement>document.getElementById("star_info")).style.color = "white"
    createTechTree();
}

export function hideTechTree(){
    document.getElementsByTagName("canvas")[1].style.visibility = "visible";
    (<HTMLInputElement>document.getElementById("star_info")).style.color = "black"
    document.getElementById("tech_tree_container")?.removeChild(<HTMLInputElement>document.getElementById("tech_tree"))
}

export function hideModal(){
    (<HTMLInputElement>document.getElementById('modal')).style.display='none'
}

export function showModal(title: string, message: string, w3_color_classname: string){
    (<HTMLInputElement>document.getElementById("modal")).style.display = "block";
    (<HTMLInputElement>document.getElementById("modal_title")).innerText = title;
    (<HTMLInputElement>document.getElementById("modal_message")).innerText = message;
    (<HTMLInputElement>document.getElementById("modal_header")).classList.add(w3_color_classname);
}