class Player{
    constructor(token) {
        this.token = token;
        this.current_city_id = 0;
        this.units = [];
    }
}

module.exports.Player = Player;