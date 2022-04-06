const app = new PIXI.Application({ transparent: true })
const Graphics = PIXI.Graphics;

app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';
document.body.appendChild(app.view)

const HEX_SIDE_SIZE = 50;
function create_hex(x, y, color) {
    const hex = new Graphics();

    let distance_between_hex = 2* (HEX_SIDE_SIZE ** 2 - (HEX_SIDE_SIZE/2) **2 ) ** .5;

    let row_bias = y % 2 === 0 ? distance_between_hex/2 : 0;

    hex.beginFill(color, 1)
        .drawRegularPolygon((x * distance_between_hex+row_bias) + HEX_SIDE_SIZE, (y * 1.5 * HEX_SIDE_SIZE)+HEX_SIDE_SIZE, HEX_SIDE_SIZE, 6)
        .endFill();

    app.stage.addChild(hex);
}
app.ticker.add(delta=>loop(delta));

socket = io("ws://127.0.0.1:8082",  { transports : ['websocket'] });
socket.emit("client", "test");
socket.on("server", (...args) => {
    console.log(args);

    for (let node of args[0]) {

        console.log(node);
        if(node.y%2===0) create_hex(node.x, node.y, 0xFFFF00);
        else create_hex(node.x, node.y, 0x7FFF55);
    }
});

function loop(){

}