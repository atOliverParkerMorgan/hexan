"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchMaker = void 0;
var MatchMaker;
(function (MatchMaker) {
    MatchMaker.all_players_searching_1v1 = [];
    MatchMaker.all_players_searching_2v2 = [];
    function has_match_for_1v1() {
        return MatchMaker.all_players_searching_1v1.length > 0;
    }
    MatchMaker.has_match_for_1v1 = has_match_for_1v1;
    function has_match_for_2v2() {
        return MatchMaker.all_players_searching_2v2.length % 4 === 0;
    }
    MatchMaker.has_match_for_2v2 = has_match_for_2v2;
    function print_current_1v1() {
        for (var _i = 0, all_players_searching_1v1_1 = MatchMaker.all_players_searching_1v1; _i < all_players_searching_1v1_1.length; _i++) {
            var player_token = all_players_searching_1v1_1[_i];
            console.log(player_token);
        }
    }
    MatchMaker.print_current_1v1 = print_current_1v1;
})(MatchMaker = exports.MatchMaker || (exports.MatchMaker = {}));
