var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/session', function(req, res) {
  var sess = req.session;
  if (sess.views) {
    sess.views++;
  } else {
    sess.views = 1;
  }
  res.render('index', { title: 'You visited this ' + sess.views + ' times'});
});

module.exports = router;
