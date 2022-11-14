import Unit from "./Unit/Unit.js";
import {update_progress_bar, update_star_info} from "../UI_logic.js";
import {Interval} from "./Interval.js";
import {Node} from "./Node.js";
import {HEX_SIDE_SIZE} from "./Pixi.js";
import exp from "constants";

//singleton client-player
export namespace Player {
    // units
    export let all_units: Unit[] = [];
    export let all_enemy_visible_units: Unit[] = [];

    // player star production
    let total_owned_stars: number = 0;
    let star_production: number = 0;

    export let production_units: any[] = [];

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
                unit.update_unit_on_stage();
            }
        })
        all_enemy_visible_units.map((enemy_unit)=>{
            if(enemy_unit.id === unit_data.id){
                enemy_unit.health = unit_data.health
                enemy_unit.update_unit_on_stage();
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

    export function has_friendly_unit(unit_id: string):boolean{
        for (const unit of Player.all_units) {
            if(unit_id === unit.id) return true
        }
        return false;
    }

    export function has_enemy_unit(unit_id: string):boolean{
        for (const enemy_unit of Player.all_enemy_visible_units) {
            if(unit_id === enemy_unit.id) return true
        }
        return false;
    }

    export function delete_enemy_visible_unit(unit: any){
        if(!Player.has_enemy_unit(unit.id)) return;

        let index = 0;
        for (; index < Player.all_enemy_visible_units.length; index++) {
            if(Player.all_enemy_visible_units[index].id === unit.id) break
        }

        const enemy_unit = Player.all_enemy_visible_units[index];
        if(enemy_unit == null) return

        enemy_unit.remove_sprite();
        Node.all_nodes[enemy_unit.y][enemy_unit.x].unit = null;
        Player.all_enemy_visible_units.splice(index);

    }

    export function delete_friendly_unit(unit: any){
        if(!Player.has_friendly_unit(unit.id)) return;

        let index = 0;
        for (; index < Player.all_units.length; index++) {
            if(Player.all_units[index].id === unit.id) break
        }

        const friendly_unit = Player.all_units[index];
        if(friendly_unit == null) return

        friendly_unit.remove_sprite();
        Node.all_nodes[friendly_unit.y][friendly_unit.x].unit = null;
        Player.all_units.splice(index);
    }

    export function add_enemy_unit(unit: any){
        let graphics_enemy_unit: Unit =  new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, false);

        Player.all_enemy_visible_units.push(graphics_enemy_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_enemy_unit;
    }

    export function add_unit(unit: any) {
        let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);

        Player.all_units.push(graphics_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
    }

    export function update_total_number_of_stars(response_data: any){
        let total_owned_stars = response_data.total_owned_stars;
        if(total_owned_stars != null){
            set_total_owned_stars(total_owned_stars);
        }
    }

    export function get_total_number_of_stars(){
        return total_owned_stars;
    }

}
