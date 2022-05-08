class City{
    constructor(owner, x, y, id, name){
        this.owner = owner;
        this.x = x;
        this.y = y;
        this.name = name;
        this.food_per_a_minute = 20;
        this.production_per_a_minute = 10;
        this.id = id;
        this.is_producing = false;
    }

    start_production(production_time){
        if(!this.is_producing){
            this.is_producing = true
            setTimeout(this.produce, production_time);
        }
    }

    produce(){
        this.owner.units.add(new Unit(this.owner, this.x, this.y));
        this.is_producing = false;
    }
}

module.exports.City = City;