let all_cities = []

class City{
    constructor(owner, x, y){
        this.owner = owner;
        this.x = x;
        this.y = y;
    }
}

module.exports.City = City;
module.exports.all_cities = all_cities;