const express = require('express');
const http = require("http");
const server = require("socket.io");
const now = require('nano-time');
const {createHash} = require('crypto');

const player_exports = require("../server/game_logic/Player");
const Player = player_exports.Player;
const all_players = player_exports.all_players;

const game_exports = require("../server/game_logic/Game");
const Game = game_exports.Game;
const all_games = game_exports.all_games;

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

  player_token = generate_token(nick_name);
  all_players.push(new Player(player_token));

  game_token = generate_token(player_token);
  all_games.push(create_or_assign_game(game_token, player_token));

  res.status(200).send(JSON.stringify({player_token: player_token, game_token: game_token}));
});

function generate_token(nick_name){
  return createHash('sha256').update(nick_name + String(Math.random() + now())).digest('hex');
}

function create_or_assign_game(game_token, player_token){
  let game = new Game(game_token, 2500, 1);

  let player;
  for(const p of all_players){
    if(p.token === player_token){
      player = p;
    }
  }

  game.place_start_city(player);
  game.connect_player();
  game.send_player_map(player_token);

  return game;
}

module.exports = router;