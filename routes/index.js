const express = require('express');
const http = require("http");
const server = require("socket.io");
const now = require('nano-time');
const {createHash} = require('crypto');
const player_exports = require('/home/olix/WebstormProjects/metalhead/server/game_logic/Player.js');

const Player = player_exports.Player;
const all_players = player_exports.all_players;

const router = express.Router();
const PORT_SOCKET = 8082;

function is_token_valid(token){
    for(const player of all_players){
      if(player.token === token) return true;
    }
    return false;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  const token = req.query.token;

  if(is_token_valid(req.query.token)){

    res.render('game');
  }
  else res.render('index');
});


router.post("/",(req,res, next) => {
  const nick_name = req.body;
  const token = generate_token(nick_name)+generate_token(nick_name)
  all_players.push(new Player(token));
  console.log(all_players.length);
  console.log(req.body);
  res.status(200).send(token);
});

function generate_token(nick_name){
  return createHash('sha256').update(nick_name + String(Math.random() + now())).digest('hex');
}

module.exports = router;