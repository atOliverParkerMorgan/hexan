import {DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, viewport, WORLD_HEIGHT, WORLD_WIDTH} from "../Pixi.js"
import {all_nodes} from "../Node.js";

export class Unit {
    constructor(x, y, id, width, height, texture_path) {
        //this.player = player;
        this.width = 10;
        this.height = 12;

        this.x = x;
        this.y = y;

        this.id = id;

        this.health = 100;
        this.type = 100;

        this.texture_path = texture_path;

        this.add_unit_to_stage();
    }


    add_unit_to_stage(){
        if(this.sprite != null){
            viewport.removeChild(this.sprite);
        }

        this.sprite = new PIXI.Sprite.from(this.texture_path);

        this.set_sprite_position();
        this.set_sprite_size();

        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        viewport.addChild(this.sprite);
    }

    set_sprite_position(){
        this.sprite.x = this.get_x_in_pixels();
        this.sprite.y = this.get_y_in_pixels();
    }

    set_sprite_size(){
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    }

    get_x_in_pixels(){
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2 - this.width/2;
    }

    get_y_in_pixels(){
        return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2 - this.height/2;
    }

    move_to(x, y){
        const old_node = all_nodes[this.y][this.x];
        old_node.units.splice(old_node.units.indexOf(this));

        const new_node = all_nodes[y][x];
        new_node.units.push(this);

        this.x = x;
        this.y = y;

        // redraw sprite
        new_node.remove_selected();
        this.add_unit_to_stage();

    }
}