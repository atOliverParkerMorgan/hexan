

import TechnologyInterface from "../../Interfaces/Technology/TechnologyInterface";
import PlayerInterface from "../../Interfaces/PlayerInterface";
import {Utils} from "../Utils";



export default class Technology implements TechnologyInterface {
    children: Technology[] | null;
    name: string;
    image: string;
    description: string;
    cost: number;
    is_owned: boolean

    static MINING = "Mining";
    static SHIP_BUILDING = "Ship Building";
    static CONSTRUCTION = "Construction";
    static ARCHERY = "Archery";
    static SPEARMAN = "Spearman";
    static HORSEMAN = "Horseman";

    constructor(children: Technology[] | null, name: string, image: string, description: string, cost: number, is_owned: boolean) {
        this.children = children;
        this.name = name;
        this.image = image;
        this.description = description;
        this.cost = cost;
        this.is_owned = is_owned;
    }

    // creates a link list of all technologies
    static initTechTree(): Technology{
        const mining = new Technology(null, Technology.MINING, "", "Add an additional 1 star production per minute on harvested mountains", 10, false)

        const ship_building = new Technology(null, Technology.SHIP_BUILDING, "", "Unlock the ability to build battle ship \n and to move on ocean tiles", 10, false)
        const construction = new Technology(null, Technology.CONSTRUCTION, "", "Enables the construction of walls and keeps. \n It also allow to extract production from forests", 10, false)

        const archery = new Technology([construction], Technology.ARCHERY, "/images/archer.png", "Unlocks new range unit: Archers \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false)
        const spearman = new Technology([mining], Technology.SPEARMAN, "", "Unlocks new melee unit: Spearman \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false)
        const horseman = new Technology(null, Technology.HORSEMAN, "", "Unlocks new cavalry unit: Horseman \n(attack: 15; health: 100; range: 2; cost: 5) ", 10, false)

        return new Technology([archery, spearman, horseman, ship_building], "", "/images/king.png", "", 0, true);
    }

    // works only on root node!
    static purchase(node: Technology, tech_name: string, player: PlayerInterface): boolean{
        console.log(node.name)
        if(node.name === tech_name) {
            // purchase technology
            if (node.cost <= player.total_owned_stars) {
                player.total_owned_stars -= node.cost;
                node.is_owned = true;
                player.owned_technology.push(tech_name);

                // technology special logic
                if(tech_name === Technology.ARCHERY){
                    player.production_units.push(Utils.ARCHER);
                }else if(tech_name === Technology.HORSEMAN){
                    player.production_units.push(Utils.HORSEMAN);
                }else if(tech_name === Technology.SPEARMAN){
                    player.production_units.push(Utils.SPEARMAN);
                }else if(tech_name === Technology.MINING){
                    player.mountain_harvest = 1;
                }else if(tech_name === Technology.CONSTRUCTION){
                    player.forest_harvest = 1;
                }


                return true;
            }

            return false;
        }
        else if(node.children == null) return false
        else if(!node.is_owned) return false;

        const outputs: boolean[] = node.children.map((child_node: Technology)=>{
            return Technology.purchase(child_node, tech_name, player)
        });

        for (const output of outputs) {
            if(output) return true;
        }

        return false;

    }
}
