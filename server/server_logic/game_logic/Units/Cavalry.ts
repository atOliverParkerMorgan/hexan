import {Unit, UnitInitData} from "./Unit";

class Cavalry extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly HORSEMAN: UnitInitData = {
        attack: 20,
        health: 100,
        range: 1,
        movement: 25,

        action: Unit.FORTIFY,
        type: Unit.CAVALRY
    }
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}

export default Cavalry;