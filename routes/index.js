const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', );
});

router.post("/",(request,response, next) => {
  //code to perform particular action.
  //To access POST variable use req.body()methods.
  response.redirect("/game");
  console.log(request.body);
  next();
});

module.exports = router;
