import express, {Request, Response} from "express";
import {Router} from "express/ts4.0";
import {Utils} from "../server_logic/Classes/Utils";

export default class IndexController{

  public readonly REQUEST_TYPES = {
    GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
    FIND_MATCH: "FIND_MATCH",
    START_GAME: "START_GAME"
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
  handle_get_request = (req: Request, res: Response) => {
      res.render('index');
  };

  // creates a new Game object and send the appropriate response
  handle_post_request = (req: Request, res: Response) => {
    const nick_name = req.body.nick_name
    const player_token = req.body.player_token; // null if the request is GENERATE_PLAYER_TOKEN
    const map_size = req.body.map_size;
    const game_mode = req.body.game_mode;
    const game_token = req.body.game_token;
    const request_type = req.body.request_type;
    // const current_player: Player = MatchMaker.add_player_1v1(nick_name);

    // handle invalid request bodies
    if(nick_name=== "" || nick_name == null){
        res.statusMessage = "Error, try getting yourself a nickname";
        res.status(422).send();
    }
    // handle game modes
    else if(game_mode !== Utils.GAME_MODES.GAME_MODE_1v1 && game_mode !== Utils.GAME_MODES.GAME_MODE_2v2 && game_mode !== Utils.GAME_MODES.GAME_MODE_AI && game_mode !== Utils.GAME_MODES.GAME_MODE_FRIEND){
        res.statusMessage = "Error, try a valid game mode";
        res.status(422).send();
    }

    else {
        res.statusMessage = "Not found"
        res.status(404).send();
    }
  }
}
