import {Node} from "./Node.js";
import {all_nodes} from "./Node.js";
import {ClientSocket} from "../ClientSocket.js"
import {Unit} from "./Unit/Unit.js";

export let HEX_SIDE_SIZE;
export let DISTANCE_BETWEEN_HEX;
export let WORLD_WIDTH;
export let WORLD_HEIGHT;
export let viewport;

export const app = new PIXI.Application({resizeTo: window, transparent: true,  autoresize: true })
export const Graphics = PIXI.Graphics;

if (!localStorage || !'player_token' in localStorage || !'game_token' in localStorage) {
    console.error("Error: no tokens were found")
}
const player_token = localStorage.player_token;
const game_token = localStorage.game_token;

console.log("Player: " + player_token);
console.log("Game: " + game_token);

function init_canvas(map, city_cords){

    HEX_SIDE_SIZE = map.length ** .5;

    DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
    WORLD_WIDTH = DISTANCE_BETWEEN_HEX * HEX_SIDE_SIZE;
    WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * HEX_SIDE_SIZE;

    document.body.appendChild(app.view);

    let row_bias = city_cords[1] % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;

    const city_x = (city_cords[0] * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    const city_y = (city_cords[1] * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;

    viewport = app.stage.addChild(new pixi_viewport.Viewport());

    viewport
        .drag()
        .pinch()
        .decelerate()
        .moveCenter(0, 0)
        .snap(city_x, city_y, {removeOnComplete: true})
        .clamp({ top: - WORLD_HEIGHT / 2 - HEX_SIDE_SIZE, left: - WORLD_WIDTH / 2 - HEX_SIDE_SIZE,
                         right: WORLD_WIDTH / 2 + DISTANCE_BETWEEN_HEX - HEX_SIDE_SIZE,
                         bottom: WORLD_HEIGHT / 2 - HEX_SIDE_SIZE / 2 + HEX_SIDE_SIZE / 2})

    app.stage.addChild(viewport);
    document.body.appendChild(app.view);
    app.ticker.add(delta=>loop(delta));
}
const process_data = (...args)=>{
    const response_data = args[0][0];

    const city_cords = response_data.city_cords;
    const map = response_data.map;
    console.log(city_cords);
    console.log(map);

    init_canvas(map, city_cords);

    // adding nodes from linear array to 2d array
    let y = 0;
    let row = [];
    for (let node of map) {

        if(node.y!==y){
            all_nodes.push(row)
            row = [];
            y = node.y;
        }
        // init node => add nodes to PIXI stage
        row.push(new Node(node.x, node.y, node.type, node.borders, node.is_hidden, node.city));
    }
    all_nodes.push(row);

    // add units
    //let unit = new Unit(0, 0, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png");
    all_nodes[2][2].unit = new Unit(2, 2, HEX_SIDE_SIZE, HEX_SIDE_SIZE * 1.5, "../../images/helmet.png");
};

ClientSocket.add_data_listener(process_data, player_token)
ClientSocket.send_data("blah")
ClientSocket.get_data("map", game_token, player_token)

function loop(){

}