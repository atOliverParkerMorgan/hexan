import {Unit, UnitInitData} from "./Unit";

class Settler extends Unit{
    constructor(x: number, y: number, id: string, unit_init_data: UnitInitData) {
        super(x, y, id, unit_init_data);
    }
}