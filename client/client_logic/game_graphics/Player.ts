import Unit from "./Unit/Unit";
import {update_star_info} from "../UI_logic.js";

// units

export let all_units: Unit[] = [];
export let all_enemy_visible_units: Unit[] = [];

// player star production
let total_owned_stars: number = 0;
let star_production: number = 0;
let timeout_id: NodeJS.Timeout;

// player star logic
export function produce_stars(time_of_next_star_production: number){
    timeout_id = setTimeout(()=>{
        total_owned_stars++;
        update_star_info(total_owned_stars);

        let now = new Date();
        produce_stars(new Date(now.getFullYear(), now.getMonth(),now.getDate(), now.getHours(), now.getMinutes(), now.getMinutes() + 60 / star_production, 0).getTime() - Date.now());

    }, time_of_next_star_production);
}

export function setup_star_production(data: any){
    total_owned_stars = data.total_owned_stars;
    star_production = data.star_production;

    update_star_info(total_owned_stars, star_production);

    // clear current star production
    clearTimeout(timeout_id);
    produce_stars(data.time_of_next_star_production);
}


export function reset_units(){
    all_units = [];
}
