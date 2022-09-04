// const {Unit} = require("./Units/Unit.ts");
import {Unit} from "./Units/Unit";

import Melee from "./Units/Melee";
import Range from "./Units/Range";
import Cavalry from "./Units/Cavalry";
import Settler from "./Units/Settler";

class Player{
    token: string;
    units: Unit[];
    production_unit_types: string[];
    current_unit_id: number;


    total_owned_stars: number;
    // stars per a minute
    star_production: number;

    time_of_next_star_production: number;

    constructor(token: string) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_unit_types = [Unit.MELEE, Unit.RANGE, Unit.SETTLER];
        this.current_unit_id = 0;

        this.total_owned_stars = 0;
        this.star_production = 5;

        this.time_of_next_star_production = -1;
    }

    add_unit(x: number, y: number, type: string): Unit{
        let new_unit: any;
        switch (type){
            case Unit.MELEE:
                new_unit = new Melee(x, y,this.current_unit_id.toString(), Melee.WARRIOR);
                break;
            case Unit.RANGE:
                new_unit = new Range(x, y,this.current_unit_id.toString(), Range.SLINGER, );
                break;

            case Unit.CAVALRY:
                new_unit = new Cavalry(x, y,this.current_unit_id.toString(), Cavalry.HORSEMAN);
                break;

            case Unit.SETTLER:
                new_unit = new Settler(x, y,this.current_unit_id.toString());
                break;

        }
        this.units.push(new_unit);
        this.current_unit_id ++;
        return new_unit;
    }

    get_unit(id: string): Unit | undefined {
        for (const unit of this.units) {
            if(unit.get_id() === id) return unit;
        }
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

    // The client and server run two separate yet synchronized timers to produce stars
    // the timers are synchronized by local time => by using the object Date
    // this eliminates otherwise necessary server-client communication (the server would have to constantly update the client stars)
    produce_stars(){
        let now = new Date();
        this.time_of_next_star_production = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds() + 60 / this.star_production, 0).getTime();
        let time_to_next_star_production = this.time_of_next_star_production - Date.now();

        setTimeout(()=>{
            this.total_owned_stars++
            this.produce_stars();

        }, time_to_next_star_production);
    }
}

export default Player;