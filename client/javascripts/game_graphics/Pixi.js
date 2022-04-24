import {Node} from "./Node.js";
import {all_nodes} from "./Node.js";
import {ClientSocket} from "/Users/Oliver/WebstormProjects/metalhead/server/ClientSocket.js"

const client_socket = new ClientSocket();

export const HEX_SIDE_SIZE = 50;
export const DISTANCE_BETWEEN_HEX = 2 * (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) ** 2) ** .5;
console.log(DISTANCE_BETWEEN_HEX);
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

let socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });
client_socket.send_data("test", "test")
socket.on("server", (...args) => {
    console.log(args);

    // adding nodes from linear array to 2d array
    let y = 0;
    let row = [];
    for (let node of args[0]) {

        if(node.y!==y){
            all_nodes.push(row)
            row = [];
            y = node.y;
        }
        console.log(node.borders);
        row.push(new Node(node.x, node.y, node.type, node.borders));
    }
    all_nodes.push(row);

    console.log(all_nodes);


});


function loop(){

}