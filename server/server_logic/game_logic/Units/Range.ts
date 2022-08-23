import {Unit, UnitInitData} from "./Unit";

class Range extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly SLINGER: UnitInitData = {
        attack: 10,
        health: 100,
        range: 2,
        movement: 120,
        type: Unit.RANGE
    }
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}

export default Range;