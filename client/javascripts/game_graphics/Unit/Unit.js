import {DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, viewport, WORLD_HEIGHT, WORLD_WIDTH} from "../Pixi.js"

export class Unit {
    constructor(x, y, width, height, texture_path) {
        //this.player = player;
        this.width = 10;
        this.height = 12;

        this.x = this.get_x_in_pixels(x, y);
        this.y = this.get_y_in_pixels(y);

        this.texture_path = texture_path;

        this.add_unit_to_stage();
    }


    add_unit_to_stage(){
        // if(this.sprite != null)
        console.log("unit add to stage");

        this.sprite = new PIXI.Sprite.from(this.texture_path);

        this.set_sprite_position();
        this.set_sprite_size();

        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        viewport.addChild(this.sprite);
    }

    set_sprite_position(){
        this.sprite.x = this.x;
        this.sprite.y = this.y;
    }

    set_sprite_size(){
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    }

    get_x_in_pixels(x, y){
        let row_bias = y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2 - this.width/2;
    }

    get_y_in_pixels(y){
        return  (y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2 - this.height/2;
    }

    set x_cord(x){
        this.x = x;
    }


    set y_cord(y){
        this.y = y;
    }
}