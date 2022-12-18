import express, {Request, Response} from "express";
import {Router} from "express/ts4.0";
import {MatchMaker} from "../server_logic/MatchMaker";
import {Utils} from "../Utils";
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
    else if(game_mode !== Utils.GAME_MODE_1v1 && game_mode !== Utils.GAME_MODE_2v2 && game_mode !== Utils.GAME_MODE_AI && game_mode !== Utils.GAME_MODE_FRIEND){
        res.statusMessage = "Error, try a valid game mode";
        res.status(422).send();
    }

    else if(request_type === this.REQUEST_TYPES.GENERATE_PLAYER_TOKEN){
        let player: any;
        switch(game_mode) {
            case Utils.GAME_MODE_AI:
                // generate ai player
                player = MatchMaker.add_player_ai(nick_name);
                res.status(200).send(JSON.stringify({player_token: player.token}));
                break;

            case Utils.GAME_MODE_1v1:
                player = MatchMaker.add_player_1v1(nick_name);
                res.status(200).send(JSON.stringify({player_token: player.token}));
                break;


            default:
                res.statusMessage = "Error something went wrong"
                res.status(500).send();

        }
    }
    else if(request_type === this.REQUEST_TYPES.START_GAME){
        if(game_mode != null) {
            switch (game_mode) {

                case Utils.GAME_MODE_1v1:
                    const game = MatchMaker.get_game(game_token);
                    const current_player = game?.get_player(player_token)

                    if(current_player == null) {
                        res.statusMessage = "Error something went wrong"
                        res.status(500).send();
                    }

                    else if (game == null) {

                        res.statusMessage = "Enemy aborted query"
                        res.status(201).send();
                    }else {
                        clearTimeout(current_player.is_ready_timer_id);
                        if(game.get_enemy_players(current_player.token)[0].is_ready)
                            res.status(200).send(JSON.stringify({game_token: game.token}));
                        else{
                            res.statusMessage = "Enemy player didn't accept yet"
                            res.status(204).send();
                        }
                    }
                    break;

                case Utils.GAME_MODE_2v2:
                    break;

                default:
                    res.statusMessage = "Invalid request, not accepted"
                    res.status(400).send();
            }
        }
    }

    else if(request_type === this.REQUEST_TYPES.FIND_MATCH){
      if(game_mode != null && player_token != null && map_size != null){
        let game: any;
        switch (game_mode) {
           case Utils.GAME_MODE_AI:
                game = MatchMaker.get_ai_game(player_token, map_size);
                if(game == undefined){
                    res.statusMessage = "Couldn't load AI";
                    res.status(500).send();
                }else {
                    res.status(200).send(JSON.stringify({game_token: game.token}));

                }
                break;

          case Utils.GAME_MODE_1v1:
                game = MatchMaker.find_match_for_1v1(player_token, map_size);
                const player = game?.get_player(req.body.player_token)
                console.log("found game", game!=null);
                console.log("all_players length", MatchMaker.all_players_searching_1v1.length)
                if(game == undefined || player == null){
                    res.statusMessage = "No match found";
                    res.status(204).send();
                }else{

                    player.is_ready_timer_id = setTimeout(()=>{
                        if(!player.is_ready){
                            MatchMaker.all_players_searching_1v1.splice(MatchMaker.all_players_searching_1v1.indexOf(player), 1);
                            MatchMaker.all_games.splice(MatchMaker.all_games.indexOf(game), 1);

                        }

                    }, 10_000);

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
  }
}
