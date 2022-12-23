import {CityInterface} from "./CityInterface.js";

export class City{

    public static readonly FRIENDLY_CITY_COLOR: number = 0xFF7800;
    public static readonly ENEMY_CITY_COLOR: number = 0xF53E3E ;

    public readonly x: number;
    public readonly y: number;
    public readonly cords_in_pixels_x: number;
    public readonly cords_in_pixels_y: number;
    public readonly name: string;
    stars_per_a_minute: number;
    population: number;
    public is_friendly: boolean;

    constructor(city_data: CityInterface) {
        this.x = city_data.x;
        this.y = city_data.y;
        this.cords_in_pixels_x = city_data.cords_in_pixels_x;
        this.cords_in_pixels_y = city_data.cords_in_pixels_y;
        this.name = city_data.name;
        this.stars_per_a_minute = city_data.stars_per_a_minute;
        this.population = city_data.population;
        this.is_friendly = city_data.is_friendly;
    }

    getNodeColor(){
        if(this.is_friendly){
            return City.FRIENDLY_CITY_COLOR;
        }
        return City.ENEMY_CITY_COLOR;
    }
}