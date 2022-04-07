import {Node} from "./Node.js";
import {all_nodes} from "./Node.js";

const WORLD_WIDTH = 2000
const WORLD_HEIGHT = 2000
const STAR_SIZE = 30
const BORDER = 10

export const app = new PIXI.Application({ transparent: true })
export const Graphics = PIXI.Graphics;
let viewport = new pixi_viewport.Viewport({
    worldWidth: WORLD_WIDTH,                        // world width used by viewport (automatically calculated based on container width)
    worldHeight: WORLD_HEIGHT,                      // world height used by viewport (automatically calculated based on container height)
    passiveWheel: false,                            // whether the 'wheel' event is set to passive (note: if false, e.preventDefault() will be called when wheel is used over the viewport)

});
viewport.fit()
viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2)

document.body.appendChild(app.view)
app.ticker.add(delta=>loop(delta));

let socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });
socket.emit("client", "test");
socket.on("server", (...args) => {
    console.log(args);

    let y = 0;
    let row = [];
    for (let node of args[0]) {

        if(node.y!==y){
            all_nodes.push(row)
            row = [];
            y = node.y;
        }
        console.log(node);

        row.push(new Node(node.x, node.y, node.type));
    }
});


function loop(){

}