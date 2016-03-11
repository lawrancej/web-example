var express = require('express');
var router = express.Router();
var pg = require('pg').native;

/* GET home page. */
router.get('/', function(req, response, next) {
  pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, done) {
    client.query('SELECT * FROM book', function(err, result) {
      done();
      if (err) {
        response.json(err);
      } else {
        response.json(result.rows);
      }
    });
  });
});

module.exports = router;
