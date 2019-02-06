

var path = require('path');
const passport = require('passport');
const Prometheus = require('prom-client') 
const metricsInterval = Prometheus.collectDefaultMetrics()

module.exports = function (app) {

    //sends the user the home.html file 
    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/get-cluster.html'));
    });

    app.get('/user-created', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/user-created.html'));
    });

    app.get('/get-cluster', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/get-cluster.html'));
    });

    app.get('/email-error', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/email-error.html'));
    });

    app.get('/email-success', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/email-success.html'));
    });

    app.get('/find-user', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/find-user.html'));
    });     
    app.get('/failed-cluster-assign', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/failed-cluster-assign.html'));
    });
    app.get('/find-cluster', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/find-cluster.html'));
    });
    app.get('/no-cluster-available', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/no-cluster-available.html'));
    });
    app.get('/no-cluster-failure', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/no-cluster-failure.html'));
    });
    app.get('/no-registration-failure', function (req, res) {
        res.sendFile(path.join(__dirname + '/../public/no-registration-failure.html'));
    });

    app.get('/auth/google', passport.authenticate('google',{scope: ['profile']}), (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/auth-login.html'));
    })

    app.get('/auth/login',  (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/auth-login.html'));
    })

    app.get('/auth/google/callback', function(req, res, next) {
        passport.authenticate('google', function(err, user) {
          
        //if admin isn't in the database
          if (!user) { 
              console.log('no access to this page')
              return res.redirect('/auth/no-access'); 
            }
        
        res.sendFile(path.join(__dirname + '/../public/form.html'));
        
    })(req, res, next);});
    
    app.get('/auth/no-access',  (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/no-access.html'));
    })

    app.get('/auth/logout',  (req, res) => {
        res.sendFile(path.join(__dirname + '/../public/auth-logout.html'));
    })

    app.get('/metrics', (req, res) => {
        res.set('Content-Type', Prometheus.register.contentType)
        res.end(Prometheus.register.metrics())
    })
};
