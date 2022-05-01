const express = require('express');
const router = express.Router();
const game_exports = require("../server/game_logic/Game");


/* GET home page. */
router.get('/', function(req, res, next) {
    const hex_side_size = 10;
    res.render('game',{
        hex_side_size: JSON.stringify(hex_side_size),
    });
});

module.exports = router;
