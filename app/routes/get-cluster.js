const express = require('express');
const router = express.Router();
const mysql = require('mysql');
var http = require('http');
var dict = new Object();
var iamfail = "Invalid IAM";
var iam_redirection = "https://console.cloud.vmware.com/csp/gateway/portal/#/onboarding/registration/signup?username="

dict["acf0da4c-a008-4b36-a2c3-469acd73c487"] = "0f302014-3dba-4b30-82da-2c946ccc57ae"


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

function run_python (args, callback){
    var result = '';
    const spawn = require("child_process").spawn;
    const pyFile = 'node_js.py';
    args.unshift(pyFile);
    const pyspawn = spawn('python3', args);
    pyspawn.stderr.on('data', (data) => {
        console.log(`stderr_xgao: ${data}`);
        result += data.toString();
    });
    pyspawn.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    pyspawn.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        return callback(result);
    });
}


router.post("/get-user-cluster", (req, res) => {
    const email = req.body.check_email;
    var retrivedEmail;
    var availCluster;
    var retrivedEmailCluster;
    var final_result;
    const queryEmail = 'SELECT * FROM users WHERE email = ?';
    const queryAvailableCluster = 'SELECT * FROM clusters WHERE clusters_email IS NULL LIMIT 1';
    const querySetEmailCluster = "UPDATE clusters SET clusters_email = ? WHERE id = ? ";
    const queryEmailCluster = 'SELECT * from clusters WHERE clusters_email = ?';

    getConnection().query(queryEmail, [email], (err, data, fields) => {

        try {
            if (err) {
                console.log("Failed to query for user email: " + err)
                return
            } 

            retrivedEmail = data[0].email;
            getConnection().query(queryEmailCluster, [retrivedEmail], (err, data, fields) => {
                if (err) {
                    console.log("Failed to query for email in cluster: " + err)
                    return
                }
                if (typeof data[0] !== 'undefined') {
                    console.log("User already assigned a cluster: " + data[0])
                    res.redirect('/failed-cluster-assign');       
                }
                else {
                    getConnection().query(queryAvailableCluster, (err, data, fields) => {
                    if (err) {
                          console.log("Failed to query for available cluster: " + err)
                          return
                     }
                     
                     if (typeof data[0] !== 'undefined') {
                        retrievedCluster = data[0].cluster;
                        retrievedOrg = data[0].org;
                        console.log("this is the retrived cluster and org for this email and token: " + retrievedCluster + retrievedOrg + dict[retrievedOrg])
                        const args = ["-o" + retrievedOrg + "", "-t" + dict[retrievedOrg] + "", "-u" + email + "", "-c" + retrievedCluster + "",  "-ayes"];
                        run_python (args, function(result) { 
                            console.log ("result is:" + result);
                            if (result !== '') {
                                 var ifail = result.includes(iamfail);
                                 if (ifail) {
                                        res.redirect ('/no-registration-failure');
//                                      res.writeHead(301, {Location: `${iam_redirection}${email}`});             
//                                      res.end();
                                  }
                                  else {
                                      res.redirect ('/no-cluster-failure');
                                  }
                            }
                            else { 
                                availCluster = data[0].id;
                                getConnection().query(querySetEmailCluster, [retrivedEmail, availCluster], (err, data, fields) => {
                                if (err) {
                                    console.log("Failed to query for assigning user email to available cluster: " + err)
                                    return
                                }  
                                res.redirect('/email-success');
                                });
                            }
                        })
                    }   
                    else {
                        console.log("no valid cluster found");
                        res.redirect('/no-cluster-available');
                   }
                   });
                }
            });
        }
        catch(err) {
            console.log('catch');
            return res.redirect('/email-error');
        }
    });
});

module.exports = router;
