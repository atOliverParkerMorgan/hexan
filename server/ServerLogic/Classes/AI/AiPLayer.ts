import PlayerInterface from "../../Interfaces/PlayerInterface";
import MapInterface from "../../Interfaces/Map/MapInterface";
import UnitInterface from "../../Interfaces/Units/UnitInterface";
import NodeInterface from "../../Interfaces/Map/NodeInterface";

class AiPLayer {

    // constants
    static ATTACK_STRATEGY_CONST: number = 0.1;
    static EXPLORE_STRATEGY_CONST: number = 0.1;
    static DEVELOP_STRATEGY_CONST: number = 0.1;
    static CONSCRIPT_STRATEGY_CONST: number = 0.1;


    player: PlayerInterface;
    are_all_nodes_searched: boolean;
    number_enemy_cities_found: number;

    enemy_city_cords: number[][];
    constructor(player: PlayerInterface) {
        this.player = player;
        this.are_all_nodes_searched = false;
        this.number_enemy_cities_found = 0;
        this.enemy_city_cords = []
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
        let number_hidden_nodes = map_state.getNumberOfHiddenNodes(this.player.token);
        return map_state.getNumberOfHiddenNodes(this.player.token) * AiPLayer.EXPLORE_STRATEGY_CONST;
    }

    developStrategyScore(map_state: MapInterface){
        return AiPLayer.DEVELOP_STRATEGY_CONST / this.player.star_production;
    }

    conscriptStrategyScore(map_state: MapInterface){
        return AiPLayer.CONSCRIPT_STRATEGY_CONST / this.player.units.length;
    }

    attackStrategy(){

    }

    economicStrategy(){

    }

    exploreStrategy(map: MapInterface){

        if(this.are_all_nodes_searched){
            return
        }

        // get closest node
        let closest_distance = Number.MAX_VALUE;
        let closest_node_hidden;

        // you must have at least one unit
        this.player.units.map((unit: UnitInterface)=>{
            
            let closest_node_hidden = unit.getClosestHiddenNode(map, this.player);
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