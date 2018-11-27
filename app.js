const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const request = require('request');
const session = require('express-session');
//const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const flash = require('connect-flash');
const goldenMessenger = require('./golden-messenger')();

const mongoose = require('mongoose');
const TimedPriceModel = require('./models/TimedPriceModel');
const QuoteModel = require('./models/QuoteModel');

require('./models/CounterModel');
require('./models/MessageModel');
require('./models/MessageSetModel');
require('./models/DeviceModel');
require('./models/UserModel');

//dotenv.load();

const index = require('./routes/index');
const user = require('./routes/user');
const device = require('./routes/device');
const api = require('./routes/api');



// This will configure Passport to use Auth0
const strategy = new Auth0Strategy(
    {
      domain: process.env.AUTH0_DOMAIN,
      clientID: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      scope: 'openid profile email',
      callbackURL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      // accessToken is the token to call Auth0 API (not needed in the most cases)
      // extraParams.id_token has the JSON Web Token
      // profile has all the information from the user
      console.log(`profile: ${JSON.stringify(profile)}`);
      return done(null, profile);
    }
  );
  
  passport.use(strategy);
  
  // you can use this section to keep a smaller payload
  passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('goldenMessenger', goldenMessenger);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
      secret: 'shhhhhhhhh',
      resave: true,
      saveUninitialized: true
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

//MONGODB_URI
const mongoUri = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;

mongoose.connect(mongoUri)
  .then(() =>  console.log(`Mongo connection succesful ${mongoUri}`))
  .catch((err) => console.error(err));

// Handle auth failure error messages
app.use(function(req, res, next) {
    if (req && req.query && req.query.error) {
        req.flash("error", req.query.error);
    }
    if (req && req.query && req.query.error_description) {
        req.flash("error_description", req.query.error_description);
    }
    next();
});

// Check logged in
app.use(function(req, res, next) {
    res.locals.loggedIn = false;
    if (req.session.passport && typeof req.session.passport.user != 'undefined') {
    res.locals.loggedIn = true;
    }
    next();
});
   

app.use('/', index);
app.use('/user', user);
app.use('/device', device);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


function getCoinbaseSpotPrice( pair, callback )
{
    //https://api.coinbase.com/v2/prices/BTC-USD/spot
    return request({
        url: `https://api.coinbase.com/v2/prices/${pair}/spot`,
        method: 'GET',
        //encoding: 'utf8',
        //timeout: this.timeout,
        headers: {
            'User-Agent': this.name + ' ' + this.classVersion,
            'Accept': 'application/json',
            'CB-VERSION': '2018-01-25'
        }
    }, callback);
}

function getQotD(callback)
{
    return request({
        url: 'https://talaikis.com/api/quotes/random/',
        method: 'GET',
        //encoding: 'utf8',
        //timeout: this.timeout,
        headers: {
            'User-Agent': this.name + ' ' + this.classVersion,
            'Accept': 'application/json'
        }
    }, callback);
}

var last_minute_handled = -1;
const intervalObj = setInterval(() => {

    //var current_minute;
    var day_offset = 0;
    var nowDate = new Date();
    var current_hour = nowDate.getHours();
    var current_minute = nowDate.getMinutes();

    if(current_minute != last_minute_handled)
    {
        var currentMinMod5 = current_minute % 5;
        last_minute_handled = current_minute;

        //console.log(current_hour + ':' +current_minute)
        if(currentMinMod5 == 0)
        {
            getQotD(function(err,res,body)
            {
                if(err)
                    console.log('error: ' + err);
                else
                {
                    var quoteResponse = JSON.parse(body);
                    goldenMessenger.SetMessage(goldenMessenger.MSG_QOTD_AUTHOR_IDX, quoteResponse.author );
                    goldenMessenger.SetMessage(goldenMessenger.MSG_QOTD_QUOTE_IDX, quoteResponse.quote);

                }
            });
        }
        //if(currentMinMod5 == 1)
        {
            getCoinbaseSpotPrice('BTC-USD', function(err,res,body){

                if(err)
                    console.log('error: ' + err);
                else{
                    const TimedPrice = mongoose.model("TimedPriceModel");
                    var priceData = JSON.parse(body).data;
                    goldenMessenger.SetMessage(goldenMessenger.MSG_COINBASE_BTC_IDX, priceData.amount);
                }
            });

            getCoinbaseSpotPrice('ETH-USD', function(err,res,body){

                if(err)
                    console.log('error: ' + err);
                else{
                    const TimedPrice = mongoose.model("TimedPriceModel");
                    var priceData = JSON.parse(body).data;
                    goldenMessenger.SetMessage(goldenMessenger.MSG_COINBASE_ETH_IDX, priceData.amount);
                }
            });
        }
                
    }

  
}, 5000);


module.exports = app;
