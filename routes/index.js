const express = require('express');
const now = require('nano-time');
const {createHash} = require('crypto');

const player_exports = require("../server/game_logic/Player");
const Player = player_exports.Player;

const game_exports = require("../server/game_logic/Game");
const Game = game_exports.Game;
const all_games = game_exports.all_games;

const socket = require("../server/socket.js");
socket.init();

let player_token;
let game_token;

const router = express.Router();

function is_token_valid(token){
    for(const player of all_players){
      if(player.token === token) return true;
    }
    return false;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.post("/",(req,res, next) => {
  const nick_name = req.body;
  if(nick_name===""){
    res.status(422).send();
  }

  game_token = generate_token(player_token);
  player_token = generate_token(nick_name);

  const game = new Game(game_token, 2500, 4);
  const current_player = new Player(player_token);
  
  game.all_players.push(current_player);

  all_games.push(game);

  game.place_start_city(current_player);
  socket.receive_data(game);
  game.send_player_map(current_player);


  res.status(200).send(JSON.stringify({player_token: player_token, game_token: game_token}));
});

function generate_token(nick_name){
  return createHash('sha256').update(nick_name + String(Math.random() + now())).digest('hex');
}

module.exports = router;