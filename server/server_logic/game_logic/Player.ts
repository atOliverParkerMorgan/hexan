// const {Unit} = require("./Units/Unit.ts");
import {Unit} from "./Units/Unit";

import Melee from "./Units/Melee";
import Range from "./Units/Range";
import Cavalry from "./Units/Cavalry";


class Player{
    token: string;
    units: Unit[];
    production_unit_types: string[];
    current_unit_id: number;

    constructor(token: string) {
        this.token = token;
        this.units = [];
        // units that this player can produce
        this.production_unit_types = [Unit.MELEE, Unit.RANGE];
        this.current_unit_id = 0;
    }

    add_unit(x: number, y: number, type: string): void{
        switch (type){
            case Unit.MELEE:
                this.units.push(new Unit(x, y,this.token+this.current_unit_id, Melee.WARRIOR));
                break;
            case Unit.RANGE:
                this.units.push(new Unit(x, y,this.token+this.current_unit_id, Range.SLINGER, ));
                break;
            case Unit.CAVALRY:
                this.units.push(new Unit(x, y,this.token+this.current_unit_id, Cavalry.HORSEMAN));
                break;
        }
        this.current_unit_id ++;
    }

    get_unit(id: string) {
        for (const unit of this.units) {
            if(unit.get_id() === id) return unit;
        }
    }
    // used to send simplified unit data structure threw socket.io
    get_unit_data(){
        let unit_data = [];
        for(const unit of this.units){
            unit_data.push(unit.get_data());
        }
        return unit_data;

    }
}

export default Player;