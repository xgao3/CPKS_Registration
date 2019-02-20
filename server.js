
const express = require('express');

const app = express();
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const passport = require('passport');
const passportSetup = require("./config/passport-setup");
const promBundle = require("express-prom-bundle");

const users = require('./app/routes/user.js');
const getClusters = require('./app/routes/get-cluster');
const queries = require('./app/routes/query');
const loaddb = require('./app/routes/loaddb');
const metricsMiddleware = promBundle({includeMethod: true, includePath: true});

app.use(metricsMiddleware);

app.use(bodyParser.urlencoded({extended: false}));
// able to view static files
app.use(express.static('app/public'));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
// Runs before each requests
app.use((req, res, next) => {
  res.locals.startEpoch = Date.now()
  next()
})

//gets the HTML file stored in htmlRoute.js so users sees display
require('./app/routes/htmlRoutes.js')(app);

// route to create db columns and rows
app.use(queries);
// route to creating users 
app.use(loaddb)
app.use(users);
app.use(getClusters);


// listening on port 
app.listen('1112', () => {
    console.log('Server started on port 1112');
});
