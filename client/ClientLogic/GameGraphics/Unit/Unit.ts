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

    public static readonly MOVEMENT_UPDATE_TIME: number = 30


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
        this.max_health = this.health;


        this.current_path = [];

        switch (this.type) {
            case Unit.MELEE:

                if(this.attack == 5) this.texture_path = "/images/spearman.png";
                else this.texture_path = "/images/warrior.png";
                break;
            case Unit.RANGE:
                if(this.range == 1) this.texture_path = "/images/slinger.png";
                else this.texture_path = "/images/archer.png";
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

        this.sprite = Sprite.from(this.texture_path);
        this.boat_sprite = Sprite.from("/images/boat.png");

        this.updateUnitOnStage();
    }

    removeChildren(){
        // remove the unit Graphics when unit moves
        if(this.sprite != null){
            viewport.removeChild(this.sprite);
        }if(this.boat_sprite != null){
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

    updateUnitOnStage(): void{
        this.removeChildren();
        this.showMovement();

        this.showHealth();
        this.showBackground();
        this.setSpritePosition();
        this.setSpriteSize();
        
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

    setSpritePosition(): void{
        if(this.is_on_water) {
            this.boat_sprite.x = this.getXInPixels();
            this.boat_sprite.y = this.getYInPixels();

        }else{
            this.sprite.x = this.getXInPixels();
            this.sprite.y = this.getYInPixels();
        }
    }

    showBackground(): void{

        this.background_circle = new Graphics();

        if(this.is_friendly) {
            this.background_circle.beginFill(Unit.FRIENDLY_BACKGROUND_COLOR);
        }else{
            this.background_circle.beginFill(Unit.ENEMY_BACKGROUND_COLOR);
        }

        this.background_circle.drawCircle(this.getXInPixels()+this.width/2, this.getYInPixels()+this.height/2, HEX_SIDE_SIZE/1.8);
        this.background_circle.endFill();
        viewport.addChild(this.background_circle);

    }

    showHealth(): void{

        this.health_circle = new Graphics();
        this.health_circle_background = new Graphics();

        this.health_circle_background.beginFill(0xffffff);
        this.health_circle_background.lineStyle(2, 0xffffff)
        this.health_circle_background.arc(this.getXInPixels()+this.width/2, this.getYInPixels()+this.height/2,
            HEX_SIDE_SIZE/1.38, 0, 2*Math.PI);
        this.health_circle_background.endFill();
        viewport.addChild(this.health_circle_background);

        this.health_circle.beginFill(Unit.HEALTH_BAR_COLOR);
        this.health_circle.lineStyle(2, 0xffffff)
        this.health_circle.arc(this.getXInPixels()+this.width/2, this.getYInPixels()+this.height/2,
            HEX_SIDE_SIZE/1.38, 0,2 * Math.PI / (this.max_health / this.health));
        this.health_circle.endFill();

        viewport.addChild(this.health_circle);
    }

    showMovement(): void{
        if(this.current_path.length === 0 || this.background_unit_movement_percentage === 0){
            if(this.movement_circle != null){
                viewport.removeChild(this.movement_circle);
            }
            return;
        }
        this.movement_circle = new Graphics;
        this.movement_circle.beginFill(Unit.MOVEMENT_COLOR);
        this.movement_circle.lineStyle(2, Unit.MOVEMENT_COLOR)
        this.movement_circle.arc(this.getXInPixels()+this.width/2, this.getYInPixels()+this.height/2,
            HEX_SIDE_SIZE/1.2, 0,2 * Math.PI / (100 / this.background_unit_movement_percentage));
        this.movement_circle.endFill();

        viewport.addChild(this.movement_circle);
    }

    setSpriteSize(): void{
        if(this.is_on_water) {
            this.boat_sprite.width = this.width;
            this.boat_sprite.height = this.height;
        }else{
            this.sprite.width = this.width;
            this.sprite.height = this.height;
        }
    }

    getXInPixels(): number{
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2 - this.width/2;
    }

    getYInPixels(): number{
        return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2 - this.height/2;
    }

    moveTo(x: number, y: number): void{
        const old_node = Node.all_nodes[this.y][this.x];
        old_node.unit = null;

        const new_node = Node.all_nodes[y][x];
        new_node.unit = this;
        this.x = x;
        this.y = y;

        // redraw graphics children
        this.updateUnitMovementBackground();
    }

    setCurrentPath(current_path: number[][]){
        this.current_path = current_path;
        this.updateUnitMovementBackground()
    }

    updateMovementBackground(current_node: Node, depth: number){
        if(depth === 0){
            this.background_unit_movement_percentage = 0;
            //this.updateUnitOnStage();
            return;
        }
        setTimeout(()=>{

            this.background_unit_movement_percentage += 5;
            this.updateUnitOnStage();
            this.updateMovementBackground(current_node, depth - 1);

        }, current_node.getMovementTime() * 1000 / Unit.MOVEMENT_UPDATE_TIME);
    }

    updateUnitMovementBackground(){

        // don't update if it's the final node of the path
        if(this.current_path.length <= 1){
            this.background_unit_movement_percentage = 0;
            return;
        }

        // don't update if there is a unit in the way
        if(this.current_path.length >= 2) {
            if (Node.all_nodes[this.current_path[1][1]][this.current_path[1][0]].unit != null) {
                return;
            }
        }

        this.current_path.shift();
        const current_node: Node = Node.all_nodes[this.current_path[0][1]][this.current_path[0][0]];
        this.updateMovementBackground(current_node, Unit.MOVEMENT_UPDATE_TIME)
    }
}

export default Unit;