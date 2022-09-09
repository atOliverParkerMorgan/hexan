import {
    all_units,
    reset_units,
    all_enemy_visible_units,
    setup_star_production,
    set_total_owned_stars
} from "./game_graphics/Player.js"
import {init_canvas, HEX_SIDE_SIZE,} from "./game_graphics/Pixi.js";
import Unit from "./game_graphics/Unit/Unit.js";
import {Node} from "./game_graphics/Node.js";
import {show_city_menu, show_modal} from "./UI_logic.js";

// singleton
export namespace ClientSocket {
    export const response_types: { ALL_RESPONSE: string; MAP_RESPONSE: string; UNIT_MOVED_RESPONSE: string; UNITS_RESPONSE: string; UNIT_RESPONSE: string; MENU_INFO_RESPONSE: string; HARVEST_NODE_RESPONSE: string; ENEMY_UNIT_MOVED_RESPONSE: string; NEW_CITY: string; CANNOT_SETTLE: string; STARS_DATA_RESPONSE: string; INVALID_MOVE_RESPONSE: string; ENEMY_UNIT_DISAPPEARED: string, INSUFFICIENT_FUNDS_RESPONSE: string } = {
        // game play
        MAP_RESPONSE: "MAP_RESPONSE",
        UNITS_RESPONSE: "UNITS_RESPONSE",
        UNIT_RESPONSE: "UNIT_RESPONSE",
        ALL_RESPONSE: "ALL_RESPONSE",
        UNIT_MOVED_RESPONSE: "UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_MOVED_RESPONSE: "ENEMY_UNIT_MOVED_RESPONSE",
        ENEMY_UNIT_DISAPPEARED: "ENEMY_UNIT_DISAPPEARED",

        NEW_CITY: "NEW_CITY",
        CANNOT_SETTLE: "CANNOT_SETTLE",

        STARS_DATA_RESPONSE: "STARS_DATA_RESPONSE",

        MENU_INFO_RESPONSE: "MENU_INFO_RESPONSE",

        HARVEST_NODE_RESPONSE: "HARVEST_NODE_RESPONSE",

        INVALID_MOVE_RESPONSE: "INVALID_MOVE_RESPONSE",
        INSUFFICIENT_FUNDS_RESPONSE: "INSUFFICIENT_FUNDS_RESPONSE"

    };
    export const request_types:{readonly GET_MAP: string, readonly GET_UNITS: string, readonly GET_ALL: string,
                            readonly GET_MENU_INFO: string, GET_STARS_DATA: string, readonly PRODUCE_UNIT: string, readonly HARVEST_NODE: string,
                            readonly MOVE_UNITS: string, readonly SETTLE: string,readonly FIND_1v1_OPPONENT: string,
                            readonly FIND_2v2_OPPONENTS: string } = {
        // game play
        GET_MAP: "GET_MAP",
        GET_UNITS: "GET_UNITS",
        GET_ALL: "GET_ALL",
        GET_MENU_INFO: "GET_MENU_INFO",
        GET_STARS_DATA: "GET_STARS_DATA",

        PRODUCE_UNIT: "PRODUCE_UNIT",
        HARVEST_NODE: "HARVEST_NODE",
        MOVE_UNITS: "MOVE_UNITS",
        SETTLE: "SETTLE",
        // match making
        FIND_1v1_OPPONENT: "FIND_1v1_OPPONENT",
        FIND_2v2_OPPONENTS: "FIND_2v2_OPPONENTS",
    };

    // local host setup
    // @ts-ignore
    export let socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("ws://localhost:3000", {transports: ['websocket']});

    let localhost = true;
    let is_connected = false;

    export function connect(){
        // if(!localhost || !is_connected) {
        //     console.log("connected");
        //     // @ts-ignore
        //     socket
        //     is_connected = true;
        // }
    }

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
                        reset_units()

                        let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, true);
                        all_units.push(graphics_unit);
                        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
                    }
                    break;

                case ClientSocket.response_types.UNIT_RESPONSE:
                    let graphics_unit: Unit = new Unit(response_data.unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, true);
                    all_units.push(graphics_unit);
                    Node.all_nodes[response_data.unit.y][response_data.unit.x].unit = graphics_unit;

                    let total_owned_stars = response_data.total_owned_stars;
                    if(total_owned_stars != null){
                        set_total_owned_stars(total_owned_stars);
                    }

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
                        row.push(new Node(node.x, node.y, node.id, node.type, node.borders, node.city, node.sprite_name, node.harvest_cost, node.production_stars, node.is_harvested));
                    }
                    Node.all_nodes.push(row);

                    // get star data after game setup is initialized
                    ClientSocket.get_data(ClientSocket.request_types.GET_STARS_DATA, <string>localStorage.getItem("game_token"), player_token)

                    break;

                case ClientSocket.response_types.MENU_INFO_RESPONSE:
                    show_city_menu(response_data.city);
                    break;

                // deal with sever UNIT_MOVED response
                case ClientSocket.response_types.UNIT_MOVED_RESPONSE:
                    let found_unit = false;

                    if(all_units == null){
                        return;
                    }

                    // update nodes
                    response_data.nodes.map( (node: any) => {
                        Node.all_nodes[node.y][node.x].set_type(node.type, node.city, node.sprite_name);
                    });

                    // find the unit in question
                    all_units.map((unit: any)=>{
                        if(unit.id === response_data.unit.id){
                            found_unit = true;
                            unit.move_to(response_data.unit.x, response_data.unit.y);
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

                    all_enemy_visible_units.map((enemy_visible_unit: Unit)=>{
                        if(enemy_visible_unit.id === response_data.unit.id){
                            found_enemy_unit = true;
                            enemy_visible_unit.move_to(response_data.unit.x, response_data.unit.y);
                        }
                    })

                    if(!found_enemy_unit){

                        let graphics_enemy_unit: Unit | undefined;

                        // get the correct sprite for unit depending on it's type
                        if(response_data.unit.type === Unit.MELEE){
                            graphics_enemy_unit = new Unit(response_data.unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, false);
                        }
                        else if(response_data.unit.type === Unit.RANGE){
                            graphics_enemy_unit = new Unit(response_data.unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, false);
                        }

                        if(graphics_enemy_unit == null){
                            return;
                        }

                        all_enemy_visible_units.push(graphics_enemy_unit);
                        Node.all_nodes[response_data.unit.y][response_data.unit.x].unit = graphics_enemy_unit;
                    }

                    break;


                case ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED:
                    let index = 0;
                    for (; index < all_enemy_visible_units.length; index++) {
                        if(all_enemy_visible_units[index].id === response_data.unit.id) break
                    }
                    const enemy_unit = all_enemy_visible_units[index];
                    // remove unit
                    enemy_unit.remove_sprite();
                    Node.all_nodes[enemy_unit.y][enemy_unit.x].unit = null;
                    all_enemy_visible_units.splice(index);

                    break;

                case ClientSocket.response_types.NEW_CITY:
                    Node.all_nodes[response_data.city_y][response_data.city_x].set_type(Node.CITY, response_data.city_node.city, response_data.city_node.sprite_name);
                    Node.all_nodes[response_data.city_y][response_data.city_x].remove_unit();
                    break;

                case ClientSocket.response_types.CANNOT_SETTLE:
                    // TODO custom alarm
                    console.log("Cannot settle");
                    break;

                case ClientSocket.response_types.STARS_DATA_RESPONSE:
                    setup_star_production(response_data);
                    break;

                case ClientSocket.response_types.INSUFFICIENT_FUNDS_RESPONSE:
                    console.log("here")
                    show_modal(response_data.title, response_data.message, "w3-red");
                    break;

                case ClientSocket.response_types.HARVEST_NODE_RESPONSE:
                    setup_star_production(response_data);
                    // update node to show that it is harvested
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
}