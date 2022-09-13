import Unit from "./Unit/Unit.js";
import {update_progress_bar, update_star_info} from "../UI_logic.js";

//singleton client-player
export namespace Player {
    // units
    export let all_units: Unit[] = [];
    export let all_enemy_visible_units: Unit[] = [];

    // player star production
    let total_owned_stars: number = 0;
    let star_production: number = 0;

    // player star logic
    export function produce_stars() {
        setInterval(() => {
            total_owned_stars += star_production / 120;
            update_star_info(Math.floor(total_owned_stars));

        }, 500); // update every half second

        // update star production bar
        setInterval(() => {
            update_progress_bar(total_owned_stars);

        }, 50);
    }

    export function setup_star_production(data: any) {
        total_owned_stars = data.total_owned_stars;
        star_production = data.star_production;

        update_star_info(total_owned_stars, star_production);
        produce_stars();
    }

    export function set_total_owned_stars(new_total_owned_stars: number) {
        total_owned_stars = new_total_owned_stars;
    }

    export function reset_units() {
        all_units = [];
    }
}
