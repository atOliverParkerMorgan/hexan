"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Utils_1 = require("../server_logic/Classes/Utils");
class IndexController {
    constructor() {
        this.REQUEST_TYPES = {
            GENERATE_PLAYER_TOKEN: "GENERATE_PLAYER_TOKEN",
            FIND_MATCH: "FIND_MATCH",
            START_GAME: "START_GAME"
        };
        this.player_token = "";
        this.router = express_1.default.Router();
        // return rendered index view
        this.handle_get_request = (req, res) => {
            res.render('index');
        };
        // creates a new Game object and send the appropriate response
        this.handle_post_request = (req, res) => {
            const nick_name = req.body.nick_name;
            const player_token = req.body.player_token; // null if the request is GENERATE_PLAYER_TOKEN
            const map_size = req.body.map_size;
            const game_mode = req.body.game_mode;
            const game_token = req.body.game_token;
            const request_type = req.body.request_type;
            // const current_player: Player = MatchMaker.add_player_1v1(nick_name);
            // handle invalid request bodies
            if (nick_name === "" || nick_name == null) {
                res.statusMessage = "Error, try getting yourself a nickname";
                res.status(422).send();
            }
            // handle game modes
            else if (game_mode !== Utils_1.Utils.GAME_MODES.GAME_MODE_1v1 && game_mode !== Utils_1.Utils.GAME_MODES.GAME_MODE_2v2 && game_mode !== Utils_1.Utils.GAME_MODES.GAME_MODE_AI && game_mode !== Utils_1.Utils.GAME_MODES.GAME_MODE_FRIEND) {
                res.statusMessage = "Error, try a valid game mode";
                res.status(422).send();
            }
            else {
                res.statusMessage = "Not found";
                res.status(404).send();
            }
        };
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.handle_get_request);
        this.router.post("/", this.handle_post_request);
    }
}
exports.default = IndexController;
