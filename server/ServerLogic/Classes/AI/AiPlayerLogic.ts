import PlayerInterface from "../../Interfaces/PlayerInterface";
import MapInterface from "../../Interfaces/Map/MapInterface";
import UnitInterface from "../../Interfaces/Units/UnitInterface";
import NodeInterface from "../../Interfaces/Map/NodeInterface";
import GameInterface from "../../Interfaces/GameInterface";
import {Utils} from "../Utils";
import Technology from "../Technology/Technology";
import CityInterface from "../../Interfaces/City/CityInterface";
import {Socket} from "socket.io";

export default class AiPlayerLogic {

    // constants
    static ATTACK_STRATEGY_CONST: number = 0.1;
    static EXPLORE_STRATEGY_CONST: number = 0.1;
    static DEVELOP_STRATEGY_CONST: number = 0.1;
    static CONSCRIPT_STRATEGY_CONST: number = 0.1;

    static COMMANDS:{
        ECONOMIC : {
            DO_NOTHING: "DO_NOTHING",
            PURCHASE_SHIPPING_TECH: "PURCHASE_SHIPPING_TECH",
            PURCHASE_ARCHER_TECH: "PURCHASE_ARCHER_TECH",
            PURCHASE_MINING_TECH: "PURCHASE_MINING_TECH",
            PURCHASE_CONSTRUCTION_TECH: "PURCHASE_CONSTRUCTION_TECH",
            PURCHASE_SPEARMAN_TECH: "PURCHASE_SPEARMAN_TECH",
            PURCHASE_HORSEMAN_TECH: "PURCHASE_HORSEMAN_TECH",
            PURCHASE_NODE: "PURCHASE_NODE",
            PURCHASE_UNIT: "PURCHASE_UNIT",
            CITY_NAME: "" // current city name

        }
        MILITARY: {
            ATTACK_CITY: "ATTACK_CITY",
            SETTLE_CITY: "SETTLE_CITY"
            DEFEND_CITY: "DEFEND_CITY"
        }
    }

    game: GameInterface;
    player_ai: PlayerInterface;
    enemy_player: PlayerInterface;
    are_all_nodes_searched: boolean;
    number_enemy_cities_found: number;

    socket: Socket;

    enemy_city_cords: number[][];
    constructor(player_ai: PlayerInterface, game_instance: GameInterface, socket: Socket) {
        this.player_ai = player_ai;
        this.game = game_instance;
        this.enemy_player = this.game.getEnemyPlayers(this.player_ai.token)[0];
        this.are_all_nodes_searched = false;
        this.number_enemy_cities_found = 0;
        this.enemy_city_cords = []

        this.socket = socket;
    }

    /*  AI logic
    The AI has 4 modes. It calculates the two most advantages modes in the current game state.
    One mode must always be from military and one economic.

    - Military
        1. Attack - attack the enemy player and try to capture their cities
        2. Explore - Explore the map

    - Economic
        3. Develop - Increase star production and settle new land
        4. Conscript - Bolster army
    */
    getNextBestMove(map_state: MapInterface){

    }

    calculateBestMilitaryStrategy(){

    }

    calculateBestEconomicStrategy(){

    }

    // get strategy score
    attackStrategyScore(map_state: MapInterface){
        return
    }

    exploreStrategyScore(map_state: MapInterface){
        let number_hidden_nodes = map_state.getNumberOfHiddenNodes(this.player_ai.token);
        return map_state.getNumberOfHiddenNodes(this.player_ai.token) * AiPlayerLogic.EXPLORE_STRATEGY_CONST;
    }

    developStrategyScore(map_state: MapInterface){
        return AiPlayerLogic.DEVELOP_STRATEGY_CONST / this.player_ai.star_production;
    }

    conscriptStrategyScore(map_state: MapInterface){
        return AiPlayerLogic.CONSCRIPT_STRATEGY_CONST / this.player_ai.units.length;
    }

    attackStrategy(){

    }

    economicStrategy(command: string){
        // buy ship building
        switch (command){
            case AiPlayerLogic.COMMANDS.ECONOMIC.DO_NOTHING:
                return;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_ARCHER_TECH:
                if(!this.player_ai.owned_technology.includes(Technology.ARCHERY)){
                    this.game.purchaseTechnology(this.player_ai.token, Technology.ARCHERY);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_SHIPPING_TECH:
                if(!this.player_ai.owned_technology.includes(Technology.SHIP_BUILDING)){
                    this.game.purchaseTechnology(this.player_ai.token, Technology.SHIP_BUILDING);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_MINING_TECH:
                if(!this.player_ai.owned_technology.includes(Technology.MINING)){
                    this.game.purchaseTechnology(this.player_ai.token, Technology.MINING);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_CONSTRUCTION_TECH:
                if(!this.player_ai.owned_technology.includes(Technology.CONSTRUCTION)){
                    this.game.purchaseTechnology(this.player_ai.token, Technology.CONSTRUCTION);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_SPEARMAN_TECH:
                if(!this.player_ai.owned_technology.includes(Technology.SPEARMAN)){
                    this.game.purchaseTechnology(this.player_ai.token, Technology.SPEARMAN);
                }
                break;
        }
        // command includes city_name
        if(command.includes(AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_UNIT)){
            const city_name =  AiPlayerLogic.COMMANDS.ECONOMIC.CITY_NAME;
            const city: CityInterface | undefined = this.game.getCity(city_name, this.player_ai);
            if(city == null){
                return;
            }

            city.produceUnitAndSendResponse(this.socket, Utils.UNIT_TYPES.MELEE, this.game);

        }

        // command includes city_name
        if(command.includes(AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_NODE)){
            const city_name = AiPlayerLogic.COMMANDS.ECONOMIC.CITY_NAME;
            const city: CityInterface | undefined = this.game.getCity(city_name, this.player_ai);
            if(city == null){
                return;
            }

            if(city.can_be_harvested_nodes.length === 0){
                return;
            }

            const harvest_node = city.can_be_harvested_nodes[0];

            if (this.player_ai.isPaymentValid(harvest_node.harvest_cost)) {
                this.player_ai.payStars(harvest_node.harvest_cost);

                // increase production with technologies
                let production_stars = harvest_node.production_stars;
                if (harvest_node.type === Utils.MOUNTAIN) {
                    production_stars += this.player_ai.mountain_harvest;
                } else if (harvest_node.type === Utils.FOREST) {
                    production_stars += this.player_ai.forest_harvest;
                }

                this.player_ai.increaseProduction(production_stars);

                harvest_node.is_harvested = true;

                city.addHarvestedNode(harvest_node)
                city.updateHarvestedNodes();
            }

        }

    }

    exploreStrategy(map: MapInterface){
        // must buy shipping technology


        if(this.are_all_nodes_searched){
            return
        }

        // get closest node
        let closest_distance = Number.MAX_VALUE;
        let closest_node_hidden;

        // you must have at least one unit
        this.player_ai.units.map((unit: UnitInterface)=>{
            
            let closest_node_hidden = unit.getClosestHiddenNode(map, this.player_ai);
            if(closest_node_hidden == null){
                this.are_all_nodes_searched = true;
                return
            }

            const current_node: NodeInterface = <NodeInterface> map.getNode(unit.x, unit.y)
            const current_distance = closest_node_hidden.getDistanceToNode(current_node)
            if(closest_distance > current_distance){
                closest_distance = current_distance;
                closest_node_hidden = current_node;
            }
        })

        console.log(closest_distance);

    }

    conscriptStrategy(){
        console.log(this)
    }

}