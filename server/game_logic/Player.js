let all_players = []

class Player{
    constructor(token) {
        this.token = token;
        this.current_city_id = 0;
    }
}

module.exports.Player = Player;
module.exports.all_players = all_players;