"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Utils_1 = require("../ServerLogic/Classes/Utils");
class IndexController {
    constructor() {
        this.router = express_1.default.Router();
        // return rendered index view
        this.handle_get_request = (req, res) => {
            res.render('index');
        };
        // creates a new Game object and send the appropriate response
        this.handle_post_request = (req, res) => {
            const nick_name = req.body.nick_name;
            const game_mode = req.body.game_mode;
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
        if (Utils_1.Utils.ENV === "PRODUCTION") {
            this.router.get('*', function (req, res, next) {
                if (req.headers['x-forwarded-proto'] != 'https')
                    res.redirect("https://" + req.hostname + req.url);
                else
                    next(); /* Continue to other routes if we're not redirecting */
            });
        }
        this.router.get("/", this.handle_get_request);
        this.router.post("/", this.handle_post_request);
    }
}
exports.default = IndexController;
