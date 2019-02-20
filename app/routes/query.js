
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
 
  let createTodos = `create table if not exists users(
                          full_name varchar(255)not null, 
                          position varchar(255)not null,
                          company varchar(255)not null, 
                          email varchar(255)not null,
                          PRIMARY KEY (email))`;
 
  let createCluster = `create table if not exists clusters(
                           clusters_email varchar(255),
                           id int primary key auto_increment,
                           cluster varchar(255),
                           org varchar(255))`;

  let createOrg = `create table if not exists orgs(
                 org varchar(255),
                 token varchar(255))`;      

  let createAdmin = `create table if not exists admin(
                 github_id varchar(255),
                 name varchar(255))`;

  connection.query(createTodos, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query(createCluster, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });
 
  connection.query(createOrg, function(err, results, fields) {
    if (err) {
      console.log(err.message);
    }
  });

  connection.query(createAdmin, function(err, results, fields) {
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
