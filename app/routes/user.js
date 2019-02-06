

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const client = require('prom-client');

const pool = mysql.createPool ({
     connectionLimit: 10,
     host: process.env.SQL_HOST,
     user: process.env.SQL_USER,
     password: process.env.MYSQL_ROOT_PASSWORD,
     database: process.env.SQL_DB
});
 
// enable default application metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
 
// custom prefix string for app metrics
collectDefaultMetrics({ prefix: 'x_db_query:' });
 
// a custom histogram metric which represents the latency
// of each call to our API .
const histogram = new client.Histogram({
  name: 'x_db_query:user_query_time_all_user',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'status_code'],
  buckets: [1, 3, 5, 7, 9, 11]
});

const histogram2 = new client.Histogram({
  name: 'x_db_query:user_query_time_single_user',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'status_code'],
  buckets: [1, 3, 5, 7, 9, 11]
});


// connection
function getConnection() {
    return pool
}

router.get("/users", (req, res) => {
    const connection = getConnection()
    const queryString = "SELECT * FROM users"
    const end = histogram.startTimer();
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to query for users: " + err)
        res.sendStatus(500)
        return
      } 
      res.json(rows)
      // stop the timer
      end({ method: req.method, status_code: res.statusCode });
    })
  });


router.get("/user", (req, res) => {
    const email = req.query.check_email;
    const connection = getConnection()
    const queryString = 'SELECT * FROM users WHERE email = ?';
    console.log ("executing check email" + email)
    const end2 = histogram2.startTimer();
    connection.query(queryString, [email], (err, rows, fields) => {
      if (err) {
        console.log("Failed to query for users: " + err)
        console.log("output is : " + rows)
        res.sendStatus(500)
        return
      }
      console.log("output is : " + rows)
      res.json(rows)
      end2({ method: req.method, 'status_code': res.statusCode });
    })
  });

router.get("/locate-cluster", (req, res) => {
    const email = req.query.check_email;
    const connection = getConnection()
    const queryString = 'SELECT * FROM clusters WHERE clusters_email = ?';
    console.log ("executing check email" + email)
    connection.query(queryString, [email], (err, rows, fields) => {
      if (err) {
        console.log("Failed to query for users: " + err)
        console.log("output is : " + rows)
        res.sendStatus(500)
        return
      }
      console.log("output is : " + rows)

      res.json(rows)
    })
  });

// adding new users to database
// posting new users to /user-create
router.post("/user-create", (req, res) => {

    const fullName = req.body.create_full_name;
    const position = req.body.create_position;
    const company = req.body.create_company;
    const email = req.body.create_email;

    fullName.toLowerCase();
    position.toLowerCase();
    company.toLowerCase();
    email.toLowerCase();

    const queryString = "INSERT INTO users (full_name, position, company, email) VALUES (?, ?, ?, ?)";

    getConnection().query(queryString, [fullName, position, company, email], (err, results, fields) => {
        if (err) {
            console.log("Failed to insert new user: " + err);
            if (err.errno==1062){
              res.redirect('/get-cluster')
              return
            }
            else{
              res.redirect('/failed-user-create')
              res.sendStatus(500);
              return
            } 
        }

        console.log("Inserted new user with id: " + results.insertId);
        res.redirect('/user-created');        
    });
});


module.exports = router;
