import Unit from "./Unit/Unit";
import {update_star_info} from "../UI_logic.js";

// units

export let all_units: Unit[] = [];
export let all_enemy_visible_units: Unit[] = [];

// player star production
let total_owned_stars: number = 0;
let star_production: number = 0;

// player star logic
export function produce_stars(){
    setInterval(()=>{
        console.log(total_owned_stars);
        total_owned_stars += star_production / 60;
        update_star_info(Math.floor(total_owned_stars));

    }, 1000); // update every second
}

export function setup_star_production(data: any){
    total_owned_stars = data.total_owned_stars;
    star_production = data.star_production;

    update_star_info(total_owned_stars, star_production);
    produce_stars();
}

export function set_total_owned_stars(new_total_owned_stars: number){
    total_owned_stars = new_total_owned_stars;
}

export function reset_units(){
    all_units = [];
}
