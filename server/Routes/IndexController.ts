import express, {Request, Response} from "express";
import {Router} from "express";
import {Utils} from "../ServerLogic/Classes/Utils";

export default class IndexController{

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
    const game_mode = req.body.game_mode;

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
