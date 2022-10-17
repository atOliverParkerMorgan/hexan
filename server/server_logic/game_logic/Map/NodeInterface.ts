import {CityInterface} from "../City/CityInterface";
import {Unit} from "../Units/Unit";

export type NodeInterface = {
    x: number;
    y: number;
    unit: Unit | null;
    type: number | null,
    borders: any,
    city_data: CityInterface | null;
    sprite_name: string;
    harvest_cost: number
    production_stars: number;
    is_harvested: boolean;
}
