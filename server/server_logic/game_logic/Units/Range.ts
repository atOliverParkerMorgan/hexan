import {Unit} from "./Unit";
import {UnitInitData} from "./UnitInitData";

class Range extends Unit{
    public static readonly SLINGER: UnitInitData = {
        name: "Slinger",

        attack: 10,
        health: 100,
        range: 2,
        movement: 120,
        cost: 6,

        action: Unit.FORTIFY,
        type: Unit.RANGE
    }
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}

export default Range;