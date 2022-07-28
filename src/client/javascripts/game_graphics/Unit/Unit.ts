import {DISTANCE_BETWEEN_HEX, Graphics, HEX_SIDE_SIZE, viewport, WORLD_HEIGHT, WORLD_WIDTH} from "../Pixi"
import {Node} from "../Node";
import * as PIXI from "pixi.js"



export class Unit {
    public static readonly MELEE: string = "MELEE";
    public static readonly RANGE: string = "RANGE";
    public static readonly CAVALRY: string = "CAVALRY";

    private static readonly HEALTH_BAR_COLOR: number = 0x7CFC00;
    private static readonly HEALTH_BAR_POSITION_BIAS: number = 50;
    x: number;
    y: number;
    id: number;
    width: number;
    height: number;
    texture_path: string;

    health: number;

    max_health: number;

    type: number;
    health_circle: PIXI.Graphics;
    health_circle_background: PIXI.Graphics;
    background_circle: PIXI.Graphics;
    sprite: PIXI.Sprite;

    is_health_circle_on_viewport: boolean;
    is_health_circle_background_on_viewport: boolean;
    background_circle_on_viewport: boolean;

    constructor(x: number, y: number, id: number, width: number, height: number, texture_path: string) {
        //this.player = player;
        this.width = width;
        this.height = height;

        this.x = x;
        this.y = y;

        this.id = id;

        this.health = 60;
        this.max_health = 100;
        this.type = 100;

        this.texture_path = texture_path;

        this.health_circle = new Graphics();
        this.health_circle_background = new Graphics();
        this.background_circle = new Graphics();
        this.sprite = PIXI.Sprite.from(this.texture_path);

        this.is_health_circle_on_viewport = false;
        this.is_health_circle_background_on_viewport = false;
        this.background_circle_on_viewport = false;

        this.add_unit_to_stage();
    }

    add_unit_to_stage(): void{
        if(this.sprite != null){
            viewport.removeChild(this.sprite);
        }
        this.show_health();
        this.show_background();
        this.set_sprite_position();
        this.set_sprite_size();

        this.sprite.interactive = false;
        this.sprite.buttonMode = false;
        viewport.addChild(this.sprite);
    }

    set_sprite_position(): void{
        this.sprite.x = this.get_x_in_pixels();
        this.sprite.y = this.get_y_in_pixels();
    }

    show_background(): void{
        if(this.background_circle_on_viewport){
            viewport.removeChild(this.background_circle);
        }else {
            this.background_circle_on_viewport = true;
        }
        this.background_circle.beginFill(0xffffff);
        this.background_circle.drawCircle(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2, HEX_SIDE_SIZE/1.8);
        this.background_circle.endFill();

        viewport.addChild(this.background_circle);

    }

    show_health(): void{
        if(this.is_health_circle_on_viewport && this.is_health_circle_background_on_viewport){
            viewport.removeChild(this.health_circle);
            viewport.removeChild(this.health_circle_background);
        }else {
            this.is_health_circle_on_viewport = true;
            this.is_health_circle_background_on_viewport = true;
        }

        this.health_circle.beginFill(Unit.HEALTH_BAR_COLOR);
        this.health_circle.lineStyle(2, 0xffffff)
        this.health_circle.arc(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2,
            HEX_SIDE_SIZE/1.5, 0,2 * Math.PI / (this.max_health / this.     health));
        this.health_circle.endFill();

        this.health_circle_background.beginFill(0xffffff);
        this.health_circle_background.lineStyle(2, 0xffffff)
        this.health_circle_background.arc(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2,
            HEX_SIDE_SIZE/1.5, 0, 2*Math.PI);
        this.health_circle_background.endFill();
        viewport.addChild(this.health_circle_background);
        viewport.addChild(this.health_circle);
    }

    set_sprite_size(): void{
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    }

    get_x_in_pixels(): number{
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2 - this.width/2;
    }

    get_y_in_pixels(): number{
        return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2 - this.height/2;
    }

    move_to(x: number, y: number): void{
        const old_node = Node.all_nodes[this.y][this.x];
        old_node.units.splice(old_node.units.indexOf(this));

        const new_node = Node.all_nodes[y][x];
        new_node.units.push(this);
        this.x = x;
        this.y = y;

        // redraw sprite
        this.add_unit_to_stage();

    }
}

export default Unit;