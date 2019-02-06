
const express = require('express');
const router = express.Router();
let mysql = require('mysql');

let connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.SQL_DB
});
 
// connect to the MySQL server
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
 
  connection.query("create unique index email on users (full_name, position, company, email)",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query("create unique index cluster on clusters (cluster, org)",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query("create unique index org on orgs (org, token)",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query("create unique index org on orgs (org, token)",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query("LOAD DATA LOCAL INFILE ? IGNORE INTO TABLE users FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS", 
  "app/sampleuser.csv", 
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });
 
 connection.query("LOAD DATA LOCAL INFILE ? IGNORE INTO TABLE clusters FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS", 
 "app/samplecluster.csv",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

 connection.query("LOAD DATA LOCAL INFILE ? IGNORE INTO TABLE orgs FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS",
 "app/sampleorg.csv",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  }); 

 connection.query("LOAD DATA LOCAL INFILE ? IGNORE INTO TABLE admin FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS",
 "app/sampleadmin.csv",
  function(err) {
    if (err) {
      console.log(err.message);
    }
  });

 connection.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});

module.exports = router;
