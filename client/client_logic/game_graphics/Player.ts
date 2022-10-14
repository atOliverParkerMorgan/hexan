import Unit from "./Unit/Unit.js";
import {update_progress_bar, update_star_info} from "../UI_logic.js";
import {Interval} from "./Interval.js";

//singleton client-player
export namespace Player {
    // units
    export let all_units: Unit[] = [];
    export let all_enemy_visible_units: Unit[] = [];

    // player star production
    let total_owned_stars: number = 0;
    let star_production: number = 0;

    export let production_unit_types: string[] = [];

    // player star logic
    export function produce_stars() {
        Interval.make_star_production_interval(() => {
            total_owned_stars += star_production / 120;
            update_star_info(Math.floor(total_owned_stars));

        }, 500); // update every half second

        // update star production bar
        Interval.make_update_progress_bar_interval(() => {
            update_progress_bar(total_owned_stars);

        }, 50);
    }


    export function update_units_after_attack(unit_data: UnitData){

        all_units.map((unit)=>{
            if(unit.id === unit_data.id){
                unit.health = unit_data.health
                unit.add_unit_to_stage();
            }
        })
        all_units.map((enemy_unit)=>{
            if(enemy_unit.id === unit_data.id){
                enemy_unit.health = unit_data.health
                enemy_unit.add_unit_to_stage();
            }
        })

    }

    export function setup_star_production(data: any) {
        total_owned_stars = data.total_owned_stars;
        star_production = data.star_production;

        update_star_info(total_owned_stars, star_production);

        // check if the intervals haven't been already added
        produce_stars();

    }

    export function set_total_owned_stars(new_total_owned_stars: number) {
        total_owned_stars = new_total_owned_stars;
    }

    export function reset_units() {
        all_units = [];
    }
}
