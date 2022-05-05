let all_cities = []

class City{
    constructor(owner, x, y, id){
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = "prague";
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