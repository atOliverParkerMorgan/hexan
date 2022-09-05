import {Unit} from "./Unit";
import {UnitInitData} from "./UnitInitData";

class Cavalry extends Unit{
    public static readonly HORSEMAN: UnitInitData = {
        name: "Horseman",
        attack: 20,
        health: 100,
        range: 1,
        movement: 25,
        cost: 8,

        action: Unit.FORTIFY,
        type: Unit.CAVALRY
    }
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}

export default Cavalry;