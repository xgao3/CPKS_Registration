
const passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
const keys = require('./keys');
const mysql = require('mysql');

const pool = mysql.createPool ({
    connectionLimit: 10,
    host: process.env.SQL_HOST,
    password: process.env.MYSQL_ROOT_PASSWORD,
    port : '3306',
    user: process.env.SQL_USER,
    database: process.env.SQL_DB
});

// connection
function getConnection() {
    return pool
}


passport.use(
    
    new GitHubStrategy({
    //options for google to start
    callbackURL: '/auth/github/callback',
    clientID: keys.github.clientID,
    clientSecret: keys.github.clientSecret

    }, (accessToken, refreshToken, profile, cb) =>{

        console.log(profile);

        const queryString = 'SELECT * FROM admin WHERE github_id = ?';   
    
        getConnection().query(queryString, [profile.id], (err, rows, fields) => {

        console.log(rows.length);

            if (rows.length) {

                console.log(rows[0].github_id);

                return cb(err, rows[0].github_id);

            } else {
                console.log('it occured here');
                return cb(null);
            }    
        
        });      

    })
 
)

// used to serialize the user for the session
passport.serializeUser(function(user, cb) {
    cb(null, user);
});

// used to deserialize the user
passport.deserializeUser(function(user, cb) {
    getConnection().query("SELECT * FROM admin WHERE github_id = ? ",[user], function(err, rows){
        cb(null, user);
    });
});
