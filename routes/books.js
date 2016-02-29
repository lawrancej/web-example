var express = require('express');
var router = express.Router();
var pg = require('pg');

/* GET home page. */
router.get('/', function(req, response, next) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM book', function(err, result){
      done();
      if (err) {
        response.json(process.env);
      } else {
        response.json(result);
      }
    });
  });
});

module.exports = router;
