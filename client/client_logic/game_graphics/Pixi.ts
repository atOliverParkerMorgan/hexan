import {Node} from "./Node.js";
import {ClientSocket} from "../ClientSocket.js"
import Unit from "./Unit/Unit.js";
import {Melee} from "./Unit/Melee.js";
import {Range} from "./Unit/Range.js";
import {show_city_bottom_menu} from "../UI_logic.js";

export let HEX_SIDE_SIZE: number;
export let DISTANCE_BETWEEN_HEX: number;
export let WORLD_WIDTH: number;
export let WORLD_HEIGHT: number;
export let viewport: any;

// @ts-ignore
export const app: any = new PIXI.Application({resizeTo: window, transparent: true,  autoresize: true })
// @ts-ignore
export const Graphics = PIXI.Graphics;


export let all_units: Unit[] = [];

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

function init_canvas(map: any, cities: any){

    HEX_SIDE_SIZE = map.length ** .5;

    DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
    WORLD_WIDTH = DISTANCE_BETWEEN_HEX * HEX_SIDE_SIZE;
    WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * HEX_SIDE_SIZE;

    document.body.appendChild(app.view);


    let starting_city = cities[0];

    let row_bias = starting_city.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;

    const city_x = (starting_city.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    const city_y = (starting_city.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;

    // @ts-ignore
    viewport = app.stage.addChild(new pixi_viewport.Viewport());

    viewport.drag()
    .pinch()
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

const process_data = (...args: any[])=>{
    const response_type = args[0][0].response_type;
    const response_data = args[0][0].data;

    switch (response_type) {
        case ClientSocket.response_types.UNITS_RESPONSE:

            all_units = [];
            for(let unit of response_data.units){
                unit = <UnitData>unit;

                let graphics_unit: Unit | undefined;

                // get the correct sprite for unit depending on it's type
                if(unit.type === Unit.MELEE){
                    graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75);
                }
                else if(unit.type === Unit.RANGE){
                    graphics_unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75);
                }

                if(graphics_unit == null){
                    return;
                }

                all_units.push(graphics_unit);
                Node.all_nodes[unit.y][unit.x].units = [graphics_unit];
            }
            break;

        case ClientSocket.response_types.ALL_RESPONSE:
            const map = response_data.map;
            const cities = response_data.cities;

            init_canvas(map, cities);

            // adding nodes from linear array to 2d array
            let y = 0;
            let row = [];
            for (let node of map) {

                if (node.y !== y) {
                    Node.all_nodes.push(row)
                    row = [];
                    y = node.y;
                }
                // init node => add nodes to PIXI stage
                row.push(new Node(node.x, node.y, node.id, node.type, node.borders, node.city));
            }
            Node.all_nodes.push(row);
            break;

        case ClientSocket.response_types.MENU_INFO_RESPONSE:
            show_city_bottom_menu(response_data.city);
            break;

        // deal with sever UNIT_MOVED response
        case ClientSocket.response_types.UNIT_MOVED_RESPONSE:
            let found = false;

            if(all_units == null){
                return;
            }
            // find the unit in question
            for (const unit of all_units) {
                if(unit?.id === response_data.unit.id){
                    found = true;
                    unit?.move_to(response_data.unit.x, response_data.unit.y);
                }
            }
            // update nodes
            response_data.nodes.map( (node: any) => {
                Node.all_nodes[node.y][node.x].set_type(node.type, node.city);
            });

            // if not found something went wrong
            if(!found){
                console.error("Error, something has gone wrong with the sever public communication")
                break;
            }

            break;
    }

    // add units
    //let unit = new Unit(0, 0, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png");
    // all_nodes[2][2].units.push(new Unit(2, 2, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png"));
};

export function init_game() {

    const player_token: string | null = localStorage.getItem("player_token");
    const game_token: string | null = localStorage.getItem("game_token");

    // the typescript hasn't provided a token for the public
    if (player_token == null || game_token == null){
        return;
    }

    ClientSocket.add_data_listener(process_data, player_token)
    ClientSocket.get_data(ClientSocket.request_types.GET_ALL, game_token, player_token)
}

function loop(){

}