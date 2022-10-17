import {Unit} from "./Unit";
import {UnitInitData} from "./UnitInitData";
import Map from "../Map/Map";

class Melee extends Unit{
    public static readonly WARRIOR: UnitInitData = {
        name: "Warrior",

        attack: 25,
        health: 100,
        range: 1,
        movement: 100,
        cost: 4,

        action: Unit.FORTIFY,
        type: Unit.MELEE
    }
    constructor(x: number, y: number, id: string, map: Map, unit_init_data: UnitInitData) {
        super(x, y, id, map, unit_init_data);
    }
}

export default Melee;