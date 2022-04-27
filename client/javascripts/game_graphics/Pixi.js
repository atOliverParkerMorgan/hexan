import {Node} from "./Node.js";
import {all_nodes} from "./Node.js";
import {ClientSocket} from "../ClientSocket.js"

if (!localStorage || !'player_token' in localStorage || !'game_token' in localStorage) {
    console.error("Error: no tokens were found")
}
const player_token = localStorage.player_token;
const game_token = localStorage.game_token;

console.log("Player: " + player_token);
console.log("Game: " + game_token);

export const HEX_SIDE_SIZE = 50;
export const DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
export const WORLD_WIDTH = DISTANCE_BETWEEN_HEX * 50;
export const WORLD_HEIGHT = HEX_SIDE_SIZE * 1.5 * 50;


export const app = new PIXI.Application({resizeTo: window, transparent: true,  autoresize: true })
export const Graphics = PIXI.Graphics;

document.body.appendChild(app.view);

export const viewport = app.stage.addChild(new pixi_viewport.Viewport())

viewport
    .moveCenter(0, 0)
    .drag()
    .pinch()
    .decelerate()
    .clamp({ top: - WORLD_HEIGHT / 2 - HEX_SIDE_SIZE, left: - WORLD_WIDTH / 2- HEX_SIDE_SIZE, right: WORLD_WIDTH / 2, bottom: WORLD_HEIGHT / 2 - HEX_SIDE_SIZE/2})


app.stage.addChild(viewport)


document.body.appendChild(app.view)
app.ticker.add(delta=>loop(delta));

const client_socket = new ClientSocket(player_token, game_token);

client_socket.send_data("blah")
client_socket.get_data((...args)=>{
    // adding nodes from linear array to 2d array
    let y = 0;
    let row = [];
    for (let node of args[0][0]) {

        if(node.y!==y){
            all_nodes.push(row)
            row = [];
            y = node.y;
        }
        row.push(new Node(node.x, node.y, node.type, node.borders));
    }
    all_nodes.push(row);

    console.log(all_nodes);

});



function loop(){

}