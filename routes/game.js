const express = require('express');
const router = express.Router();
const game_exports = require("../server/game_logic/Game");


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('game')
});

module.exports = router;
