export interface CityInterface {
    readonly x: number;
    readonly y: number;
    readonly cords_in_pixels_x: number;
    readonly cords_in_pixels_y: number;
    readonly name: string;
    stars_per_a_minute: number;
    population: number;
    is_friendly: boolean;
}