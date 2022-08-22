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
        this.production_unit_types = [Unit.MELEE, Unit.RANGE, Unit.SETTLER];
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

    get_unit(id: string): Unit | undefined {
        for (const unit of this.units) {
            if(unit.get_id() === id) return unit;
        }
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
}

export default Player;