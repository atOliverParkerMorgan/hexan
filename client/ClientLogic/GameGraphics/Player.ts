import Unit from "./Unit/Unit.js";
import {updateProgressBar, updateStarInfo} from "../UiLogic.js";
import {Interval} from "./Interval.js";
import {Node} from "./Node.js";
import {HEX_SIDE_SIZE} from "./Pixi.js";
import {City} from "./City/City.js";

//singleton client-player
export namespace Player {
    // units
    export let all_units: Unit[] = [];
    export let all_enemy_visible_units: Unit[] = [];
    export let all_cities: City[] = [];

    // player star production
    let total_owned_stars: number = 0;
    let star_production: number = 0;

    export let production_units: any[] = [];
    export let owned_technologies: string[] = [];

    export function containsCity(city_name: String): boolean{
        for (const city of all_cities) {
            if(city.name === city_name) return true
        }
        return false;
    }

    // player star logic
    export function produceStars() {
        Interval.makeStarProductionInterval(() => {
            total_owned_stars += star_production / 120;
            updateStarInfo(Math.floor(total_owned_stars));

        }, 500); // update every half second

        // update star production bar
        Interval.makeUpdateProgressBarInterval(() => {
            updateProgressBar(total_owned_stars);

        }, 50);
    }


    export function updateUnitsAfterAttack(unit_data: UnitData){

        all_units.map((unit)=>{
            if(unit.id === unit_data.id){
                unit.health = unit_data.health
                unit.updateUnitOnStage();
            }
        })
        all_enemy_visible_units.map((enemy_unit)=>{
            if(enemy_unit.id === unit_data.id){
                enemy_unit.health = unit_data.health
                enemy_unit.updateUnitOnStage();
            }
        })

    }

    export function setupStarProduction(data: any) {
        total_owned_stars = data.total_owned_stars;
        star_production = data.star_production;

        updateStarInfo(total_owned_stars, star_production);

        // check if the intervals haven't been already added
        produceStars();

    }

    export function setTotalOwnedStars(new_total_owned_stars: number) {
        total_owned_stars = new_total_owned_stars;
    }

    export function resetUnits() {
        all_units = [];
    }

    export function hasFriendlyUnit(unit_id: string):boolean{
        for (const unit of Player.all_units) {
            if(unit_id === unit.id) return true
        }
        return false;
    }


    export function hasEnemyUnit(unit_id: string):boolean{
        for (const enemy_unit of Player.all_enemy_visible_units) {
            if(unit_id === enemy_unit.id) return true
        }
        return false;
    }

    export function getUnit(id: string){
        let index = 0;
        for (; index < Player.all_units.length; index++) {
            if(Player.all_units[index].id === id) break
        }

        if(index === Player.all_units.length) return null
        return Player.all_units[index];
    }

    export function getEnemyVisibleUnit(id: string){
        let index = 0;
        for (; index < Player.all_enemy_visible_units.length; index++) {
            if(Player.all_enemy_visible_units[index].id === id) break
        }

        if(index === Player.all_enemy_visible_units.length) return null
        return Player.all_enemy_visible_units[index];
    }

    export function deleteEnemyVisibleUnit(unit: any){
        if(!Player.hasEnemyUnit(unit.id)) return;

        const enemy_unit = Player.getEnemyVisibleUnit(unit.id);
        if(enemy_unit == null) return

        Node.all_nodes[enemy_unit.y][enemy_unit.x].removeUnit()

        Player.all_enemy_visible_units.splice(Player.all_enemy_visible_units.indexOf(enemy_unit), 1);

    }

    export function deleteFriendlyUnit(unit: any){
        if(!Player.hasFriendlyUnit(unit.id)) return;

        const friendly_unit = getUnit(unit.id);
        if(friendly_unit == null) return

        Node.all_nodes[friendly_unit.y][friendly_unit.x].removeUnit();

        Player.all_units.splice(Player.all_units.indexOf(friendly_unit), 1);
    }

    export function addEnemyUnit(unit: any){
        let graphics_enemy_unit: Unit =  new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE* .75, false);

        Player.all_enemy_visible_units.push(graphics_enemy_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_enemy_unit;
    }

    export function addUnit(unit: any) {
        let graphics_unit: Unit = new Unit(unit, HEX_SIDE_SIZE * .75, HEX_SIDE_SIZE * .75, true);

        Player.all_units.push(graphics_unit);
        Node.all_nodes[unit.y][unit.x].unit = graphics_unit;
    }

    export function updateTotalNumberOfStars(response_data: any){
        let total_owned_stars = response_data.total_owned_stars;
        if(total_owned_stars != null){
            setTotalOwnedStars(total_owned_stars);
        }
    }

    export function getTotalNumberOfStars(){
        return total_owned_stars;
    }

}
