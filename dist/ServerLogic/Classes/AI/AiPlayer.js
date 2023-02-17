"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Technology_1 = __importDefault(require("../Technology/Technology"));
class AiPlayer {
    constructor(player, game_instance) {
        this.player = player;
        this.game_instance = game_instance;
        this.are_all_nodes_searched = false;
        this.number_enemy_cities_found = 0;
        this.enemy_city_cords = [];
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
    getNextBestMove(map_state) {
    }
    calculateBestMilitaryStrategy() {
    }
    calculateBestEconomicStrategy() {
    }
    // get strategy score
    attackStrategyScore(map_state) {
        return;
    }
    exploreStrategyScore(map_state) {
        let number_hidden_nodes = map_state.getNumberOfHiddenNodes(this.player.token);
        return map_state.getNumberOfHiddenNodes(this.player.token) * AiPlayer.EXPLORE_STRATEGY_CONST;
    }
    developStrategyScore(map_state) {
        return AiPlayer.DEVELOP_STRATEGY_CONST / this.player.star_production;
    }
    conscriptStrategyScore(map_state) {
        return AiPlayer.CONSCRIPT_STRATEGY_CONST / this.player.units.length;
    }
    attackStrategy() {
    }
    economicStrategy(command) {
        // buy ship building
        switch (command) {
            case AiPlayer.COMMANDS.ECONOMIC.DO_NOTHING:
                return;
            case AiPlayer.COMMANDS.ECONOMIC.PURCHASE_ARCHER_TECH:
                if (!this.player.owned_technology.includes(Technology_1.default.ARCHERY)) {
                    this.game_instance.purchaseTechnology(this.player.token, Technology_1.default.ARCHERY);
                }
                break;
            case AiPlayer.COMMANDS.ECONOMIC.PURCHASE_SHIPPING_TECH:
                if (!this.player.owned_technology.includes(Technology_1.default.SHIP_BUILDING)) {
                    this.game_instance.purchaseTechnology(this.player.token, Technology_1.default.SHIP_BUILDING);
                }
                break;
            case AiPlayer.COMMANDS.ECONOMIC.PURCHASE_MINING_TECH:
                if (!this.player.owned_technology.includes(Technology_1.default.MINING)) {
                    this.game_instance.purchaseTechnology(this.player.token, Technology_1.default.MINING);
                }
                break;
            case AiPlayer.COMMANDS.ECONOMIC.PURCHASE_CONSTRUCTION_TECH:
                if (!this.player.owned_technology.includes(Technology_1.default.CONSTRUCTION)) {
                    this.game_instance.purchaseTechnology(this.player.token, Technology_1.default.CONSTRUCTION);
                }
                break;
            case AiPlayer.COMMANDS.ECONOMIC.PURCHASE_SPEARMAN_TECH:
                if (!this.player.owned_technology.includes(Technology_1.default.SPEARMAN)) {
                    this.game_instance.purchaseTechnology(this.player.token, Technology_1.default.SPEARMAN);
                }
                break;
        }
    }
    exploreStrategy(map) {
        // must buy shipping technology
        if (this.are_all_nodes_searched) {
            return;
        }
        // get closest node
        let closest_distance = Number.MAX_VALUE;
        let closest_node_hidden;
        // you must have at least one unit
        this.player.units.map((unit) => {
            let closest_node_hidden = unit.getClosestHiddenNode(map, this.player);
            if (closest_node_hidden == null) {
                this.are_all_nodes_searched = true;
                return;
            }
            const current_node = map.getNode(unit.x, unit.y);
            const current_distance = closest_node_hidden.getDistanceToNode(current_node);
            if (closest_distance > current_distance) {
                closest_distance = current_distance;
                closest_node_hidden = current_node;
            }
        });
        console.log(closest_distance);
    }
    conscriptStrategy() {
        console.log(this);
    }
}
// constants
AiPlayer.ATTACK_STRATEGY_CONST = 0.1;
AiPlayer.EXPLORE_STRATEGY_CONST = 0.1;
AiPlayer.DEVELOP_STRATEGY_CONST = 0.1;
AiPlayer.CONSCRIPT_STRATEGY_CONST = 0.1;
