import express, {Request, Response, NextFunction} from "express";
import {createHash} from "crypto";
import {Router} from "express/ts4.0";
import {ServerSocket} from "../server_logic/ServerSocket";
import ControllerInterface from "./ControllerInterface";
import Game from "../server_logic/game_logic/Game";
import Player from "../server_logic/game_logic/Player";
import {MatchMaker} from "../server_logic/MatchMaker";

export default class IndexController implements ControllerInterface{
  public readonly GAME_MODE_1v1: string = "1v1";
  public readonly GAME_MODE_2v2: string = "2v2";
  public readonly GAME_MODE_AI: string = "AI";
  public readonly GAME_MODE_FRIEND: string = "FRIEND";

  private player_token: string = "";
  private game_token: string = "";

  public router: Router = express.Router();

  constructor() {
    this.initializeRoutes()
  }
  public initializeRoutes() {
    this.router.get("/", this.handle_get_request);
    this.router.post("/", this.handle_post_request);

  }
  // return the render index view
  handle_get_request = (req: Request, res: Response, next: NextFunction) => {
    res.render('index');
  };

  // creates a new game
  // creates a new Game object and send the appropriate response
  handle_post_request = (req: Request,res: Response, next: NextFunction) => {
    // access request parameters from public
    const nick_name = req.body.nick_name;
    const map_size = req.body.map_size;
    const game_mode = req.body.game_mode;

    // const current_player: Player = MatchMaker.add_player_1v1(nick_name);

    // handle invalid request bodies
    if(nick_name=== ""){
      res.status(422).send("Error, try getting yourself a nickname");
    }

    // handle game modes
    else if(game_mode !== this.GAME_MODE_1v1 && game_mode !== this.GAME_MODE_2v2 && game_mode !== this.GAME_MODE_AI && game_mode !== this.GAME_MODE_FRIEND){
      res.status(422).send("Error, try a valid game mode this time");
    }

    // @TODO create one game per a game lobby for 1v1 and 2v2 game_modes
    // create a new Game object based on the newly generated game_token
    MatchMaker.add_player_1v1(nick_name);

    // create a new Player object based on the newly generated player_token
    //const current_player: Player = new Player(this.player_token);

   // game.all_players.push(current_player);
   // game.place_start_city(current_player);

    console.log(this.player_token);
    console.log(this.game_token);

    // the game was successfully created send player_token and game_token to public
    // public can then access certain functionalities within the Game object thanks to the game_token
    res.status(200).send(JSON.stringify(
        {
          player_token: this.player_token,
    }));
  };

}
