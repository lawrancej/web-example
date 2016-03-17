var express = require('express');
var router = express.Router();
var passport = require('passport');
var pg = require('pg').native;
var bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('user');
});

router.get('/login',
  function(req, res){
    res.render('login');
  });

router.post('/login',
  // This is where authentication happens
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

router.get('/signup',
  function(req, res) {
    // If logged in, go to profile page
    if(req.user) {
      res.redirect('profile');
    }
    res.render('signup');
  });

function validUsername(username) {
  var login = username.trim();
  return login !== '' && login.search(/ /) < 0;
}

function validPassword(password) {
  var pass = password.trim();
  return pass !== '' &&
    pass.length >= 8 &&
    pass.search(/[a-z]/) >= 0 &&
    pass.search(/[A-Z]/) >= 0 &&
    pass.search(/[0-9]/) >= 0;
}

router.post('/signup',
  function(req, res, next) {
    // Reject non-users
    if (!validUsername(req.body.username)) {
      return res.render('signup');
    }
    // Reject weak passwords
    if (!validPassword(req.body.password)) {
      return res.render('signup');
    }
    // Generate a hashed password
    var hashedPassword = new Promise(function(resolve, reject){
      var salt = bcrypt.genSaltSync(10);
      console.log("hash passwords");
      resolve(bcrypt.hashSync(req.body.password, salt));
    });
    // Connect to database
    var db = new Promise(function(resolve, reject) {
      pg.connect(process.env.DATABASE_URL + "?ssl=true", function(err, client, next) {
        console.log("connect to db");
        if (err) { reject(Error("Unable to connect to database")); }
        else { resolve({'client':client,'next':next}); }
      });
    }).then(function(data) {
      // Check if they're already a user
      return new Promise(function(resolve, reject) {
        console.log("query db");
        data.client.query('SELECT * FROM users WHERE username=$1',[req.body.username], function(err, result) {
          if (err) {
            console.log("unable to query db");
            reject(Error("Unable to query database"));
          }
          else if (result.rows.length > 0) {
            data.next();
            console.log("user exists");
            reject(Error("User exists"));
          } else {
            console.log("no user with that name");
            resolve(data);
          }
        });
      });
    });
    // If we have a legit password,
    // and nobody else has the account,
    // create the user
    Promise.all([hashedPassword, db]).then(function(data) {
      console.log("create account");
      data[1].client.query('INSERT INTO users (username, password) VALUES($1, $2)', [req.body.username, data[0]], function(err, result) {
        data[1].next();
      });
    });
    res.redirect('login');
  });


module.exports = router;
