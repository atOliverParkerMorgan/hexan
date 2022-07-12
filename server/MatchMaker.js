// this class creates matches between players
const MatchMaker = {
    all_players_searching_1v1 : [],
    all_players_searching_2v2 : [],

    has_match_for_1v1: ()=>{
        return this.all_players_searching_1v1.length > 0;
    },

    has_match_for_2v2: ()=>{
        return this.all_players_searching_2v2.length % 4 === 0;
    },

    print_current_1v1: ()=>{
        for(const player_token of this.all_players_searching_1v1){
            console.log(player_token);
        }
    }
};