import Technology from "./Technology/Technology";

import MapInterface from "../Interfaces/Map/MapInterface";
import PlayerInterface from "../Interfaces/PlayerInterface";
import UnitInterface from "../Interfaces/Units/UnitInterface";
import {Utils} from "./Utils";
import Unit from "./Units/Unit";

class Player implements PlayerInterface {
    token: string;
    map_size: number;
    units: UnitInterface[];
    production_units: any[];

    root_tech_tree_node: Technology;
    total_owned_stars: number;
    // stars per a minute
    star_production: number;

    owned_technology: String[];

    star_production_has_started: boolean;

    mountain_harvest;
    forest_harvest;

    constructor(token: string, map_size: number) {
        this.token = token;
        this.map_size = map_size;

        this.units = [];
        // units that this player can produce
        this.production_units = [Utils.WARRIOR, Utils.SLINGER, Utils.SETTLER_UNIT];

        this.total_owned_stars = 100;
        this.star_production = 10;

        this.star_production_has_started = false;

        this.owned_technology = [];
        this.root_tech_tree_node = Technology.init_tech_tree();

        this.mountain_harvest = 0;
        this.forest_harvest = 0;
    }

    addUnit(x: number, y: number, name: string, map: MapInterface): UnitInterface {
        let new_unit: any;
        switch (name) {
            case Utils.WARRIOR.name:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.WARRIOR);
                break

            case Utils.SPEARMAN.name:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.SPEARMAN);
                break;

            case Utils.SLINGER.name:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.SLINGER);
                break;

            case Utils.ARCHER.name:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.ARCHER);
                break;

            case Utils.HORSEMAN.name:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.HORSEMAN);
                break;

            case Utils.UNIT_TYPES.SETTLER:
                new_unit = new Unit(x, y, Math.random().toString(), map, Utils.SETTLER_UNIT);
                break;

        }
        this.units.push(new_unit);
        return new_unit;
    }

    getUnit(id: string): UnitInterface | undefined {
        for (const unit of this.units) {
            if (unit.getId() === id) return unit;
        }
    }

    ownsThisUnit(id: string): boolean {
        return this.getUnit(id) != null;
    }

    // returns true if the unit was successfully removed; false if not
    removeUnit(id: string, map: MapInterface): boolean {
        let remove_unit: UnitInterface | undefined = this.getUnit(id);
        if (remove_unit == null) {
            return false;
        }
        this.units.splice(this.units.indexOf(remove_unit), 1);
        map.all_nodes[remove_unit.y][remove_unit.x].unit = null;

        return true;
    }

    getUnitType(id: string): string | undefined {
        return this.getUnit(id)?.type;
    }

    // used to send simplified unit data structure threw socket.io
    getUnitData(): UnitInterface[] {
        let all_unit_data: UnitInterface[] = [];
        for (const unit of this.units) {
            const unit_data = unit.getData();
            if (unit_data == undefined) continue;
            all_unit_data.push(<UnitInterface>unit_data);
        }
        return all_unit_data;

    }

    attackUnit(unit_friendly: UnitInterface, unit_enemy: UnitInterface, enemy_player: Player, map: MapInterface): boolean[] {

        if (unit_friendly.type !== Utils.UNIT_TYPES.RANGE) {
            unit_friendly.health -= unit_enemy.attack;
        }


        unit_enemy.health -= unit_friendly.attack;


        const friendly_died = unit_friendly.health <= 0;
        const enemy_died = unit_enemy.health <= 0;

        if (friendly_died) {
            this.removeUnit(unit_friendly.id, map);
        }
        if (enemy_died) {
            enemy_player.removeUnit(unit_enemy.id, map)
        }

        return [friendly_died, enemy_died];
    }

    // The client and server run two separate timers to produce stars
    // this eliminates otherwise necessary server-client communication (the server would have to constantly update the client stars)
    produceStars() {
        setInterval(() => {
            this.total_owned_stars += this.star_production / 120;
        }, 500);

        this.star_production_has_started = true;
    }

    isPaymentValid(payment: number): boolean {
        return this.total_owned_stars - payment >= 0;
    }


    payStars(payment: number) {
        this.total_owned_stars -= payment;
    }

    increaseProduction(star_increment: number) {
        this.star_production += star_increment;
    }

    getData() {
        return {
            // units that this player can produce
            production_unit_types: this.production_units,
        }
    }
}

export default Player;