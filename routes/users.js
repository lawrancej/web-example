var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user');
});

router.get('/login',
  function(req, res){
    res.render('login');
  });

router.post('/login',
  passport.authenticate('local', { failureRedirect: 'login' }),
  function(req, res,next) {
    // res.json(req.user);
    res.redirect('profile');
  });

router.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect('login');
  }
}

router.get('/profile',
  loggedIn,
  function(req, res){
      res.render('profile', { user: req.user });
  });

module.exports = router;
