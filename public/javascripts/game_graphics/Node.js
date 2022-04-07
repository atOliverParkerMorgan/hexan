import {Graphics, viewport, HEX_SIDE_SIZE, DISTANCE_BETWEEN_HEX, WORLD_WIDTH, WORLD_HEIGHT} from "./Pixi.js";

// types of nodes displayed as colors
const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xE5E5E5;


let last_selected_node_cords = [-1, -1];
export let all_nodes = [];

export class Node{
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.opacity = 1;

        this.add_node_to_stage()
    }
    add_node_to_stage(){
        this.hex = new Graphics();

        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;

        this.hex.beginFill(this.type, this.opacity)
            .drawRegularPolygon((this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2, (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2, HEX_SIDE_SIZE, 6)
            .endFill();
        this.hex.interactive = true;

        this.hex.on('pointerdown', (event) => { this.on_click() });
        this.hex.on('mouseover', (event) => { this.set_select() });

        viewport.addChild(this.hex);
    }


    on_click(){
        this.set_type(GRASS);
    }
    set_type(type){
        this.type = type;
        this.update();
    }
    set_select(){

        if(last_selected_node_cords[0] !== this.x || last_selected_node_cords[1] !== this.y) {
            if (last_selected_node_cords[0] !== -1) {
                let last_node = all_nodes[last_selected_node_cords[1]][last_selected_node_cords[0]];
                last_node.opacity = 1;
                last_node.update();
            }

            last_selected_node_cords = [this.x, this.y];
            this.opacity = .5;
            this.update();
        }
    }

    update(){
        this.hex.clear();
        this.add_node_to_stage();
    }
}