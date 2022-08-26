import {Unit, UnitInitData} from "./Unit";

class Melee extends Unit{
    public readonly PRODUCTION_TIME: number = 10_000;
    public static readonly WARRIOR: UnitInitData = {
        attack: 25,
        health: 100,
        range: 1,
        movement: 100,

        action: Unit.FORTIFY,
        type: Unit.MELEE
    }
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}

export default Melee;