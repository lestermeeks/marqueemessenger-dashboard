const express = require('express');
const passport = require('passport');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index');
  res.redirect("/user");
});

router.get('/login', passport.authenticate('auth0', {
  //clientID: process.env.AUTH0_CLIENT_ID,
  //domain: process.env.AUTH0_DOMAIN,
  //redirectUri: process.env.AUTH0_CALLBACK_URL,
  responseType: 'code',
  audience: 'https://' + process.env.AUTH0_DOMAIN + '/userinfo'
  //scope: 'openid profile email'
  }),
  function(req, res) {
    res.redirect("/user");
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('https://www.marqueemessenger.com');
});

router.get('/callback',
  passport.authenticate('auth0', {
    failureRedirect: '/failure'
  }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  }
);

router.get('/failure', function(req, res) {
  var error = req.flash("error");
  var error_description = req.flash("error_description");
  req.logout();
  res.render('failure', {
    error: error[0],
    error_description: error_description[0],
  });
});

module.exports = router;
