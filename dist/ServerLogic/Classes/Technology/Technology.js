"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
class Technology {
    constructor(children, name, image, description, cost, is_owned) {
        this.children = children;
        this.name = name;
        this.image = image;
        this.description = description;
        this.cost = cost;
        this.is_owned = is_owned;
    }
    // creates a link list of all technologies
    static init_tech_tree() {
        const mining = new Technology(null, "Mining", "", "Add an additional 1 star production per minute on harvested mountains", 10, false);
        const ship_building = new Technology(null, "Ship Building", "", "Unlock the ability to build battle ship \n and to move on ocean tiles", 10, false);
        const construction = new Technology(null, "Construction", "", "Enables the construction of walls and keeps. \n It also allow to extract production from forests", 10, false);
        const archery = new Technology([construction], "Archery", "/images/archer.png", "Unlocks new range unit: Archers \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false);
        const spearman = new Technology([mining], "Spearman", "", "Unlocks new melee unit: Spearman \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false);
        const horseman = new Technology(null, "Horseman", "", "Unlocks new cavalry unit: Horseman \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false);
        return new Technology([archery, spearman, horseman, ship_building], "", "/images/king.png", "", 0, true);
    }
    // works only on root node!
    static purchase(node, tech_name, player) {
        console.log(node.name);
        if (node.name === tech_name) {
            // purchase technology
            if (node.cost <= player.total_owned_stars) {
                player.total_owned_stars -= node.cost;
                node.is_owned = true;
                player.owned_technology.push(tech_name);
                // technology special logic
                if (tech_name === "Archery") {
                    player.production_units.push(Utils_1.Utils.ARCHER);
                }
                else if (tech_name === "Horseman") {
                    player.production_units.push(Utils_1.Utils.HORSEMAN);
                }
                else if (tech_name === "Spearman") {
                    player.production_units.push(Utils_1.Utils.SPEARMAN);
                }
                else if (tech_name === "Mining") {
                    player.mountain_harvest = 1;
                }
                else if (tech_name === "Construction") {
                    player.forest_harvest = 1;
                }
                return true;
            }
            return false;
        }
        else if (node.children == null)
            return false;
        else if (!node.is_owned)
            return false;
        const outputs = node.children.map((child_node) => {
            return Technology.purchase(child_node, tech_name, player);
        });
        for (const output of outputs) {
            if (output)
                return true;
        }
        return false;
    }
}
exports.default = Technology;
