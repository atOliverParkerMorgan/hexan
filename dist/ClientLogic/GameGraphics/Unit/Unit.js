import { DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, Graphics, Sprite, viewport, WORLD_HEIGHT, WORLD_WIDTH } from "../Pixi.js";
import { Node } from "../Node.js";
// TODO implement webpack and migrate towards a framework better than plane html
var Unit = /** @class */ (function () {
    function Unit(unit, width, height, is_friendly) {
        this.background_unit_movement_percentage = 0;
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
                if (this.attack == 40)
                    this.texture_path = "/images/spearman.png";
                else
                    this.texture_path = "/images/warrior.png";
                break;
            case Unit.RANGE:
                if (this.range == 1)
                    this.texture_path = "/images/slinger.png";
                else
                    this.texture_path = "/images/archer.png";
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
    Unit.prototype.removeChildren = function () {
        // remove the unit Graphics when unit moves
        if (this.sprite != null) {
            viewport.removeChild(this.sprite);
        }
        if (this.boat_sprite != null) {
            viewport.removeChild(this.boat_sprite);
        }
        if (this.background_circle != null) {
            viewport.removeChild(this.background_circle);
        }
        if (this.health_circle != null && this.health_circle_background != null) {
            viewport.removeChild(this.health_circle);
            viewport.removeChild(this.health_circle_background);
        }
        if (this.movement_circle != null) {
            viewport.removeChild(this.movement_circle);
        }
    };
    Unit.prototype.updateUnitOnStage = function () {
        this.removeChildren();
        this.showMovement();
        this.showHealth();
        this.showBackground();
        this.setSpritePosition();
        this.setSpriteSize();
        if (this.is_on_water) {
            this.boat_sprite.interactive = false;
            this.boat_sprite.buttonMode = false;
            viewport.addChild(this.boat_sprite);
        }
        else {
            this.sprite.interactive = false;
            this.sprite.buttonMode = false;
            viewport.addChild(this.sprite);
        }
    };
    Unit.prototype.setSpritePosition = function () {
        if (this.is_on_water) {
            this.boat_sprite.x = this.getXInPixels();
            this.boat_sprite.y = this.getYInPixels();
        }
        else {
            this.sprite.x = this.getXInPixels();
            this.sprite.y = this.getYInPixels();
        }
    };
    Unit.prototype.showBackground = function () {
        this.background_circle = new Graphics();
        if (this.is_friendly) {
            this.background_circle.beginFill(Unit.FRIENDLY_BACKGROUND_COLOR);
        }
        else {
            this.background_circle.beginFill(Unit.ENEMY_BACKGROUND_COLOR);
        }
        this.background_circle.drawCircle(this.getXInPixels() + this.width / 2, this.getYInPixels() + this.height / 2, HEX_SIDE_SIZE / 1.8);
        this.background_circle.endFill();
        viewport.addChild(this.background_circle);
    };
    Unit.prototype.showHealth = function () {
        this.health_circle = new Graphics();
        this.health_circle_background = new Graphics();
        this.health_circle_background.beginFill(0xffffff);
        this.health_circle_background.lineStyle(2, 0xffffff);
        this.health_circle_background.arc(this.getXInPixels() + this.width / 2, this.getYInPixels() + this.height / 2, HEX_SIDE_SIZE / 1.38, 0, 2 * Math.PI);
        this.health_circle_background.endFill();
        viewport.addChild(this.health_circle_background);
        this.health_circle.beginFill(Unit.HEALTH_BAR_COLOR);
        this.health_circle.lineStyle(2, 0xffffff);
        this.health_circle.arc(this.getXInPixels() + this.width / 2, this.getYInPixels() + this.height / 2, HEX_SIDE_SIZE / 1.38, 0, 2 * Math.PI / (this.max_health / this.health));
        this.health_circle.endFill();
        viewport.addChild(this.health_circle);
    };
    Unit.prototype.showMovement = function () {
        if (this.current_path.length === 0 || this.background_unit_movement_percentage === 0) {
            if (this.movement_circle != null) {
                viewport.removeChild(this.movement_circle);
            }
            return;
        }
        this.movement_circle = new Graphics;
        this.movement_circle.beginFill(Unit.MOVEMENT_COLOR);
        this.movement_circle.lineStyle(2, Unit.MOVEMENT_COLOR);
        this.movement_circle.arc(this.getXInPixels() + this.width / 2, this.getYInPixels() + this.height / 2, HEX_SIDE_SIZE / 1.2, 0, 2 * Math.PI / (100 / this.background_unit_movement_percentage));
        this.movement_circle.endFill();
        viewport.addChild(this.movement_circle);
    };
    Unit.prototype.setSpriteSize = function () {
        if (this.is_on_water) {
            this.boat_sprite.width = this.width;
            this.boat_sprite.height = this.height;
        }
        else {
            this.sprite.width = this.width;
            this.sprite.height = this.height;
        }
    };
    Unit.prototype.getXInPixels = function () {
        var row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2 - this.width / 2;
    };
    Unit.prototype.getYInPixels = function () {
        return (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2 - this.height / 2;
    };
    Unit.prototype.moveTo = function (x, y) {
        var old_node = Node.all_nodes[this.y][this.x];
        old_node.unit = null;
        var new_node = Node.all_nodes[y][x];
        new_node.unit = this;
        this.x = x;
        this.y = y;
        // redraw graphics children
        this.updateUnitMovementBackground();
    };
    Unit.prototype.setCurrentPath = function (current_path) {
        this.current_path = current_path;
        this.updateUnitMovementBackground();
    };
    Unit.prototype.updateMovementBackground = function (current_node, depth) {
        var _this = this;
        if (depth === 0) {
            this.background_unit_movement_percentage = 0;
            //this.updateUnitOnStage();
            return;
        }
        setTimeout(function () {
            _this.background_unit_movement_percentage += 5;
            _this.updateUnitOnStage();
            _this.updateMovementBackground(current_node, depth - 1);
        }, current_node.getMovementTime() * 1000 / Unit.MOVEMENT_UPDATE_TIME);
    };
    Unit.prototype.updateUnitMovementBackground = function () {
        // don't update if it's the final node of the path
        if (this.current_path.length <= 1) {
            this.background_unit_movement_percentage = 0;
            return;
        }
        // don't update if there is a unit in the way
        if (this.current_path.length >= 2) {
            if (Node.all_nodes[this.current_path[1][1]][this.current_path[1][0]].unit != null) {
                return;
            }
        }
        this.current_path.shift();
        var current_node = Node.all_nodes[this.current_path[0][1]][this.current_path[0][0]];
        this.updateMovementBackground(current_node, Unit.MOVEMENT_UPDATE_TIME);
    };
    // unit types
    Unit.CAVALRY = "Cavalry";
    Unit.MELEE = "Melee";
    Unit.RANGE = "Range";
    Unit.SETTLER = "Settler";
    // action that designated units can take
    Unit.FORTIFY = "Fortify";
    Unit.SETTLE = "Settle";
    Unit.BUILD = "Build";
    Unit.MOVEMENT_UPDATE_TIME = 30;
    // graphics colors
    Unit.HEALTH_BAR_COLOR = 0x7CFC00;
    Unit.FRIENDLY_BACKGROUND_COLOR = 0xFF7800;
    Unit.ENEMY_BACKGROUND_COLOR = 0xF53E3E;
    Unit.MOVEMENT_COLOR = 0xADD8E6;
    return Unit;
}());
export { Unit };
export default Unit;
