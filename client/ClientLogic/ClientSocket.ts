import {Player} from "./GameGraphics/Player.js"
import {initCanvas, HEX_SIDE_SIZE, setupTechTree, initGame, updateBoard,} from "./GameGraphics/Pixi.js";
import Unit from "./GameGraphics/Unit/Unit.js";
import {Node} from "./GameGraphics/Node.js";
import {gameOver, showCityMenu, showModal} from "./UiLogic.js";
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
    export function sendData(request: string , data: any): void{
       // console.log(request);

        data.player_token = localStorage.player_token;
        data.game_token = localStorage.game_token;

        ClientSocket.socket.emit(request, data);
    }

    export function addDataListener(): void{
        socket.on(ClientSocket.response_types.ALL_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.ALL_RESPONSE);

            updateBoard(args);
        })

        socket.on(ClientSocket.response_types.FOUND_GAME_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.FOUND_GAME_RESPONSE);

            const response_data = args[0];
            initGame(socket.id, response_data.game_token);
        })

        socket.on(ClientSocket.response_types.MENU_INFO_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.MENU_INFO_RESPONSE);

            const response_data = args[0];
            // update production info
            Player.production_units = response_data.production_units;
            showCityMenu(response_data.city_data);
        })

        socket.on(ClientSocket.response_types.UNITS_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.UNITS_RESPONSE);
            const response_data = args[0];
            for(let unit of response_data.units){
                unit = <UnitData> unit;
                Player.resetUnits()

                let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, true);
                Player.all_units.push(graphics_unit);
                Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
            }
        })

        socket.on(ClientSocket.response_types.UNIT_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.UNIT_RESPONSE);
            const response_data = args[0];
            if(Node.all_nodes[response_data.unit.y][response_data.unit.x].city?.is_friendly){
                Player.addUnit(response_data.unit);
                Player.updateTotalNumberOfStars(response_data);
            }else{
                Player.addEnemyUnit(response_data.unit);
                Node.all_nodes[response_data.unit.y][response_data.unit.x].update()
            }
        })

        socket.on(ClientSocket.response_types.UNIT_MOVED_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.UNIT_MOVED_RESPONSE);

            const response_data = args[0];

            if(Player.all_units == null || !Player.hasFriendlyUnit(response_data.unit.id)){
                return;
            }

            // update nodes
            response_data.nodes.map( (node: any) => {
                if(node.type != null) {
                    Node.all_nodes[node.y][node.x].setType(node.type, node.sprite_name);
                }else if(node.city_data != null){
                    Node.all_nodes[node.y][node.x].setCity(node.city_data, node.sprite_name);
                }
            });

            // find the unit in question
            if(!moveUnit(response_data.unit)){
                console.error("Error, something has gone wrong with the sever public communication")
            }
        })

        socket.on(ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.ENEMY_UNIT_MOVED_RESPONSE);

            const response_data = args[0];

            if(!moveEnemyUnits(response_data.unit)){
                Player.addEnemyUnit(response_data.unit);
            }
        })

        socket.on(ClientSocket.response_types.ENEMY_FOUND_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.ENEMY_FOUND_RESPONSE);


            const response_data = args[0];
            Player.addEnemyUnit(response_data.unit);
        })

        socket.on(ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED, (...args: any[]) => {
            console.log(ClientSocket.response_types.ENEMY_UNIT_DISAPPEARED);

            const response_data = args[0];
            Player.deleteEnemyVisibleUnit(response_data.unit)
        })

        socket.on(ClientSocket.response_types.HARVEST_COST_RESPONSE, (...args: any[]) => {
            console.log(ClientSocket.response_types.HARVEST_COST_RESPONSE);

            const response_data = args[0];
            for (const cords of response_data.node_cords) {
                Node.all_nodes[cords[1]][cords[0]].harvest_cost = response_data.harvest_cost;
            }
        })

        socket.on(ClientSocket.response_types.NEW_CITY, (...args: any[]) => {
            console.log(ClientSocket.response_types.NEW_CITY);
            const response_data = args[0];
            const current_node: Node = Node.all_nodes[response_data.city_y][response_data.city_x];
            current_node.setCity(response_data.city_node.city_data, response_data.city_node.sprite_name);

            for(const neighbour of current_node.getNeighbours()){
                if(neighbour != null){
                    neighbour.update();
                }
            }

            Player.deleteFriendlyUnit(current_node.unit)
        })


        socket.on(ClientSocket.response_types.ATTACK_UNIT_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            console.log(ClientSocket.response_types.ATTACK_UNIT_RESPONSE);
            // updates unit graphics after attack
            if(response_data.is_unit_1_dead) {
                Player.deleteFriendlyUnit(response_data.unit_1);
                Player.deleteEnemyVisibleUnit(response_data.unit_1);
            }
            else{
                Player.updateUnitsAfterAttack(response_data.unit_1);
            }

            if(response_data.is_unit_2_dead) {
                Player.deleteFriendlyUnit(response_data.unit_2);
                Player.deleteEnemyVisibleUnit(response_data.unit_2);
            }
            else{
                Player.updateUnitsAfterAttack(response_data.unit_2);
            }

            Node.printGame();
        })

        socket.on(ClientSocket.response_types.STARS_DATA_RESPONSE, (...args: any[]) => {
            const response_data = args[0];
            Player.setupStarProduction(response_data);
        })

        socket.on(ClientSocket.response_types.SOMETHING_WRONG_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            showModal(response_data.title, response_data.message, "w3-red");
        })

        socket.on(ClientSocket.response_types.PURCHASED_TECHNOLOGY_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            setupTechTree(response_data.root_tech_tree_node);
            Player.updateTotalNumberOfStars(response_data);
        })

        socket.on(ClientSocket.response_types.HARVEST_NODE_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            // update node to show that it is harvested
            Player.setupStarProduction(response_data);

            (<HTMLInputElement>document.getElementById("harvest_button")).style.visibility = "hidden";

            const node = Node.all_nodes[response_data.node.y][response_data.node.x];
            node.is_harvested = response_data.node.is_harvested;
            node.update();

            for (const neighbor of node.getNeighbours()) {
                neighbor?.update();
            }
        })

        socket.on(ClientSocket.response_types.CONQUERED_CITY_RESPONSE, (...args: any[]) => {
            const response_data = args[0];


            // if player conquered a city
            const city_node: Node = Node.all_nodes[response_data.city.y][response_data.city.x];

            city_node.city.is_friendly = response_data.city.is_friendly;
            city_node.update();

            for (const neighbour of city_node.getNeighbours()) {
                neighbour?.update();
            }

            if(city_node.city.is_friendly){
                moveUnit(response_data.unit);
            }else{
                moveEnemyUnits(response_data.unit);
            }

        })

        socket.on(ClientSocket.response_types.END_GAME_RESPONSE, (...args: any[]) => {
            const response_data = args[0];

            if(response_data.won) {
                gameOver("YOU WON!", "Congrats annihilate all your enemies and won!", "w3-green");
            }else{
                gameOver("YOU LOST!", "Oh no you got recked and lost better luck next time!",  "w3-red");
            }
        })
    }

    // return if unit move was valid
    function moveUnit(response_unit: Unit): boolean{
        // find the unit in question
        for (const unit of Player.all_units) {
            if(unit.id === response_unit.id){
                // transform unit into ship if on a water node
                unit.is_on_water = response_unit.is_on_water;
                unit.moveTo(response_unit.x, response_unit.y);
                return true;
            }
        }

        return false;
    }

    function moveEnemyUnits(response_unit: Unit):boolean{

        // find the unit in question
        for (const enemy_unit of Player.all_enemy_visible_units) {
            if(enemy_unit.id === response_unit.id){
                // transform unit into ship if on a water node
                enemy_unit.is_on_water = response_unit.is_on_water;
                enemy_unit.moveTo(response_unit.x, response_unit.y);
                return true;
            }
        }
        return false;
    }

    export function requestProduction(unit_name: string) {
        ClientSocket.sendData(ClientSocket.request_types.PRODUCE_UNIT,
          {
                unit_type: unit_name,
                city_name: (<HTMLInputElement>document.getElementById("city_name")).textContent
            })
    }

    export function requestUnitAction(unit: Unit){
        ClientSocket.sendData(ClientSocket.request_types.SETTLE,
           {
                x: unit.x,
                y: unit.y,
                id: unit.id,
            })
    }

    export function requestHarvest(node_x: number, node_y: number){
        ClientSocket.sendData( ClientSocket.request_types.HARVEST_NODE,
            {
                node_x: node_x,
                node_y: node_y,
            })
    }

    export function requestBuyTechnology(tech_name: string){
        ClientSocket.sendData(ClientSocket.request_types.PURCHASE_TECHNOLOGY,
            {
                tech_name: tech_name,
            })
    }

    export function requestMoveUnit(unit: Unit | undefined, path: number[][]) {

        ClientSocket.sendData(ClientSocket.request_types.MOVE_UNITS,
            {
                unit_id: unit?.id,
                path: path
            })

        unit?.setCurrentPath(path);
    }

}