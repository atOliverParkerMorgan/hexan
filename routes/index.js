const express = require('express');
const now = require('nano-time');
const {createHash} = require('crypto');

const player_exports = require("../server/game_logic/Player");
const Player = player_exports.Player;

const game_exports = require("../server/game_logic/Game");
const Game = game_exports.Game;

const ServerSocket = require("../server/ServerSocket.js").ServerSocket;
ServerSocket.init();


let player_token;
let game_token;

const router = express.Router();

let map_size = 2500;


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

  const game = new Game(game_token, map_size, 4);
  const current_player = new Player(player_token);
  
  game.all_players.push(current_player);

  ServerSocket.all_games.push(game);

  game.place_start_city(current_player);

  ServerSocket.add_request_listener();
  ServerSocket.add_response_listener();

  res.status(200).send(JSON.stringify({player_token: player_token, game_token: game_token}));
});

function generate_token(nick_name){
  return createHash('sha256').update(nick_name + String(Math.random() + now())).digest('hex');
}

module.exports = router;
