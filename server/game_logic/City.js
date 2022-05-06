let all_cities = []

class City{
    constructor(owner, x, y, id, name){
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = "prague";
        this.food_per_a_minute = 20;
        this.production_per_a_minute = 10;
        this.id = id;
        this.is_producing = false;
    }

    start_production(){
        if(!this.is_producing){
            setTimeout(this.produce(), 5000);
        }
    }
    produce(){

    }


}

module.exports.City = City;
module.exports.all_cities = all_cities;