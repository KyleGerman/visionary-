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

module.exports = db;