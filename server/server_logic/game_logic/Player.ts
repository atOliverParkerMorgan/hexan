// const {Unit} = require("./Units/Unit.ts");
import {Unit} from "./Units/Unit";

import Melee from "./Units/Melee";
import Range from "./Units/Range";
import Cavalry from "./Units/Cavalry";
import Settler from "./Units/Settler";
import Map from "./Map/Map";
import {Technology} from "./Technology/Technology";


class Player{
    token: string;
    units: Unit[];
    production_unit_types: string[];

    root_tech_tree_node: Technology;
    total_owned_stars: number;
    // stars per a minute
    star_production: number;

    star_production_has_started: boolean;

    constructor(token: string) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_unit_types = [Unit.MELEE, Unit.RANGE, Unit.SETTLER];

        this.total_owned_stars = 10;
        this.star_production = 5;

        this.star_production_has_started = false;

        this.root_tech_tree_node = Technology.init_tech_tree();
    }

    add_unit(x: number, y: number, name: string, map: Map): Unit{
        let new_unit: any;
        switch (name){
            case Melee.WARRIOR.name:
                new_unit = new Melee(x, y, Math.random().toString(), map, Melee.WARRIOR);
                break;
            case Range.SLINGER.name:
                new_unit = new Range(x, y, Math.random().toString(), map, Range.SLINGER, );
                break;

            case Cavalry.HORSEMAN.name:
                new_unit = new Cavalry(x, y, Math.random().toString(), map, Cavalry.HORSEMAN);
                break;

            case Unit.SETTLER:
                new_unit = new Settler(x, y, Math.random().toString(), map);
                break;

        }
        this.units.push(new_unit);
        return new_unit;
    }

    get_unit(id: string): Unit | undefined {
        for (const unit of this.units) {
            if(unit.get_id() === id) return unit;
        }
    }

    owns_this_unit(id: string):boolean{
        return this.get_unit(id) != null;
    }

    // returns true if the unit was successfully removed; false if not
    remove_unit(id: string): boolean{
        let remove_unit: Unit | undefined = this.get_unit(id);
        if(remove_unit == null){
            return false;
        }
        this.units.splice(this.units.indexOf(remove_unit));

        return true;
    }

    get_unit_type(id: string): string | undefined{
        return this.get_unit(id)?.type;
    }

    // used to send simplified unit data structure threw socket.io
    get_unit_data(): Unit[]{
        let all_unit_data: Unit[] = [];
        for(const unit of this.units){
            const unit_data = unit.get_data();
            if(unit_data == undefined) continue;
            all_unit_data.push(<Unit> unit_data);
        }
        return all_unit_data;

    }

    attack_unit(unit_friendly: Unit, unit_enemy: Unit, enemy_player: Player, map: Map): boolean[]{

        if(unit_friendly.type !== Unit.RANGE) {
            unit_friendly.health -= unit_enemy.attack;
        }


        unit_enemy.health -= unit_friendly.attack;


        const friendly_died = unit_friendly.health <= 0;
        const enemy_died = unit_enemy.health <= 0;

        if(friendly_died){
            map.all_nodes[unit_friendly.y][unit_friendly.x].unit = null;
            this.units.splice(this.units.indexOf(unit_friendly));
        }
        if(enemy_died){
            map.all_nodes[unit_enemy.y][unit_enemy.x].unit = null;
            enemy_player.units.splice(enemy_player.units.indexOf(unit_enemy));
        }

        return [friendly_died, enemy_died];
    }

    // The client and server run two separate timers to produce stars
    // this eliminates otherwise necessary server-client communication (the server would have to constantly update the client stars)
    produce_stars(){
        setInterval(() => {
            this.total_owned_stars += this.star_production / 120;
        },  500);

        this.star_production_has_started = true;
    }

    is_payment_valid(payment: number): boolean{
        return this.total_owned_stars - payment >= 0;
    }

    pay_stars(payment: number){
        this.total_owned_stars -= payment;
    }

    increase_production(star_increment: number){
        this.star_production += star_increment;
    }

    get_data(){
        return {
            // units that this player can produce
            production_unit_types: this.production_unit_types,
        }
    }
}

export default Player;