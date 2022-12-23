var City = /** @class */ (function () {
    function City(city_data) {
        this.x = city_data.x;
        this.y = city_data.y;
        this.cords_in_pixels_x = city_data.cords_in_pixels_x;
        this.cords_in_pixels_y = city_data.cords_in_pixels_y;
        this.name = city_data.name;
        this.stars_per_a_minute = city_data.stars_per_a_minute;
        this.population = city_data.population;
        this.is_friendly = city_data.is_friendly;
    }
    City.prototype.getNodeColor = function () {
        if (this.is_friendly) {
            return City.FRIENDLY_CITY_COLOR;
        }
        return City.ENEMY_CITY_COLOR;
    };
    City.FRIENDLY_CITY_COLOR = 0xFF7800;
    City.ENEMY_CITY_COLOR = 0xF53E3E;
    return City;
}());
export { City };
