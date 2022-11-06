import {Node} from "./Node.js";
import {ClientSocket} from "../ClientSocket.js"
import {setup_tech_tree_button} from "../UI_logic.js";
import {Technology} from "./Technology/Technology.js";

export let HEX_SIDE_SIZE: number;
export let DISTANCE_BETWEEN_HEX: number;
export let WORLD_WIDTH: number;
export let WORLD_HEIGHT: number;
export let viewport: any;

export let tech_tree_root: Technology;

export function setup_tech_tree_node(node: any): Technology{
     let children_node: Technology[] | null = []
     if(node.children != null) {
        for (const child of node.children) {
            children_node.push(setup_tech_tree_node(child))
        }
     }else {
         children_node = null;
     }

     return new Technology(children_node, node.name, node.image, node.description, node.cost, node.is_owned)
}

export function setup_tech_tree(tech_tree: any){
    tech_tree_root = setup_tech_tree_node(tech_tree);
    Technology.init_graph_arrays();
}

// @ts-ignore
export const app: any = new PIXI.Application({resizeTo: window, transparent: true,  autoresize: true })
// @ts-ignore
export const Graphics = PIXI.Graphics;

// @TODO public a_star doesn't always match sever a_star
// get the shortest path between two nodes
export function a_star(start_node: Node, goal_node: Node){
    let open_set = [start_node];
    let closed_set = []

    while (open_set.length > 0){
        let current_node = open_set[0];
        let current_index = 0;

        for(let i = 0; i < open_set.length; i++){
            if(open_set[i].get_heuristic_value(start_node, goal_node) < current_node.get_heuristic_value(start_node, goal_node)){
                current_node = open_set[i];
                current_index = i;
            }
        }

        open_set.splice(current_index, 1);
        closed_set.push(current_node);

        if(current_node.x === goal_node.x && current_node.y === goal_node.y){
            let solution_path: Node[] = [current_node];
            while (solution_path[solution_path.length - 1] !== start_node){
                solution_path.push(<Node> solution_path[solution_path.length - 1].parent);
            }
            return solution_path.reverse();
        }

        for(const node of current_node.get_neighbours()) {

            if(node == null){
                continue;
            }

            if (closed_set.includes(node)) {
                continue;
            }

            let distance_from_start = node.get_distance_to_node(start_node);
            let current_score = distance_from_start + current_node.get_distance_to_node(node);
            let is_better = false;

            if (!open_set.includes(node)) {
                open_set.push(node);
                is_better = true;
            }
            else if (current_score < distance_from_start) {
                is_better = true;
            }
            if (is_better){
                node.parent = current_node;
            }
        }
    }
    return null;
}

export function init_canvas(map: any, cities: any){
    setup_tech_tree_button();

    if(viewport != null){
        Node.all_nodes = [];
        return;
    }

    HEX_SIDE_SIZE = map.length ** .5;

    DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
    WORLD_WIDTH = DISTANCE_BETWEEN_HEX * HEX_SIDE_SIZE;
    WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * HEX_SIDE_SIZE;

    document.body.appendChild(app.view);


    let starting_city = cities[0];

    let row_bias = starting_city.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;

    const city_x = (starting_city.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    const city_y = (starting_city.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;

    //TODO remove after testing
    // save friendly and enemy city cords for testing
    const my_div_city = document.querySelector("#my_city_cords");
    const player_token = localStorage.getItem("player_token");
    const game_token = localStorage.getItem("game_token")

    if(my_div_city != null && player_token != null && game_token != null) {
        my_div_city.textContent = city_x+" "+city_y;
       // ClientSocket.get_data("enemy_city", game_token, player_token)
    }
    // @ts-ignore
    viewport = app.stage.addChild(new pixi_viewport.Viewport());

    viewport
    .drag()
    .decelerate()
    .moveCenter(0, 0)
    .snap(city_x, city_y, {removeOnComplete: true})
    .wheel()
    .clampZoom({minWidth: 4 * HEX_SIDE_SIZE, minHeight: 4 * HEX_SIDE_SIZE, maxWidth: WORLD_WIDTH, maxHeight: WORLD_HEIGHT})
    .clamp({ top: - WORLD_HEIGHT / 2 - HEX_SIDE_SIZE, left: - WORLD_WIDTH / 2 - HEX_SIDE_SIZE,
                         right: WORLD_WIDTH / 2 + DISTANCE_BETWEEN_HEX - HEX_SIDE_SIZE,
                         bottom: WORLD_HEIGHT / 2 - HEX_SIDE_SIZE / 2 + HEX_SIDE_SIZE / 2});

    document.body.appendChild(app.view);

    // @ts-ignore
    app.ticker.add(delta=> loop(delta));
}

export function init_game() {

    const player_token: string | null = localStorage.getItem("player_token");
    const game_token: string | null = localStorage.getItem("game_token");

    // the typescript hasn't provided a token for the public
    if (player_token == null || game_token == null){
        return;
    }

    ClientSocket.connect();
    ClientSocket.add_data_listener(player_token)
    ClientSocket.get_data(ClientSocket.request_types.GET_ALL, game_token, player_token)
}

function loop(){

}