import City from "../City";

export type NodeData = {
    x: number;
    y: number;
    type: number,
    borders: any,
    city: City | null;
    sprite_name: string;
    harvest_cost: number
    production_stars: number;
    is_harvested: boolean;
}
