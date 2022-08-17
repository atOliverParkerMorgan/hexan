import express, {Request, Response, NextFunction} from "express";
import {Router} from "express/ts4.0";
import {ServerSocket} from "../server_logic/ServerSocket";
import ControllerInterface from "./ControllerInterface";
import Player from "../server_logic/game_logic/Player";
import {MatchMaker} from "../server_logic/MatchMaker";
import {Utils} from "../Utils";

export default class IndexController implements ControllerInterface{

  public readonly REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH"
  }

  private player_token: string = "";

  public router: Router = express.Router();

  constructor() {
    this.initializeRoutes()
  }
  public initializeRoutes() {
    this.router.get("/", this.handle_get_request);
    this.router.post("/", this.handle_post_request);

  }
  // return rendered index view
  handle_get_request = (req: Request, res: Response, next: NextFunction) => {
      res.render('index');
  };

  // creates a new Game object and send the appropriate response
  handle_post_request = (req: Request,res: Response, next: NextFunction) => {
    const nick_name = req.body.nick_name
    const player_token = req.body.player_token; // null if the request is GENERATE_PLAYER_TOKEN
    const map_size = req.body.map_size;
    const game_mode = req.body.game_mode;
    const request_type = req.body.request_type;
    // const current_player: Player = MatchMaker.add_player_1v1(nick_name);

    // handle invalid request bodies
    if(nick_name=== "" || nick_name == null){
        res.statusMessage = "Error, try getting yourself a nickname";
        res.status(422).send();
    }
    // handle game modes
    else if(game_mode !== Utils.GAME_MODE_1v1 && game_mode !== Utils.GAME_MODE_2v2 && game_mode !== Utils.GAME_MODE_AI && game_mode !== Utils.GAME_MODE_FRIEND){
        res.statusMessage = "Error, try a valid game mode";
        res.status(422).send();
    }

    else if(request_type === this.REQUEST_TYPES.GENERATE_PLAYER_TOKEN){
        let player: Player;
        switch(game_mode) {
            case Utils.GAME_MODE_AI:
                // generate ai player
                player = new Player(Utils.generate_token(nick_name));
                res.status(200).send(JSON.stringify({player_token: player.token}));
                break;

            case Utils.GAME_MODE_1v1:
                player = MatchMaker.add_player_1v1(nick_name);
                res.status(200).send(JSON.stringify({player_token: player.token}));
                break;
        }
    }

    else if(request_type === this.REQUEST_TYPES.FIND_MATCH){
      if(game_mode != null){
        let game;
        switch (game_mode) {
            case Utils.GAME_MODE_AI:
                game = MatchMaker.get_ai_game(player_token, map_size);
                if(game == undefined){
                    res.statusMessage = "Couldn't load AI";
                    res.status(500).send();
                }else {
                    // connect ServerSocket
                    ServerSocket.init();
                    ServerSocket.add_request_listener();
                    ServerSocket.add_response_listener();
                    res.status(200).send(JSON.stringify({game_token: game.token}));

                }
                break;

          case Utils.GAME_MODE_1v1:
                game = MatchMaker.find_match_for_1v1(player_token, map_size);

                if(game == undefined){
                    res.statusMessage = "No match found";
                    res.status(204).send();
                }else{

                    // connect ServerSocket
                    ServerSocket.init();
                    ServerSocket.add_request_listener();
                    ServerSocket.add_response_listener();

                    res.status(200).send(JSON.stringify({game_token: game.token}));
                }
                break;

          default:
            res.statusMessage = "Invalid request, not accepted"
            res.status(400).send();
         }

       }else {
          res.statusMessage = "Invalid request, not accepted"
          res.status(400).send();
      }
    }else {
        res.statusMessage = "Not found"
        res.status(404).send();
    }
  };
}
