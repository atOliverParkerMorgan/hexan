const app = new PIXI.Application({ transparent: true })
const Graphics = PIXI.Graphics;

app.renderer.resize(window.innerWidth, window.innerHeight);
app.renderer.view.style.position = 'absolute';
document.body.appendChild(app.view)

const hex =  new Graphics();
hex.beginFill("red",1)
    .drawRegularPolygon(100,100,100,6)
    .endFill();

app.stage.addChild(hex);



app.ticker.add(delta=>loop(delta));

function loop(){

}