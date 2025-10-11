const express = require("express");
const server = express();
const port = 3000;
const mysql = require("mysql2"); // changed from "mysql" → "mysql2"
require('dotenv').config();

//connection to the database
const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
 
// connect to MySQL
db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL: ", err);
        return;
    }
    console.log("Connected to MySQL database!");
});

//test route to output data from login table to http://localhost:3000/show
server.get('/show', (req, res) => {
    db.query("SELECT * FROM logins", (err, result) => {
        if (err)
        {
            console.log(err);
        }
        res.send(result);
    });
});

//Outputs the prompt when going to localhost:3000/hello route
server.get("/hello", function (req, res) {
    res.send("Hello World!");
});

//output in console -> if working, outputs the console.log
server.listen(port, function () {
    console.log("Listening on " + port);
});