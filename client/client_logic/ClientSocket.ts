import {Player} from "./game_graphics/Player.js"
import {init_canvas, HEX_SIDE_SIZE, setup_tech_tree,} from "./game_graphics/Pixi.js";
import Unit from "./game_graphics/Unit/Unit.js";
import {Node} from "./game_graphics/Node.js";
import {show_city_menu, show_modal} from "./UI_logic.js";
import {City} from "./game_graphics/City/City.js";

// singleton
export namespace ClientSocket {
    export const response_types: { ALL_RESPONSE: string, MAP_RESPONSE: string, UNIT_MOVED_RESPONSE: string,
            UNITS_RESPONSE: string, UNIT_RESPONSE: string, MENU_INFO_RESPONSE: string,
            HARVEST_NODE_RESPONSE: string, HARVEST_COST_RESPONSE: string, ENEMY_UNIT_MOVED_RESPONSE: string,
            ENEMY_FOUND_RESPONSE:string, NEW_CITY: string, CANNOT_SETTLE: string, CONQUERED_CITY_RESPONSE: string,
            STARS_DATA_RESPONSE: string, PURCHASED_TECHNOLOGY_RESPONSE: string, INVALID_MOVE_RESPONSE: string, ENEMY_UNIT_DISAPPEARED: string,
            ATTACK_UNIT_RESPONSE: string, SOMETHING_WRONG_RESPONSE: string } = {

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
        CANNOT_SETTLE: "CANNOT_SETTLE",

        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",

        PURCHASED_TECHNOLOGY_RESPONSE: "PURCHASED_TECHNOLOGY_RESPONSE",

        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",
        CONQUERED_CITY_RESPONSE: "CONQUERED_CITY",

        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",
        HARVEST_COST_RESPONSE: "HARVEST_COST_RESPONSE",

        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        SOMETHING_WRONG_RESPONSE: "SOMETHING_WRONG_RESPONSE"

    };
    export const request_types:{readonly GET_MAP: string, readonly GET_UNITS: string, readonly GET_ALL: string,
                            readonly GET_MENU_INFO: string, GET_STARS_DATA: string, readonly PRODUCE_UNIT: string, readonly HARVEST_NODE: string,
                            readonly HARVEST_COST:string, readonly PURCHASE_TECHNOLOGY: string, readonly MOVE_UNITS: string, readonly SETTLE: string,
                            ATTACK_UNIT: string,
                            readonly FIND_1v1_OPPONENT: string, readonly FIND_2v2_OPPONENTS: string } = {
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
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };


    // @ts-ignore
    export let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`, {transports: ['websocket', 'polling']});
    console.log(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`)
    export function send_data(data: any): void{
        ClientSocket.socket.emit("send-data", data);
    }

    export function add_data_listener(player_token: string): void{
        ClientSocket.socket.on(player_token, (...args: any[]) => {
            console.log("RESPONSE: " + args[0].response_type);
            const response_type = args[0].response_type;
            const response_data = args[0].data;

            switch (response_type) {
                case ClientSocket.response_types.UNITS_RESPONSE:
                    for(let unit of response_data.units){
                        unit = <UnitData> unit;
                        Player.reset_units()

                        let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, true);
                        Player.all_units.push(graphics_unit);
                        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
                    }
                    break;

                case ClientSocket.response_types.UNIT_RESPONSE:
                    Player.add_unit(response_data.unit);
                    Player.update_total_number_of_stars(response_data);

                    break;

                case ClientSocket.response_types.ALL_RESPONSE:
                    const map = response_data.map;
                    const cities = response_data.cities;

                    init_canvas(map, cities);

                    // adding nodes from linear array to 2d array
                    let y = 0;
                    let row = [];
                    for (let node of map) {
                        if (node.y !== y) {
                            Node.all_nodes.push(row)
                            row = [];
                            y = node.y;
                        }
                        // init node => add nodes to PIXI stage
                        let city = node.city_data != null ? new City(node.city_data): null;
                        if(city != null){
                            Player.all_cities.push(city);
                        }

                        row.push(new Node(node.x, node.y, node.id, node.type, node.borders, city, node.sprite_name, node.harvest_cost, node.production_stars, node.is_harvested));
                    }
                    Node.all_nodes.push(row);

                    for (const row_of_nodes of Node.all_nodes) {
                        for (const node of row_of_nodes) {
                            node.update();
                        }
                    }
                    console.log(response_data.production_units)
                    Player.production_units = response_data.production_units;

                    setup_tech_tree(response_data.root_tech_tree_node);

                    // get star data after game setup is initialized
                    ClientSocket.get_data(ClientSocket.request_types.GET_STARS_DATA, <string>localStorage.getItem("game_token"), player_token)

                    break;

                case ClientSocket.response_types.MENU_INFO_RESPONSE:
                    // update production info
                    console.log("response_data.player.production_units")
                    console.log(response_data.production_units)
                    Player.production_units = response_data.production_units;
                    show_city_menu(response_data.city_data);
                    break;

                // deal with sever UNIT_MOVED response
                case ClientSocket.response_types.UNIT_MOVED_RESPONSE:
                    let found_unit = false;

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
                    Player.all_units.map((unit: any)=>{
                        if(unit.id === response_data.unit.id){
                            found_unit = true;
                            // transform unit into ship if on a water node
                            unit.is_on_water = response_data.unit.is_on_water;
                            unit.move_to(response_data.unit.x, response_data.unit.y);
                            return;
                        }
                    })


                    // if not found something went wrong
                    if(!found_unit){
                        console.error("Error, something has gone wrong with the sever public communication")
                        break;
                    }

                    break;

                case ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE:
                    let found_enemy_unit = false;

                    Player.all_enemy_visible_units.map((enemy_visible_unit: Unit)=>{
                        if(enemy_visible_unit.id === response_data.unit.id){
                            found_enemy_unit = true;
                            enemy_visible_unit.move_to(response_data.unit.x, response_data.unit.y);
                            return
                        }
                    })

                    if(!found_enemy_unit){
                        Player.add_enemy_unit(response_data.unit);
                    }

                    break;


                case ClientSocket.response_types.ENEMY_FOUND_RESPONSE:
                    Player.add_enemy_unit(response_data.unit);

                    break;

                case ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED:
                    Player.delete_enemy_visible_unit(response_data.unit)

                    break;

                case ClientSocket.response_types.HARVEST_COST_RESPONSE:
                    for (const cords of response_data.node_cords) {
                        Node.all_nodes[cords[1]][cords[0]].harvest_cost = response_data.harvest_cost;
                    }
                    break;

                case ClientSocket.response_types.NEW_CITY:
                    const current_node: Node = Node.all_nodes[response_data.city_y][response_data.city_x];
                    current_node.set_city(response_data.city_node.city_data, response_data.city_node.sprite_name);

                    for(const neighbour of current_node.get_neighbours()){
                        if(neighbour != null){
                            neighbour.update();
                        }
                    }

                    current_node.remove_unit();
                    break;

                case ClientSocket.response_types.ATTACK_UNIT_RESPONSE:

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

                    break

                case ClientSocket.response_types.CANNOT_SETTLE:
                    // TODO custom alarm
                    console.log("Cannot settle");
                    break;

                case ClientSocket.response_types.STARS_DATA_RESPONSE:
                    Player.setup_star_production(response_data);
                    break;

                case ClientSocket.response_types.SOMETHING_WRONG_RESPONSE:
                    console.log("here")
                    show_modal(response_data.title, response_data.message, "w3-red");
                    break;

                case ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE:
                    setup_tech_tree(response_data.root_tech_tree_node);
                    Player.update_total_number_of_stars(response_data);
                    break;

                case ClientSocket.response_types.HARVEST_NODE_RESPONSE:
                    // update node to show that it is harvested
                    Player.setup_star_production(response_data);

                    (<HTMLInputElement>document.getElementById("harvest_button")).style.visibility = "hidden";

                    const node = Node.all_nodes[response_data.node.y][response_data.node.x];
                    node.is_harvested = response_data.node.is_harvested;
                    node.update();

                    for (const neighbor of node.get_neighbours()) {
                        neighbor?.update();
                    }
                    break;

                case ClientSocket.response_types.CONQUERED_CITY_RESPONSE:
                    // if player conquered a city
                    const city_node: Node = Node.all_nodes[response_data.city.y][response_data.city.x];

                    if(Player.owns_city(response_data.city.name)) {
                        city_node.set_city(response_data.city_node.city_data, response_data.city_node.sprite_name);

                        for (const neighbour of city_node.get_neighbours()) {
                            if (neighbour != null) {
                                neighbour.update();
                            }
                        }
                    }else{
                        Player.remove_city(response_data.city.name);
                        city_node.city.is_friendly = false;
                        city_node.update();
                    }
                    break;
            }
        });
    }

    export function get_data(request_type: string, game_token: string, player_token: string): void{
        console.log("REQUEST: "+request_type);
        ClientSocket.socket.emit("get_data", {
            request_type: request_type,
            data: {
                game_token: game_token,
                player_token: player_token
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