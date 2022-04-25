const express = require('express');
const http = require("http");
const server = require("socket.io");
const router = express.Router();
const PORT_SOCKET = 8082;

function handle_new_game_request(res, next){
  const httpServer = http.createServer();
  const io = server(httpServer);

  // io.on("connection", (socket) => {
  //     console.log("connection");
  //     socket.on("create_game", ()=>{
  //         console.log("here");
  //
  //         //next()
  //     });
  // });
  //
  // httpServer.listen(PORT_SOCKET);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.post("/",(req,res, next) => {
  console.log(req.body);
  // next();
  res.status(200).render("")
});

function generate_token(){

}

module.exports = router;