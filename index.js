const express = require("express");
const port = 3000;
const app = express();
const path = require('path');
const db = require('./Backend/connect_db')
const authRoute = require('./Backend/auth');
require('dotenv').config();

// define json parser 
app.use(express.json());

// serve files
app.use(express.static(path.join(__dirname, '/Public')));

// define routes
app.use('/api', authRoute);


//output in console -> if working, outputs the console.log
app.listen(port, function () {
    console.log("Listening on " + port);
});







