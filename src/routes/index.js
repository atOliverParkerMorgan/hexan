const express = require('express');
const now = require('nano-time');
const {createHash} = require('crypto');
const fs = require("fs");

const player_exports = require("../server/game_logic/Player");
const Player = player_exports.Player;

const game_exports = require("../server/game_logic/Game");
const Game = game_exports.Game;

const ServerSocket = require("../server/ServerSocket.js").ServerSocket;
ServerSocket.init();

const GAME_MODE_1v1 = "1v1";
const GAME_MODE_2v2 = "2v2";
const GAME_MODE_AI = "AI";
const GAME_MODE_FRIEND = "FRIEND";

let player_token;
let game_token;

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.post("/",(req,res, next) => {
  const nick_name = req.body.nick_name;

  const game_mode = req.body.game_mode;

  const map_size = req.body.map_size;

  console.log(nick_name);

  // handle invalid request bodies
  if(nick_name=== ""){
    res.status(422).send("Error, try getting yourself a nickname");
  }

  else if(game_mode !== GAME_MODE_1v1 && game_mode !== GAME_MODE_2v2 && game_mode !== GAME_MODE_AI && game_mode !== GAME_MODE_FRIEND){
    res.status(422).send("Error, try a valid game mode this time");
  }

  // handle game modes

  player_token = generate_token(nick_name);
  game_token = generate_token(player_token);

  const game = new Game(game_token, map_size, 4);
  const current_player = new Player(player_token);
  
  game.all_players.push(current_player);

  ServerSocket.all_games.push(game);

  game.place_start_city(current_player);

  // console.log(player_token);
  // console.log(game_token);

  res.status(200).send(JSON.stringify(
      {
        player_token: player_token,
        game_token: game_token,
      }));
});

function generate_token(nick_name){
  return createHash('sha256').update(nick_name + String(Math.random() + now())).digest('hex');
}

module.exports = router;
