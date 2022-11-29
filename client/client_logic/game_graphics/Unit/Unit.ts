import {DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, Graphics, Sprite, viewport, WORLD_HEIGHT, WORLD_WIDTH} from "../Pixi.js"
import {Node} from "../Node.js";

// TODO implement webpack and migrate towards a framework better than plane html
export class Unit implements UnitData{
    // unit types
    public static readonly CAVALRY: string = "Cavalry"
    public static readonly MELEE: string = "Melee";
    public static readonly RANGE: string = "Range";
    public static readonly SETTLER: string = "Settler";

    // action that designated units can take
    public static readonly FORTIFY: string = "Fortify";
    public static readonly SETTLE: string = "Settle";
    public static readonly BUILD: string = "Build";


    // graphics colors
    private static readonly HEALTH_BAR_COLOR: number = 0x7CFC00;
    private static readonly FRIENDLY_BACKGROUND_COLOR: number = 0xFF7800 ;
    private static readonly ENEMY_BACKGROUND_COLOR: number = 0xF53E3E;
    private static readonly MOVEMENT_COLOR: number = 0xADD8E6;

    private current_path: number[][];
    private background_unit_movement_percentage: number = 0;

    x: number;
    y: number;
    id: string;
    width: number;
    height: number;
    texture_path: string;

    attack: number;
    health: number;
    range: number;
    movement: number;

    max_health: number;

    type: string;
    action: string;
    is_friendly: boolean;

    is_on_water: boolean;

    health_circle: any;
    health_circle_background: any;
    background_circle: any;
    movement_circle: any;
    sprite: any;
    boat_sprite: any;

    constructor(unit: UnitData, width: number, height: number, is_friendly: boolean) {
        //this.player = player;
        this.width = width;
        this.height = height;

        this.x = unit.x;
        this.y = unit.y;

        this.id = unit.id;

        this.type = unit.type;
        this.action = unit.action;
        this.is_friendly = is_friendly;

        this.is_on_water = false;

        this.attack = unit.attack;
        this.health = unit.health;
        this.range = unit.range;
        this.movement = unit.movement;

        this.max_health = 100;

        this.current_path = [];

        // TODO create player class with current MELEE RANGE ... units

        switch (this.type) {
            case Unit.MELEE:
                this.texture_path = "/images/warrior.png";
                break;
            case Unit.RANGE:
                this.texture_path = "/images/slinger.png";
                break;
            case Unit.SETTLER:
                this.texture_path = "/images/settler.png";
                break;
            default:
                this.texture_path = "/images/horseman.png";
        }

        this.health_circle = null;
        this.health_circle_background = null;
        this.background_circle = null;
        // @ts-ignore
        this.sprite = Sprite.from(this.texture_path);
        this.boat_sprite = Sprite.from("/images/boat.png");

        this.update_unit_on_stage();
    }

    remove_children(){
        // remove the unit Graphics when unit moves
        if(this.sprite != null){
            viewport.removeChild(this.sprite);
        }if(this.is_on_water && this.boat_sprite != null){
            viewport.removeChild(this.boat_sprite);
        }
        if(this.background_circle != null){
            viewport.removeChild(this.background_circle);
        }
        if(this.health_circle != null && this.health_circle_background != null){
            viewport.removeChild(this.health_circle);
            viewport.removeChild(this.health_circle_background);
        }
        if(this.movement_circle != null){
            viewport.removeChild(this.movement_circle);
        }
    }

    update_unit_on_stage(): void{
        this.remove_children();
        this.show_movement(this.background_unit_movement_percentage);

        this.show_health();
        this.show_background();
        this.set_sprite_position();
        this.set_sprite_size();

        if(this.is_on_water){
            this.boat_sprite.interactive = false;
            this.boat_sprite.buttonMode = false;
            viewport.addChild(this.boat_sprite);
        }else{
            this.sprite.interactive = false;
            this.sprite.buttonMode = false;
            viewport.addChild(this.sprite);
        }
    }

    set_sprite_position(): void{
        this.sprite.x = this.get_x_in_pixels();
        this.sprite.y = this.get_y_in_pixels();
    }

    show_background(): void{

        this.background_circle = new Graphics();

        if(this.is_friendly) {
            this.background_circle.beginFill(Unit.FRIENDLY_BACKGROUND_COLOR);
        }else{
            this.background_circle.beginFill(Unit.ENEMY_BACKGROUND_COLOR);
        }

        this.background_circle.drawCircle(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2, HEX_SIDE_SIZE/1.8);
        this.background_circle.endFill();
        viewport.addChild(this.background_circle);

    }

    show_health(): void{

        this.health_circle = new Graphics();
        this.health_circle_background = new Graphics();

        this.health_circle_background.beginFill(0xffffff);
        this.health_circle_background.lineStyle(2, 0xffffff)
        this.health_circle_background.arc(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2,
            HEX_SIDE_SIZE/1.38, 0, 2*Math.PI);
        this.health_circle_background.endFill();
        viewport.addChild(this.health_circle_background);

        this.health_circle.beginFill(Unit.HEALTH_BAR_COLOR);
        this.health_circle.lineStyle(2, 0xffffff)
        this.health_circle.arc(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2,
            HEX_SIDE_SIZE/1.38, 0,2 * Math.PI / (this.max_health / this.health));
        this.health_circle.endFill();

        viewport.addChild(this.health_circle);
    }

    show_movement(percentage_of_movement: number): void{
        if(percentage_of_movement === 0) return;

        this.movement_circle = new Graphics;
        this.movement_circle.beginFill(Unit.MOVEMENT_COLOR);
        this.movement_circle.lineStyle(2, Unit.MOVEMENT_COLOR)
        this.movement_circle.arc(this.get_x_in_pixels()+this.width/2, this.get_y_in_pixels()+this.height/2,
            HEX_SIDE_SIZE/1.2, 0,2 * Math.PI / (100 / percentage_of_movement));
        this.movement_circle.endFill();

        viewport.addChild(this.movement_circle);
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
        old_node.unit = null;

        const new_node = Node.all_nodes[y][x];
        new_node.unit = this;
        this.x = x;
        this.y = y;

        // redraw graphics children
        this.update_unit_movement_background();
    }

    set_current_path(current_path: number[][]){
        this.current_path = current_path;
        this.update_unit_movement_background()
    }

    update_movement_background(current_node: Node, depth: number){
        if(depth === 0){
            this.background_unit_movement_percentage = 0;
            return;
        }
        setTimeout(()=>{
            this.background_unit_movement_percentage += 5;
            this.update_unit_on_stage();
            this.update_movement_background(current_node, depth - 1);

        }, current_node.get_movement_time() / 30);
    }

    update_unit_movement_background(){
        this.current_path.shift();
        console.log(this.current_path.length)

        if(this.current_path.length !== 0){
            const current_node: Node = Node.all_nodes[this.current_path[0][1]][this.current_path[0][0]];
            this.update_movement_background(current_node, 30)
        }else{
            this.background_unit_movement_percentage = 0;
            this.update_unit_on_stage()
        }
    }
}

export default Unit;