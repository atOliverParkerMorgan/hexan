import {CityInterface} from "../City/CityInterface";

export type NodeInterface = {
    x: number;
    y: number;
    type: number | null,
    borders: any,
    city_data: CityInterface | null;
    sprite_name: string;
    harvest_cost: number
    production_stars: number;
    is_harvested: boolean;
}
