"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
const Technology_1 = __importDefault(require("../Technology/Technology"));
class AiPlayerLogic {
    constructor(player_ai, game_instance, socket) {
        this.player_ai = player_ai;
        this.game = game_instance;
        this.enemy_player = this.game.getEnemyPlayers(this.player_ai.token)[0];
        this.are_all_nodes_searched = false;
        this.number_enemy_cities_found = 0;
        this.enemy_city_cords = [];
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
        let number_hidden_nodes = map_state.getNumberOfHiddenNodes(this.player_ai.token);
        return map_state.getNumberOfHiddenNodes(this.player_ai.token) * AiPlayerLogic.EXPLORE_STRATEGY_CONST;
    }
    developStrategyScore(map_state) {
        return AiPlayerLogic.DEVELOP_STRATEGY_CONST / this.player_ai.star_production;
    }
    conscriptStrategyScore(map_state) {
        return AiPlayerLogic.CONSCRIPT_STRATEGY_CONST / this.player_ai.units.length;
    }
    attackStrategy() {
    }
    economicStrategy(command) {
        // buy ship building
        switch (command) {
            case AiPlayerLogic.COMMANDS.ECONOMIC.DO_NOTHING:
                return;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_ARCHER_TECH:
                if (!this.player_ai.owned_technology.includes(Technology_1.default.ARCHERY)) {
                    this.game.purchaseTechnology(this.player_ai.token, Technology_1.default.ARCHERY);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_SHIPPING_TECH:
                if (!this.player_ai.owned_technology.includes(Technology_1.default.SHIP_BUILDING)) {
                    this.game.purchaseTechnology(this.player_ai.token, Technology_1.default.SHIP_BUILDING);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_MINING_TECH:
                if (!this.player_ai.owned_technology.includes(Technology_1.default.MINING)) {
                    this.game.purchaseTechnology(this.player_ai.token, Technology_1.default.MINING);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_CONSTRUCTION_TECH:
                if (!this.player_ai.owned_technology.includes(Technology_1.default.CONSTRUCTION)) {
                    this.game.purchaseTechnology(this.player_ai.token, Technology_1.default.CONSTRUCTION);
                }
                break;
            case AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_SPEARMAN_TECH:
                if (!this.player_ai.owned_technology.includes(Technology_1.default.SPEARMAN)) {
                    this.game.purchaseTechnology(this.player_ai.token, Technology_1.default.SPEARMAN);
                }
                break;
        }
        // command includes city_name
        if (command.includes(AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_UNIT)) {
            const city_name = AiPlayerLogic.COMMANDS.ECONOMIC.CITY_NAME;
            const city = this.game.getCity(city_name, this.player_ai);
            if (city == null) {
                return;
            }
            city.produceUnitAndSendResponse(this.socket, Utils_1.Utils.UNIT_TYPES.MELEE, this.game);
        }
        // command includes city_name
        if (command.includes(AiPlayerLogic.COMMANDS.ECONOMIC.PURCHASE_NODE)) {
            const city_name = AiPlayerLogic.COMMANDS.ECONOMIC.CITY_NAME;
            const city = this.game.getCity(city_name, this.player_ai);
            if (city == null) {
                return;
            }
            if (city.can_be_harvested_nodes.length === 0) {
                return;
            }
            const harvest_node = city.can_be_harvested_nodes[0];
            if (this.player_ai.isPaymentValid(harvest_node.harvest_cost)) {
                this.player_ai.payStars(harvest_node.harvest_cost);
                // increase production with technologies
                let production_stars = harvest_node.production_stars;
                if (harvest_node.type === Utils_1.Utils.MOUNTAIN) {
                    production_stars += this.player_ai.mountain_harvest;
                }
                else if (harvest_node.type === Utils_1.Utils.FOREST) {
                    production_stars += this.player_ai.forest_harvest;
                }
                this.player_ai.increaseProduction(production_stars);
                harvest_node.is_harvested = true;
                city.addHarvestedNode(harvest_node);
                city.updateHarvestedNodes();
            }
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
        this.player_ai.units.map((unit) => {
            let closest_node_hidden = unit.getClosestHiddenNode(map, this.player_ai);
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
exports.default = AiPlayerLogic;
// constants
AiPlayerLogic.ATTACK_STRATEGY_CONST = 0.1;
AiPlayerLogic.EXPLORE_STRATEGY_CONST = 0.1;
AiPlayerLogic.DEVELOP_STRATEGY_CONST = 0.1;
AiPlayerLogic.CONSCRIPT_STRATEGY_CONST = 0.1;
