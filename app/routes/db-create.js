
const express = require('express');
const router = express.Router();
let mysql = require('mysql');


let connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.MYSQL_ROOT_PASSWORD,
});

// connect to the MySQL server
connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.SQL_DB}`, function (err, result) {  
    if (err) throw err;  
      console.log("Database created");  
    });   
 
  connection.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
    });
});

module.exports = router;
