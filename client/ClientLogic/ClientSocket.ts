import {Player} from "./GameGraphics/Player.js"
import {init_canvas, HEX_SIDE_SIZE, setup_tech_tree, init_game, updateBoard,} from "./GameGraphics/Pixi.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import {Node} from "./GameGraphics/Node.js";
import {game_over, show_city_menu, show_modal} from "./UiLogic.js";
import {City} from "./GameGraphics/City/City.js";

// singleton
export namespace ClientSocket {
    export const response_types = {

        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        UNIT_RESPONSE: "UNIT_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",


        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",
        ENEMY_FOUND_RESPONSE: "ENEMY_FOUND_RESPONSE",
        ATTACK_UNIT_RESPONSE: "ATTACK_UNIT_RESPONSE",

        NEW_CITY: "NEW_CITY",

        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",

        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",

        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",

        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_COST_RESPONSE: "HARVEST_COST_RESPONSE",

        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE",

        END_GAME_RESPONSE: "END_GAME_RESPONSE",
        FOUND_GAME_RESPONSE: "FOUND_GAME_RESPONSE"

    };
    export const request_types = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        GET_STARS_DATA: "GET_STARS_DATA",

        PRODUCE_UNIT: "PRODUCE_UNIT",
        HARVEST_NODE: "HARVEST_NODE",
        HARVEST_COST: "HARVEST_COST",
        PURCHASE_TECHNOLOGY: "PURCHASE_TECHNOLOGY",
        MOVE_UNITS: "MOVE_UNITS",
        SETTLE: "SETTLE",

        ATTACK_UNIT: "ATTACK_UNIT",

        // match making
        FIND_AI_OPPONENT: "FIND_AI_OPPONENT",
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };

    export let socket: any;
    console.log(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`)

    export function connect(){
        // @ts-ignore
        socket = io(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`, {transports: ['websocket', 'polling']});
    }
    export function send_data(data: any): void{
        ClientSocket.socket.emit("send_data", data);
    }

    export function add_data_listener(): void{
        socket.on(ClientSocket.response_types.ALL_RESPONSE, (...args: any[]) => {
            updateBoard(args);
        })

        socket.on(ClientSocket.response_types.FOUND_GAME_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            init_game(socket.id, response_data.game_token);
        })

        socket.on(ClientSocket.response_types.MENU_INFO_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            // update production info
            console.log("response_data.player.production_units")
            console.log(response_data.production_units)
            Player.production_units = response_data.production_units;
            show_city_menu(response_data.city_data);
        })

        socket.on(ClientSocket.response_types.UNITS_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            for(let unit of response_data.units){
                unit = <UnitData> unit;
                Player.reset_units()

                let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, true);
                Player.all_units.push(graphics_unit);
                Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
            }
        })

        socket.on(ClientSocket.response_types.UNIT_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            console.log(response_data.unit)
            if(Node.all_nodes[response_data.unit.y][response_data.unit.x].city.is_friendly){
                Player.add_unit(response_data.unit);
                Player.update_total_number_of_stars(response_data);
            }else{
                Player.add_enemy_unit(response_data.unit);
                Node.all_nodes[response_data.unit.y][response_data.unit.x].update()
            }
        })

        socket.on(ClientSocket.response_types.UNIT_MOVED_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            if(Player.all_units == null){
                return;
            }

            // update nodes
            response_data.nodes.map( (node: any) => {
                if(node.type != null) {
                    Node.all_nodes[node.y][node.x].set_type(node.type, node.sprite_name);
                }else if(node.city_data != null){
                    Node.all_nodes[node.y][node.x].set_city(node.city_data, node.sprite_name);
                }
            });

            // find the unit in question
            if(!move_unit(response_data.unit)){
                console.error("Error, something has gone wrong with the sever public communication")
            }
        })

        socket.on(ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            if(!move_enemy_units(response_data.unit)){
                Player.add_enemy_unit(response_data.unit);
            }
        })

        socket.on(ClientSocket.response_types.ENEMY_FOUND_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            Player.add_enemy_unit(response_data.unit);
        })

        socket.on(ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED, (...args: any[]) => {
            const response_data = args[0];
            Player.delete_enemy_visible_unit(response_data.unit)
        })

        socket.on(ClientSocket.response_types.HARVEST_COST_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            for (const cords of response_data.node_cords) {
                Node.all_nodes[cords[1]][cords[0]].harvest_cost = response_data.harvest_cost;
            }
        })

        socket.on(ClientSocket.response_types.NEW_CITY, (...args: any[]) => {
            const response_data = args[0];
            const current_node: Node = Node.all_nodes[response_data.city_y][response_data.city_x];
            current_node.set_city(response_data.city_node.city_data, response_data.city_node.sprite_name);

            for(const neighbour of current_node.get_neighbours()){
                if(neighbour != null){
                    neighbour.update();
                }
            }

            current_node.remove_unit();
        })


        socket.on(ClientSocket.response_types.ATTACK_UNIT_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            // updates unit graphics after attack
            console.log(response_data)
            if(response_data.is_unit_1_dead) {
                Player.delete_friendly_unit(response_data.unit_1);
                Player.delete_enemy_visible_unit(response_data.unit_1);
            }
            else{
                Player.update_units_after_attack(response_data.unit_1);
            }

            if(response_data.is_unit_2_dead) {
                Player.delete_friendly_unit(response_data.unit_2);
                Player.delete_enemy_visible_unit(response_data.unit_2);
            }
            else{
                Player.update_units_after_attack(response_data.unit_2);
            }
        })

        socket.on(ClientSocket.response_types.STARS_DATA_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            Player.setup_star_production(response_data);
        })

        socket.on(ClientSocket.response_types.SOMETHING_WRONG_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            show_modal(response_data.title, response_data.message, "w3-red");
        })

        socket.on(ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            setup_tech_tree(response_data.root_tech_tree_node);
            Player.update_total_number_of_stars(response_data);
        })

        socket.on(ClientSocket.response_types.HARVEST_NODE_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            // update node to show that it is harvested
            Player.setup_star_production(response_data);

            (<HTMLInputElement>document.getElementById("harvest_button")).style.visibility = "hidden";

            const node = Node.all_nodes[response_data.node.y][response_data.node.x];
            node.is_harvested = response_data.node.is_harvested;
            node.update();

            for (const neighbor of node.get_neighbours()) {
                neighbor?.update();
            }
        })

        socket.on(ClientSocket.response_types.CONQUERED_CITY_RESPONSE, (...args: any[]) => {
            const response_data = args[0];


            // if player conquered a city
            const city_node: Node = Node.all_nodes[response_data.city.y][response_data.city.x];

            city_node.city.is_friendly = response_data.city.is_friendly;
            city_node.update();

            for (const neighbour of city_node.get_neighbours()) {
                neighbour?.update();
            }

            if(city_node.city.is_friendly){
                move_unit(response_data.unit);
            }else{
                move_enemy_units(response_data.unit);
            }

        })

        socket.on(ClientSocket.response_types.END_GAME_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            game_over();
        })
    }

    // return if unit move was valid
    function move_unit(response_unit: Unit): boolean{
        // find the unit in question
        for (const unit of Player.all_units) {
            if(unit.id === response_unit.id){
                // transform unit into ship if on a water node
                unit.is_on_water = response_unit.is_on_water;
                unit.move_to(response_unit.x, response_unit.y);
                return true;
            }
        }

        return false;
    }

    function move_enemy_units(response_unit: Unit):boolean{

        // find the unit in question
        for (const enemy_unit of Player.all_enemy_visible_units) {
            if(enemy_unit.id === response_unit.id){
                // transform unit into ship if on a water node
                enemy_unit.is_on_water = response_unit.is_on_water;
                enemy_unit.move_to(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }

    export function get_data(request_type: string): void{
        console.log("REQUEST: "+request_type);
        ClientSocket.socket.emit("get_data", {
            request_type: request_type,
            data: {
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
            }
        })
    }

    export function request_production(unit_name: string) {
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.PRODUCE_UNIT,
            data: {
                unit_type: unit_name,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
                city_name: (<HTMLInputElement>document.getElementById("city_name")).textContent
            }
        })
    }

    export function request_unit_action(unit: Unit){
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.SETTLE,
            data: {
                x: unit.x,
                y: unit.y,
                id: unit.id,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token,
            }
        })
    }

    export function request_harvest(node_x: number, node_y: number){
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.HARVEST_NODE,
            data: {
                node_x: node_x,
                node_y: node_y,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token
            }
        })
    }

    export function request_buy_technology(tech_name: string){
        ClientSocket.send_data({
            request_type: ClientSocket.request_types.PURCHASE_TECHNOLOGY,
            data: {
                tech_name: tech_name,
                player_token: localStorage.player_token,
                game_token: localStorage.game_token
            }
        })
    }

    export function request_move_unit(unit: Unit | undefined, path: number[][]) {

        ClientSocket.send_data({
            request_type: ClientSocket.request_types.MOVE_UNITS,
            data: {
                game_token: localStorage.game_token,
                player_token: localStorage.player_token,
                unit_id: unit?.id,
                path: path
            }
        })
        unit?.set_current_path(path);
    }

}