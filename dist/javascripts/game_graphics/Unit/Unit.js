"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Unit = void 0;
var Pixi_1 = require("../Pixi");
var Node_1 = require("../Node");
var PIXI = __importStar(require("pixi.js"));
var Unit = /** @class */ (function () {
    function Unit(x, y, id, width, height, texture_path) {
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
        this.health_circle = new Pixi_1.Graphics();
        this.health_circle_background = new Pixi_1.Graphics();
        this.background_circle = new Pixi_1.Graphics();
        this.sprite = PIXI.Sprite.from(this.texture_path);
        this.is_health_circle_on_viewport = false;
        this.is_health_circle_background_on_viewport = false;
        this.background_circle_on_viewport = false;
        this.add_unit_to_stage();
    }
    Unit.prototype.add_unit_to_stage = function () {
        if (this.sprite != null) {
            Pixi_1.viewport.removeChild(this.sprite);
        }
        this.show_health();
        this.show_background();
        this.set_sprite_position();
        this.set_sprite_size();
        // this.sprite.interactive = false;
        // this.sprite.buttonMode = false;
        Pixi_1.viewport.addChild(this.sprite);
    };
    Unit.prototype.set_sprite_position = function () {
        this.sprite.x = this.get_x_in_pixels();
        this.sprite.y = this.get_y_in_pixels();
    };
    Unit.prototype.show_background = function () {
        if (this.background_circle_on_viewport) {
            Pixi_1.viewport.removeChild(this.background_circle);
        }
        else {
            this.background_circle_on_viewport = true;
        }
        this.background_circle.beginFill(0xffffff);
        this.background_circle.drawCircle(this.get_x_in_pixels() + this.width / 2, this.get_y_in_pixels() + this.height / 2, Pixi_1.HEX_SIDE_SIZE / 1.8);
        this.background_circle.endFill();
        Pixi_1.viewport.addChild(this.background_circle);
    };
    Unit.prototype.show_health = function () {
        if (this.is_health_circle_on_viewport && this.is_health_circle_background_on_viewport) {
            Pixi_1.viewport.removeChild(this.health_circle);
            Pixi_1.viewport.removeChild(this.health_circle_background);
        }
        else {
            this.is_health_circle_on_viewport = true;
            this.is_health_circle_background_on_viewport = true;
        }
        this.health_circle.beginFill(Unit.HEALTH_BAR_COLOR);
        this.health_circle.lineStyle(2, 0xffffff);
        this.health_circle.arc(this.get_x_in_pixels() + this.width / 2, this.get_y_in_pixels() + this.height / 2, Pixi_1.HEX_SIDE_SIZE / 1.5, 0, 2 * Math.PI / (this.max_health / this.health));
        this.health_circle.endFill();
        this.health_circle_background.beginFill(0xffffff);
        this.health_circle_background.lineStyle(2, 0xffffff);
        this.health_circle_background.arc(this.get_x_in_pixels() + this.width / 2, this.get_y_in_pixels() + this.height / 2, Pixi_1.HEX_SIDE_SIZE / 1.5, 0, 2 * Math.PI);
        this.health_circle_background.endFill();
        Pixi_1.viewport.addChild(this.health_circle_background);
        Pixi_1.viewport.addChild(this.health_circle);
    };
    Unit.prototype.set_sprite_size = function () {
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    };
    Unit.prototype.get_x_in_pixels = function () {
        var row_bias = this.y % 2 === 0 ? Pixi_1.DISTANCE_BETWEEN_HEX / 2 : 0;
        return (this.x * Pixi_1.DISTANCE_BETWEEN_HEX + row_bias) - Pixi_1.WORLD_WIDTH / 2 - this.width / 2;
    };
    Unit.prototype.get_y_in_pixels = function () {
        return (this.y * 1.5 * Pixi_1.HEX_SIDE_SIZE) - Pixi_1.WORLD_HEIGHT / 2 - this.height / 2;
    };
    Unit.prototype.move_to = function (x, y) {
        var old_node = Node_1.Node.all_nodes[this.y][this.x];
        old_node.units.splice(old_node.units.indexOf(this));
        var new_node = Node_1.Node.all_nodes[y][x];
        new_node.units.push(this);
        this.x = x;
        this.y = y;
        // redraw sprite
        this.add_unit_to_stage();
    };
    Unit.MELEE = "MELEE";
    Unit.RANGE = "RANGE";
    Unit.CAVALRY = "CAVALRY";
    Unit.HEALTH_BAR_COLOR = 0x7CFC00;
    Unit.HEALTH_BAR_POSITION_BIAS = 50;
    return Unit;
}());
exports.Unit = Unit;
exports.default = Unit;
