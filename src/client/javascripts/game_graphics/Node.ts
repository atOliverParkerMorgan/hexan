import {a_star, DISTANCE_BETWEEN_HEX, Graphics, HEX_SIDE_SIZE, viewport, WORLD_HEIGHT, WORLD_WIDTH} from "./Pixi.js";
import {hide_city_bottom_menu, show_city_bottom_menu} from "../bottom_menu.ts";
import {ClientSocket} from "../ClientSocket.ts";

// types of nodes displayed as colors
const WATER = 0x80C5DE;
const GRASS = 0x7FFF55;
const BEACH = 0xFFFF00;
const MOUNTAIN = 0xF2F2F2;
const HIDDEN = 0xE0D257;
const CITY = 0xF53E3E;

// borders see @Map.add_neighbors_to_nodes()
const LEFT = 0;
const RIGHT = 1;
const TOP_LEFT = 2;
const TOP_RIGHT = 3;
const BOTTOM_LEFT = 4;
const BOTTOM_RIGHT = 5;

const MOUNTAIN_TRAVEL_BIAS = 10;

let last_hovered_node = null;
let selected_node = null;

let selected_line;
const selected_color = 0xFFAC1C;
const selected_opacity = 1;
const selected_thickness = 4;

let movement_hint_lines = [];
const movement_hint_color = 0xFFAC1C;
const movement_hint_opacity = 1;
const movement_hint_thickness = 3;

let bottom_menu_shown = false;
let already_selected = false;

let path;

export let all_nodes = [];

export class Node{
    constructor(x, y, id, type, line_borders, city) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.type = type;
        this.opacity = 1;
        this.is_hidden = this.type === HIDDEN;

        this.sprite = null;

        // -1 if this node doesn't have a city
        this.city = city;
        this.units = [];

        this.line_borders = [];
        this.line_borders_cords = line_borders;
        this.add_node_to_stage()
        if(!this.is_hidden) this.set_border(WATER, 5, 1 , this.line_borders_cords);

        // used for A* searching algorithm
        this.parent = null;
    }

    produce(){

    }

    get_neighbours(){

        let cords;
        if(this.y % 2 === 0){
           cords = [[-1, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]];
        }else {
           cords = [[-1, 0], [1, 0], [-1, -1], [0, -1], [-1, 1], [0, 1]];
        }

        let neighbours = [];
        for(const cord of cords){
            const x = this.x + cord[0];
            const y = this.y + cord[1];
            if(x >= 0 && y >= 0 && x < all_nodes.length && y < all_nodes.length){
                neighbours.push(all_nodes[y][x]);
            }else{
                neighbours.push(undefined);
            }
        }

        return neighbours;
    }

    get_heuristic_value(start_node, goal_node){
        const value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        if (this.is_hidden) return value;
        if (this.type === WATER) value + 1000;
        if (this.type === MOUNTAIN) value + MOUNTAIN_TRAVEL_BIAS;
        return value;
    }

    add_node_to_stage(){

        this.hex = new Graphics();

        if(this.city != null) this.hex.beginFill(CITY, this.opacity);
        else if(this.is_hidden) this.hex.beginFill(HIDDEN, this.opacity);
        else this.hex.beginFill(this.type, this.opacity);

        this.hex.drawRegularPolygon(this.get_x_in_pixels(), this.get_y_in_pixels(), HEX_SIDE_SIZE, 6, 0);
        this.hex.endFill();

        this.hex.interactive = true;

        this.hex.on('pointerdown', (event) => { this.on_click() });
        this.hex.on('mouseover', (event) => { this.set_hovered() });

        // changing color of city

        viewport.addChild(this.hex);

        if(this.city != null){
            this.sprite = new PIXI.Sprite.from("/images/village.png");

            this.sprite.width = DISTANCE_BETWEEN_HEX * .7;
            this.sprite.height = DISTANCE_BETWEEN_HEX * .7;
            this.sprite.x = this.get_x_in_pixels() - DISTANCE_BETWEEN_HEX/2.5;
            this.sprite.y = this.get_y_in_pixels() - DISTANCE_BETWEEN_HEX/2.5;

            viewport.addChild(this.sprite);
        }
    }

    get_distance_to_node(node) {
        return Math.sqrt((node.get_x_in_pixels() - this.get_x_in_pixels()) ** 2 + (node.get_y_in_pixels() - this.get_y_in_pixels()) ** 2);
    }

    get_x_in_pixels(){
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    }

    get_y_in_pixels(){
       return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
    }

    get_unit_ids(){
        let all_unit_data = []
        for (const unit of this.units) {
           all_unit_data.push(unit.id);
        }
        return all_unit_data;
    }

    set_border(color, thickness, opacity, borders){
        this.line_borders.forEach(line => line.clear())
        this.line_borders = [];
        let line = new Graphics();
        line.beginFill(color, opacity);

        // drawing border lines
        for(const border of borders){
            let direction_bias;
            switch (border){
                case TOP_RIGHT:
                case BOTTOM_LEFT:
                    direction_bias = border === TOP_RIGHT ? 1: -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(0, direction_bias * - HEX_SIDE_SIZE)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * - HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case RIGHT:
                case LEFT:
                    direction_bias = border === RIGHT ? 1: -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * - HEX_SIDE_SIZE / 2)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case BOTTOM_RIGHT:
                case TOP_LEFT:
                    direction_bias = border === BOTTOM_RIGHT ? 1: -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * HEX_SIDE_SIZE / 2)
                        .lineTo(0, direction_bias * HEX_SIDE_SIZE);
                    this.line_borders.push(line);
                    viewport.addChild(line);
            }
        }
    }

    on_click(){
       // unit movement
        if(selected_node != null) {
            if(selected_node !== this && selected_node.units.length > 0) {
                let to_node = last_hovered_node;
                let node_from = selected_node;

                // get cords of path to send to server application
                let path_node_cords = []
                for (const node of path) {
                    path_node_cords.push([node.x, node.y]);
                }

                ClientSocket.send_data({
                    request_type: ClientSocket.request_types.MOVE_UNITS,
                    data: {
                        game_token: localStorage.game_token,
                        player_token: localStorage.player_token,
                        unit_ids: selected_node.get_unit_ids(),
                        path: path_node_cords
                    }
                })

                to_node.update();
                node_from.update();
            }
        }
        already_selected = this === selected_node && !already_selected;
        if (!already_selected) last_hovered_node.set_selected()
        else{
            this.remove_selected();
        }


        // show bottom information menu
        if(this.city != null && !already_selected) {
            bottom_menu_shown = !bottom_menu_shown;
            // get bottom menu information
            ClientSocket.socket.emit("get-data", {
                request_type: ClientSocket.request_types.GET_MENU_INFO,
                data: {
                    game_token: localStorage.game_token,
                    player_token: localStorage.player_token,
                    city: this.city
                }
            })

            show_city_bottom_menu(this.city);
        }else{
            hide_city_bottom_menu();
        }
    }

    set_type(type){
        this.type = type;
        this.is_hidden = this.type === HIDDEN;
        this.update();
    }

    remove_selected(){
        if(selected_line!=null){
            viewport.removeChild(selected_line);
        }
        selected_node = null;
        this.update()
    }

    set_selected(){

        // clear all hint lines
        for(const movement_hint_line of movement_hint_lines){
            movement_hint_line.clear();
        }
        movement_hint_lines = [];

        if(selected_line!=null){
            viewport.removeChild(selected_line);
        }
        selected_node = this;

        selected_line = new Graphics();
        selected_line.beginFill(selected_color, selected_opacity);

        // adding an outline to the node that is currently selected
        for (let i = 0, direction_bias = 1; i < 2 ; i++, direction_bias = -1) {
            selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            selected_line.lineStyle(selected_thickness, selected_color)
                .moveTo(0, direction_bias * (- HEX_SIDE_SIZE + selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - selected_thickness / 2), direction_bias * (- HEX_SIDE_SIZE / 2 + selected_thickness / 2));


            selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            selected_line.lineStyle(selected_thickness, selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - selected_thickness / 2), direction_bias * ( - HEX_SIDE_SIZE / 2 + selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - selected_thickness / 2), direction_bias * ( HEX_SIDE_SIZE / 2 - selected_thickness / 2));


            selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            selected_line.lineStyle(selected_thickness, selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - selected_thickness / 2), direction_bias * (HEX_SIDE_SIZE / 2 - selected_thickness / 2))
                .lineTo(0, direction_bias * (HEX_SIDE_SIZE - selected_thickness / 2));
        }
        viewport.addChild(selected_line);
    }

    set_hovered(){
        function set_last_node_hovered(this_node){
            last_hovered_node = this_node;
            this_node.opacity = .5;
            this_node.update();
        }

        // restores last node to original value
        if(last_hovered_node != null) {
            if(last_hovered_node.x !== this.x || last_hovered_node.y!== this.y) {
                last_hovered_node.opacity = 1;
                last_hovered_node.update();

                // sets new node (this node) to hovered
                set_last_node_hovered(this);
                if(selected_node != null) {
                    if (selected_node.units.length > 0) {

                        if(movement_hint_lines.length > 0){
                            for(const movement_hint_line of movement_hint_lines){
                                movement_hint_line.clear();
                            }
                           movement_hint_lines = [];
                        }

                        path = a_star(selected_node, last_hovered_node);

                        let last_node = selected_node;

                        for (let i = 1; i < path.length ; i++) {
                            let movement_hint_line = new Graphics();
                            viewport.addChild(movement_hint_line);

                            const last_x = last_node.get_x_in_pixels();
                            const last_y = last_node.get_y_in_pixels();
                            const current_x = path[i].get_x_in_pixels();
                            const current_y = path[i].get_y_in_pixels();

                            if(i===1) {
                                movement_hint_line.position.set((last_x + current_x) / 2, (last_y + current_y) / 2);
                                movement_hint_line.lineStyle(movement_hint_thickness, movement_hint_color)
                                    .moveTo(0, 0)
                                    .lineTo((current_x - last_x) / 2, (current_y - last_y) / 2);
                            }else{
                                movement_hint_line.position.set(last_x, last_y);
                                movement_hint_line.lineStyle(movement_hint_thickness, movement_hint_color)
                                    .moveTo(0, 0)
                                    .lineTo(current_x - last_x, current_y - last_y);
                            }

                            movement_hint_lines.push(movement_hint_line);


                            last_node = path[i];
                        }
                    }
                }
            }
        }
        // initial hover - no previous node
        else{
            set_last_node_hovered(this);
        }
    }

    update(){
        this.hex.clear();
        this.add_node_to_stage();
        for(const unit of this.units){
            unit.add_unit_to_stage();
        }
        if(this === selected_node) this.set_selected();

        if(!this.is_hidden) this.set_border(WATER, 5, 1 , this.line_borders_cords);
    }
}