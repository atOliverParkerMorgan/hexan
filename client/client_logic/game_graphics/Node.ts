import {a_star, DISTANCE_BETWEEN_HEX, HEX_SIDE_SIZE, Graphics, Sprite, TilingSprite, Texture, WORLD_HEIGHT, WORLD_WIDTH, viewport} from "./Pixi.js";
import {
    hide_city_menu,
    hide_unit_info,
    show_unit_info,
    show_node_info,
    hide_node_info
} from "../UI_logic.js";
import {Unit} from "./Unit/Unit.js";
import {CityInterface} from "./City/CityInterface.js";
import {City} from "./City/City.js";
import {ClientSocket} from "../ClientSocket.js";
import {Player} from "./Player.js";


export class Node{
    // types of nodes displayed as colors
    public static readonly OCEAN: number = 0x0AA3CF;
    public static readonly LAKE: number = 0x80C5DE ;
    public static readonly GRASS: number = 0x7FFF55;
    public static readonly FOREST: number = 0x228B22;
    public static readonly MOUNTAIN: number = 0xF2F2F2;
    public static readonly HIDDEN: number = 0xE0D257;
    public static readonly CAN_BE_HARVESTED = 0xFFBF00;
    public static readonly HARVESTED = 0xFF7800;

    // if type is null => the node is a city therefore it has not type
    public static readonly LEFT: number = 0;
    public static readonly RIGHT: number = 1;
    public static readonly TOP_LEFT: number = 2;
    public static readonly TOP_RIGHT: number = 3;
    public static readonly BOTTOM_LEFT: number = 4;
    public static readonly BOTTOM_RIGHT: number = 5;

    public static readonly MOUNTAIN_TRAVEL_BIAS = 10;

    private static last_hovered_node: Node | null = null;
    private static selected_node: Node | null = null;

    private static selected_line: any;
    private static selected_color: number = 0xFFAC1C;
    private static selected_opacity: number = 1;
    private static selected_thickness: number = 4;

    private static movement_hint_lines: any[] = [];
    private static movement_hint_color: number = 0xFFAC1C;
    private static movement_hint_thickness: number = 3;

    private static attack_hint_color = 0xF53E3E;

    private static bottom_menu_shown: boolean = false;
    private static already_selected: boolean = false;

    private static path: Node[] | null;
    public static all_nodes: Node[][] = [];

    x: number;
    y: number;
    id: number;
    type: number | null;
    opacity: number;
    is_hidden: boolean;
    sprite: any | null;
    city: any;
    unit: Unit | null;

    production_stars: number;
    harvest_cost: number;
    is_harvested: boolean;

    sprite_name: string;

    stars_sprite: any;

    line_borders: any[];
    line_borders_cords: number[];
    parent: Node | null;

    hex: any | null;


    constructor(x: number, y: number, id: number, type: number, line_borders_cords: any, city: any, sprite_name: string, harvest_cost: number, production_stars: number, is_harvested: boolean) {
        this.x = x;
        this.y = y;
        this.id = id;

        // null if node is city
        this.type = type;

        this.opacity = 1;
        this.is_hidden = this.type === Node.HIDDEN;

        this.sprite = null;

        this.stars_sprite = null;

        this.harvest_cost = harvest_cost;
        this.production_stars = production_stars;
        this.is_harvested = is_harvested;

        // null if this node doesn't have a city
        this.city = city;

        this.unit = null;

        this.line_borders = [];
        this.line_borders_cords = line_borders_cords;
        this.sprite_name = sprite_name;

        if(!this.is_hidden) this.set_border(Node.LAKE, 5, 1 , this.line_borders_cords);

        // used for A* searching algorithm
        this.parent = null;
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
            if(x >= 0 && y >= 0 && x < Node.all_nodes.length && y < Node.all_nodes.length){
                neighbours.push(Node.all_nodes[y][x]);
            }else{
                neighbours.push(undefined);
            }
        }

        return neighbours;
    }

    get_valid_movement_neighbours(): Node[]{
        let valid_movement_neighbours: Node[] = []
        let neighbours = this.get_neighbours();
        neighbours.map((neighbour)=> {
            if (neighbour == null) return;
            if ((neighbour.type === Node.OCEAN || neighbour.type === Node.LAKE) && !Player.owned_technologies.includes("Ship Building")) return;

            valid_movement_neighbours.push(neighbour);
        });

        return valid_movement_neighbours;
    }

    get_heuristic_value(start_node: Node, goal_node: Node): number{
        const value = this.get_distance_to_node(start_node) + this.get_distance_to_node(goal_node);
        return value + this.get_movement_time();
    }

    add_node_to_stage(){
        // draw hex
        this.hex = new Graphics();


        if(this.city != null)this.hex.beginFill(this.city.get_node_color(), this.opacity);
        else if(this.is_hidden) this.hex.beginFill(Node.HIDDEN, this.opacity);
        else{
            if(this.can_be_harvested()) this.hex.beginFill(Node.CAN_BE_HARVESTED, this.opacity);

            else if(this.is_harvested) this.hex.beginFill(Node.HARVESTED, this.opacity);

            else this.hex.beginFill(this.type, this.opacity);
        }

        this.hex.drawRegularPolygon(this.get_x_in_pixels(), this.get_y_in_pixels(), HEX_SIDE_SIZE, 6, 0);
        this.hex.endFill();

        this.hex.interactive = true;
        this.hex.button = true;

        this.hex.on('click', () => {
            this.on_click();
        });
        this.hex.on('mouseover', () => { this.set_hovered() });

        viewport.addChild(this.hex);

        this.show_city(this.city);

        // draw node sprite
        this.show_sprite();
    }

    show_city(city: any){
        this.city = city;
    }

    show_sprite(){
        if(this.sprite_name === ""){
            return
        }

        // @ts-ignore
        this.sprite = PIXI.Sprite.from("/images/"+this.sprite_name);

        this.sprite.width = DISTANCE_BETWEEN_HEX * .7;
        this.sprite.height = DISTANCE_BETWEEN_HEX * .7;
        this.sprite.x = this.get_x_in_pixels() - DISTANCE_BETWEEN_HEX/2.5;
        this.sprite.y = this.get_y_in_pixels() - DISTANCE_BETWEEN_HEX/2.5;

        viewport.addChild(this.sprite);
    }

    get_movement_time(): number{
        switch (this.type) {
            case Node.MOUNTAIN:
                return 4000;
            case Node.FOREST:
                return 2000;
            case Node.OCEAN:
                return 1000;
            case Node.LAKE:
                return 1000;
        }

        // GRASS
        return 1000;
    }

    get_distance_to_node(node: Node) {
        return Math.sqrt((node.get_x_in_pixels() - this.get_x_in_pixels()) ** 2 + (node.get_y_in_pixels() - this.get_y_in_pixels()) ** 2);
    }

    get_x_in_pixels(){
        let row_bias = this.y % 2 === 0 ? DISTANCE_BETWEEN_HEX/2 : 0;
        return (this.x * DISTANCE_BETWEEN_HEX + row_bias) - WORLD_WIDTH / 2;
    }

    get_y_in_pixels(){
       return  (this.y * 1.5 * HEX_SIDE_SIZE) - WORLD_HEIGHT / 2;
    }

    get_unit_id(): string | undefined{
        return this.unit?.id;
    }

    set_border(color: number, thickness: number, opacity: number, borders: number[]){
        this.line_borders.forEach(line => line.clear())
        this.line_borders = [];
        let line = new Graphics();
        line.beginFill(color, opacity);

        // drawing border lines
        for(const border of borders){
            let direction_bias;
            switch (border){
                case Node.TOP_RIGHT:
                case Node.BOTTOM_LEFT:
                    direction_bias = border === Node.TOP_RIGHT ? 1: -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(0, direction_bias * - HEX_SIDE_SIZE)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * - HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case Node.RIGHT:
                case Node.LEFT:
                    direction_bias = border === Node.RIGHT ? 1: -1;
                    line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
                    line.lineStyle(thickness, color)
                        .moveTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * - HEX_SIDE_SIZE / 2)
                        .lineTo(direction_bias * DISTANCE_BETWEEN_HEX / 2, direction_bias * HEX_SIDE_SIZE / 2);
                    this.line_borders.push(line);
                    viewport.addChild(line);
                    break;
                case Node.BOTTOM_RIGHT:
                case Node.TOP_LEFT:
                    direction_bias = border === Node.BOTTOM_RIGHT ? 1: -1;
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
        let is_moving_unit = false;

        // unit movement on second click (after selecting unit)
        if(Node.selected_node != null) {
            if (Node.selected_node !== this && Node.selected_node.unit != null && Node.selected_node.unit.is_friendly) {
                console.log(Node.last_hovered_node?.unit)
                // cannot move without hovering on above a node
                if(Node.last_hovered_node == null) return

                is_moving_unit = true;

                let to_node: Node = <Node>Node.last_hovered_node;
                let node_from: Node = <Node>Node.selected_node;

                // get cords of path to send to typescript application
                let path_node_cords = []
                for (const node of <Node[]>Node.path) {
                    path_node_cords.push([node.x, node.y]);
                }
                show_unit_info(Node.selected_node.unit);

                // send movement request to server
                ClientSocket.request_move_unit(Node.selected_node.unit, path_node_cords);

                to_node.update();
                node_from.update();
            }
        }

        Node.already_selected = this === Node.selected_node && !Node.already_selected;

        if (!Node.already_selected) Node.last_hovered_node?.set_selected()
        else{
            this.remove_selected();
        }

        // show bottom information menu
        if(this.city != null && !Node.already_selected) {
            Node.bottom_menu_shown = !Node.bottom_menu_shown;
            // get bottom menu information
            ClientSocket.socket.emit("get_data", {
                request_type: ClientSocket.request_types.GET_MENU_INFO,
                data: {
                    game_token: localStorage.game_token,
                    player_token: localStorage.player_token,
                    city: this.city
                }
            })

        }else{
            hide_city_menu();
        }

        // unit info
        if(this.unit != null && !Node.already_selected){
            if(this.unit.is_friendly) {
                show_unit_info(this.unit);
            }
        }else if(!is_moving_unit){
            hide_unit_info();
        }
        // show node data
        if(this.unit == null && this.city == null){
            show_node_info(this);
        }else {
            hide_node_info();
        }
    }


    set_city(city_data: CityInterface, sprite_name: any){
        this.city = new City(city_data);
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite_name = sprite_name;
        Player.all_cities.push(this.city);

        this.update();
        this.show_sprite();
    }

    set_type(type: number, sprite_name: string){
        this.type = type;
        this.is_hidden = this.type === Node.HIDDEN;
        this.sprite_name = sprite_name;
        this.update();
    }

    get_type_string(): string{
        switch (this.type){
            case Node.FOREST:
                return "Planes"
            case Node.MOUNTAIN:
                return "Mountains";
            case Node.GRASS:
                return "Beach";
            case Node.LAKE:
                return "Lake";
            case Node.OCEAN:
                return "Ocean";
        }

        return "Unknown";
    }

    remove_selected(){
        if(Node.selected_line!=null){
            viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = null;
        this.update()
    }

    remove_unit(){
        this.unit?.remove_children();
        this.unit = null;
        this.update();
    }

    set_selected(){

        // clear all hint lines
        for(const movement_hint_line of Node.movement_hint_lines){
            movement_hint_line.clear();
        }
        Node.movement_hint_lines = [];

        if(Node.selected_line!=null){
            viewport.removeChild(Node.selected_line);
        }
        Node.selected_node = this;

        Node.selected_line = new Graphics();
        Node.selected_line.beginFill(Node.selected_color, Node.selected_opacity);

        // adding an outline to the node that is currently selected
        for (let i = 0, direction_bias = 1; i < 2 ; i++, direction_bias = -1) {
            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(0, direction_bias * (- HEX_SIDE_SIZE + Node.selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (- HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2));


            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * ( - HEX_SIDE_SIZE / 2 + Node.selected_thickness / 2))
                .lineTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * ( HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2));


            Node.selected_line.position.set(this.get_x_in_pixels(), this.get_y_in_pixels());
            Node.selected_line.lineStyle(Node.selected_thickness, Node.selected_color)
                .moveTo(direction_bias * (DISTANCE_BETWEEN_HEX / 2 - Node.selected_thickness / 2), direction_bias * (HEX_SIDE_SIZE / 2 - Node.selected_thickness / 2))
                .lineTo(0, direction_bias * (HEX_SIDE_SIZE - Node.selected_thickness / 2));
        }
        viewport.addChild(Node.selected_line);
    }

    set_hovered(){
        function set_last_node_hovered(this_node: Node){
            Node.last_hovered_node = this_node;
            this_node.opacity = .5;
            this_node.update();
        }

        // restores last node to original value
        if (Node.last_hovered_node != null) {
            if (Node.last_hovered_node.x !== this.x || Node.last_hovered_node.y !== this.y) {
                Node.last_hovered_node.opacity = 1;
                Node.last_hovered_node.update();

                // sets new node (this node) to hovered
                set_last_node_hovered(this);
                if (Node.selected_node != null) {
                    if (Node.selected_node.unit != null && Node.selected_node.unit.is_friendly) {

                            if (Node.movement_hint_lines.length > 0) {
                                for (const movement_hint_line of Node.movement_hint_lines) {
                                    movement_hint_line.clear();
                                }
                                Node.movement_hint_lines = [];
                            }

                            Node.path = a_star(Node.selected_node, Node.last_hovered_node);
                            if (Node.path == null || Node.path.length === 0) return;

                            let last_node = Node.selected_node;

                            for (let i = 1; i < Node.path.length; i++) {
                                let movement_hint_line = new Graphics();
                                viewport.addChild(movement_hint_line);

                                const last_x = last_node.get_x_in_pixels();
                                const last_y = last_node.get_y_in_pixels();
                                const current_x = Node.path[i].get_x_in_pixels();
                                const current_y = Node.path[i].get_y_in_pixels();

                                let path_color;
                                if(Node.last_hovered_node.unit != null){
                                    // if unit is friendly
                                    if(Node.last_hovered_node.unit.is_friendly) return;

                                    // if the unit is out of range don't show any attack or movement hint
                                    if(Node.selected_node.unit.range >= Node.path.length - i){
                                        path_color =  Node.attack_hint_color;
                                    }else{
                                        path_color =  Node.movement_hint_color;
                                    }
                                }else{
                                    path_color =  Node.movement_hint_color;
                                }

                                if (i === 1) {
                                    movement_hint_line.position.set((last_x + current_x) / 2, (last_y + current_y) / 2);
                                    movement_hint_line.lineStyle(Node.movement_hint_thickness, path_color)
                                        .moveTo(0, 0)
                                        .lineTo((current_x - last_x) / 2, (current_y - last_y) / 2);
                                } else {
                                    movement_hint_line.position.set(last_x, last_y);
                                    movement_hint_line.lineStyle(Node.movement_hint_thickness, path_color)
                                        .moveTo(0, 0)
                                        .lineTo(current_x - last_x, current_y - last_y);
                                }

                                Node.movement_hint_lines.push(movement_hint_line);


                                last_node = Node.path[i];

                        }
                    }
                }
            }
        }
        // initial hover - no previous node
        else {
            set_last_node_hovered(this);
        }
    }

    can_be_harvested(){
        if(this.is_harvested || this.city != null) return false;

        let harvested_neighbours = 0;
        for (const neighbour of this.get_neighbours()) {
            if(neighbour?.city != null && neighbour?.city.is_friendly && this?.type !== Node.OCEAN && this?.type !== Node.LAKE){
                return true;
            }
            if(neighbour?.is_harvested){
                harvested_neighbours ++;
            }
            if(harvested_neighbours === 2 && this?.type !== Node.OCEAN && this?.type !== Node.LAKE){
                return true;
            }
        }
        return false;
    }

    update(){
        this?.hex?.clear();
        this.add_node_to_stage();
        if(this.unit != null) {
            this.unit.update_unit_on_stage();
        }
        if(this === Node.selected_node) this.set_selected();

        if(!this.is_hidden) this.set_border(Node.LAKE, 5, 1 , this.line_borders_cords);
    }
}