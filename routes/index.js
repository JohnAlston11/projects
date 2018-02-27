var express = require('express');
var router = express.Router();
let expressValidator = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const salt = bcrypt.genSalt(saltRounds);
const passport = require('passport');

/* GET home page. */
router.get('/' ,function (req, res) {
  res.render('home', {
    title: 'Game'
  });
});

/* GET profile page */
router.get('/profile', authenicationMiddleware(), function (req, res) {
  let db = require('../db');
    const user_id = req.user.user_id

    db.query('SELECT username FROM users WHERE id=?', [user_id], 
    function(err, results, fields){
      let user = results[0].username.toUpperCase();
      res.render('profile', {
        title: user,
        count: "TBD"
      })
    })
  
});

/* Log In Page */
router.get('/login', function(req, res){
  res.render('login', {title: 'Login'})
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/game',
  failureRedirect: '/login'
}));

router.get('/logout', function(req, res){
  req.logOut();
  req.session.destroy();
  res.redirect('/');
})
/* Game Page */
router.get('/game', authenicationMiddleware(), function(req, res){
  res.render('game', {title: 'Game Page'});
  
})


/* Sign Up Page */
router.get('/signup', function (req, res, next) {
  res.render('signup', {
    title: 'Sign Up 😁'
  });
});

router.post('/signup', function (req, res, next) {
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('pw1', 'Password must be between 6-30 characters long.').len(6, 30);
  req.checkBody('pw2', 'Passwords do not match, please try again.').equals(req.body.pw1);
  const errors = req.validationErrors();
  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);
    res.render('signup', {
      title: 'Sign Up 😁',
      errors: errors
    })
  } else {
    const db = require('../db.js');
    const un = req.body.username;
    const pw = req.body.pw1;

    bcrypt.hash(pw, saltRounds, function (err, hash) {
      db.query(`INSERT INTO users (username, password) VALUES (?, ?)`, [un, hash],
        function (err, results, fields) {
          if (err) throw err;

          db.query('SELECT LAST_INSERT_ID() as user_id', function (error, results, fields) {
            if (error) throw error;

            const user_id = results[0];


            req.login(user_id, function (err) {
              res.redirect('/');
            })
          })
          res.render('signup', {
            title: 'SIGN UP COMPLETE! 👍'
          });

        })
    });
  };
});
passport.serializeUser(function (user_id, done) {
  done(null, user_id);
});

passport.deserializeUser(function (user_id, done) {
  done(null, user_id);
});

function authenicationMiddleware() {
  return (req, res, next) => {

    if (req.isAuthenticated()) return next();

    res.redirect('/login')
  };
};


module.exports = router;